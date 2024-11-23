# chat_application.py

import os
import pandas as pd
from dotenv import load_dotenv
import textwrap
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Ensure parallelism is disabled for tokenizers
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Load environment variables
load_dotenv()

# Load FAISS vector store with the updated embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
vectorstore = FAISS.load_local("faiss_vehicle_index", embeddings, allow_dangerous_deserialization=True)

# Initialize Groq chat model
chat = ChatGroq(
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.2-90b-vision-preview"
)

# Define system and human messages
system = (
    "You are a helpful assistant with access to a database of vehicle descriptions. "
    "Engage in a conversational manner, keeping track of the user's queries and your responses within the current session. "
    "When answering follow-up questions, refer to previous exchanges to provide relevant context."
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

# Session memory
conversation_history = []

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

            # Format results for the assistant
            formatted_results = "\n".join(
                f"{i+1}. {result.page_content}"
                for i, result in enumerate(search_results)
            )

            # Include previous queries and responses for context
            session_context = "\n".join(
                f"User: {entry['query']}\nAssistant: {entry['response']}"
                for entry in conversation_history
            )

            # Get response from the assistant
            response = chain.invoke({
                "query": f"{session_context}\nUser: {user_input}",
                "results": formatted_results
            })

            # Save the current query and response to session history
            conversation_history.append({
                "query": user_input,
                "response": response.content
            })

            print(f"\nAssistant: {response.content}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    chat_with_user()
