from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
from dotenv import load_dotenv
import textwrap
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import sqlite3
from inputSql import generate_sql_from_input
import numpy as np  # For NaN checking

# Ensure parallelism is disabled for tokenizers
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# Load FAISS vector store with the updated embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
vectorstore = FAISS.load_local("faiss_vehicle_index", embeddings, allow_dangerous_deserialization=True)

# Initialize Groq chat model
chat = ChatGroq(
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.2-90b-vision-preview"
)

# Initialize Groq chat model for SQL query gen
sqlChat = ChatGroq(
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.2-90b-vision-preview",
)

# Initialize the embedding model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Define system and human messages
system = (
    "You are a helpful assistant with access to a database of vehicle descriptions. "
    "Engage in a conversational manner, keeping track of the user's queries and your responses within the current session. "
    "When answering follow-up questions, refer to previous exchanges to provide relevant context. "
    "If a new question is unrelated to previous conversations, disregard previous context. Always be clear and concise in your responses."
    "If you encounter values that do not make sense (examples include: null values or prices that are $0), you can ignore them."
    "DO NOT USE VALUES THAT HAVE NO PRICE OR THEIR PRICE IS 0$. DO NOT EVEN INCLUDE IT IN YOUR RESPONSE."
)

human = (
    "User query: '{query}'.\n"
    "Relevant matches from the database:\n"
    "{results}\n"
    "Use the matches to provide a conversational and context-aware response to the user."
)

# Create a prompt template
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

# Define the chain by combining the prompt with the chat model
chain = prompt | chat

# Load the data
df = pd.read_csv('vehicles.csv')
conn = sqlite3.connect('data.db')
df.to_sql('cars', conn, index=False, if_exists='replace')
conn.close()

# Session memory
conversation_history = []

# Function to sanitize metadata
def sanitize_metadata(metadata):
    """Recursively sanitize metadata by replacing invalid JSON values."""
    if isinstance(metadata, list):
        return [sanitize_metadata(item) for item in metadata]
    elif isinstance(metadata, dict):
        return {
            key: sanitize_metadata(value) for key, value in metadata.items()
        }
    elif isinstance(metadata, (float, int)) and np.isnan(metadata):
        return None  # Replace NaN with None (null in JSON)
    return metadata

@app.route('/api/chat', methods=['DELETE'])
def reset_chat():
    conversation_history.clear()
    return jsonify({'status': 'success'})

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json()
    user_input = data.get('message', '').strip()
    if not user_input:
        return jsonify({'error': 'No message provided.'}), 400
    try:
        # Determine if the user query is a follow-up or a new query
        is_follow_up = "follow-up" in user_input.lower() or (len(conversation_history) > 0 and not user_input.lower().startswith(('new', 'reset', 'start over')))
        session_context = ""
        enriched_user_input = user_input

        if is_follow_up:
            # Include the last 6 queries and responses for context
            session_context = "\n".join(
                f"User: {entry['query']}\nAssistant: {entry['response']}"
                for entry in conversation_history[-6:]
            )
            enriched_user_input = f"{session_context}\nUser: {user_input}"

        # Generate SQL query
        sql_query = generate_sql_from_input(enriched_user_input, sqlChat)
        print("Query is: ", sql_query.content)

        # Execute SQL query on the database
        conn = sqlite3.connect('data.db')
        filtered_df = pd.read_sql_query(sql_query.content, conn)
        conn.close()

        # Prepare vector store for similarity search
        texts = filtered_df["description"].tolist()
        metadata = filtered_df.drop(columns=["description"]).to_dict(orient="records")
        if len(texts) > 0:
            # Create vectorstore with texts and metadata
            vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadata)

            # Perform similarity search (limit results to k=3)
            enriched_query = enriched_user_input if is_follow_up else user_input
            search_results = vectorstore.similarity_search(enriched_query, k=3)

            # Extract metadata from the results
            metadata_results = [sanitize_metadata(result.metadata) for result in search_results]

            # Format results for the assistant
            formatted_results = "\n".join(
                f"{i+1}. {result.page_content}"
                for i, result in enumerate(search_results)
            )
        else:
            formatted_results = "No relevant matches found."
            metadata_results = []

        # Get response from the assistant
        response = chain.invoke({
            "query": enriched_user_input,
            "results": formatted_results
        })

        # Save the current query and response to session history
        conversation_history.append({
            "query": user_input,
            "response": response.content
        })

        print(f"\nAssistant: {response.content}")

        # Return response and sanitized metadata in separate keys
        response_data = {
            'response': response.content,
            'metadata': metadata_results
        }

        return jsonify(response_data)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
