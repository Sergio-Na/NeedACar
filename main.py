from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import textwrap
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Load environment variables
load_dotenv()

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

# Conversational loop
def chat_with_user():
    print("Hello! Ask me anything about the vehicles database or type 'quit' to exit.")
    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in ["quit", "exit"]:
            print("Goodbye!")
            break
        
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
            print(f"\nAssistant: {response.content}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    chat_with_user()
