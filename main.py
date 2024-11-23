# chat_application.py

import os
import pandas as pd
from dotenv import load_dotenv
import textwrap
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import textwrap
from inputSql import generate_sql_from_input
import pandas as pd
import sqlite3

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

# Load the data
df = pd.read_csv('vehicles.csv')
conn = sqlite3.connect(':memory:')
df.to_sql('cars', conn, index=False, if_exists='replace')

# Conversational loop
def chat_with_user():
    print("Hello! Ask me anything about the vehicles database or type 'quit' to exit.")

    # ex: "how me a car that is before 2015, less than 30'000$ and automatic transmission"
    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in ["quit", "exit"]:
            print("Goodbye!")
            break

        try:
            sql_query = generate_sql_from_input(user_input, sqlChat)
            print("Query is: ", sql_query)

            filtered_df = pd.read_sql_query(sql_query.content, conn)
            texts = filtered_df["description"].tolist()
            metadata = filtered_df.drop(columns=["description"]).to_dict(orient="records")
            vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadata)

            # Perform similarity search (limit results to k=3)
            search_results = vectorstore.similarity_search(user_input, k=3)

            # Format results for the assistant
            formatted_results = "\n".join(
                f"{i+1}. {result.page_content}"
                for i, result in enumerate(search_results)
            )

            # Get response from the assistant
            response = chain.invoke({"query": user_input, "results": formatted_results})
            print(f"\nAssistant: {response.content}")
        except Exception as e:
            raise e
            print(f"Error: {e}")

if __name__ == "__main__":
    chat_with_user()
