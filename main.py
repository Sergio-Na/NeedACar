# main.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import textwrap

from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# Load FAISS vector store with safe deserialization
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("faiss_vehicle_index", embeddings, allow_dangerous_deserialization=True)

# Initialize Groq chat model
chat = ChatGroq(
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="mixtral-8x7b-32768"
)

# Define system and human messages
system = (
    "You are a helpful assistant with access to a database of vehicle descriptions. "
    "When given a user query and a list of relevant matches, analyze the matches and provide a detailed yet concise response. "
    "Use the information from the matches to directly address the user's query, highlighting only the most relevant details."
)

human = (
    "User query: '{query}'.\n"
    "Relevant matches from the database:\n"
    "{results}\n"
    "Based on the matches, provide a conversational response addressing the user's query explicitly."
)

# Create a prompt template
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

# Define the chain by combining the prompt with the chat model
chain = prompt | chat

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json()
    user_input = data.get('message', '').strip()
    if not user_input:
        return jsonify({'error': 'No message provided.'}), 400

    try:
        # Perform similarity search (limit results to k=3)
        search_results = vectorstore.similarity_search(user_input, k=3)

        # Format results for the Groq model
        formatted_results = "\n".join(
            f"{i+1}. {textwrap.shorten(result.page_content, width=150, placeholder='...')} | "
            f"Metadata: {result.metadata}"
            for i, result in enumerate(search_results)
        )

        # Get response from Groq model
        response = chain.invoke({"query": user_input, "results": formatted_results})
        assistant_response = response.content

        return jsonify({'response': assistant_response})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
