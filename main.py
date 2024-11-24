# main.py

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
    "Engage in a conversational manner, keeping track of the user's queries and your responses within the current session. "
    "You can ask follow up questions to the user in order to further refine the search. "
    "When answering follow-up questions, refer to previous exchanges to provide relevant context. "
    "In your responses do not include vehicles you decided to exclude. "
    "If a new question is unrelated to previous conversations, disregard previous context. Always be clear and concise in your responses."
    "Make your answers more in a bullet point format. "
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
conn = sqlite3.connect(':memory:')
df.to_sql('cars', conn, index=False, if_exists='replace')
# Session memory
conversation_history = []

# Conversational loop
def chat_with_user():
    print("Hello! Ask me anything about the vehicles database or type 'quit' to exit.")

    # ex: "show me a car that is before 2015, less than 30'000$ and automatic transmission"
    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in ["quit", "exit"]:
            print("Goodbye!")
            break

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

            sql_query = generate_sql_from_input(enriched_user_input, sqlChat)

            print("Query is: ", sql_query)
        
            try:
                # Execute the SQL query to filter the dataframe
                filtered_df = pd.read_sql_query(sql_query.content, conn)

                # Extract relevant columns for the vector store
                texts = filtered_df["description"].tolist()
                metadata = filtered_df.drop(columns=["description"]).to_dict(orient="records")

                # Build the vector store from the filtered results
                vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadata)
            except Exception as e:

                # Fallback to using the whole dataset
                texts = df["description"].tolist()
                metadata = df.drop(columns=["description"]).to_dict(orient="records")

                # Build the vector store from the entire dataset
                vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadata)


            # Perform similarity search (limit results to k=3)
            # Include session context in the similarity search to provide more context-aware results
            enriched_query = enriched_user_input if is_follow_up else user_input
            search_results = vectorstore.similarity_search(enriched_query, k=3)

            # Format results for the assistant
            formatted_results = "\n".join(
                f"{i+1}. {result.page_content}"
                for i, result in enumerate(search_results)
            )

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
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    chat_with_user()
