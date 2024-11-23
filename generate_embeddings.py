from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import pandas as pd

# Load the CSV
csv_file = "vehicles.csv"  # Replace with your CSV file path
df = pd.read_csv(csv_file)

# Define columns for embedding
columns_to_embed = [
    "Year", "Make", "Model", "Body", "ExteriorColor", "InteriorColor", "Miles",
    "EngineDisplacement", "EngineCylinders", "Drivetrain", "Fuel_Type", 
    "CityMPG", "HighwayMPG", "Certified"
]

# Create detailed descriptions with explicit focus on fuel efficiency
def create_detailed_description(row):
    fuel_efficiency = f"{row['CityMPG']} city / {row['HighwayMPG']} highway MPG"
    efficiency_label = "high fuel efficiency" if row["HighwayMPG"] >= 35 else "average fuel efficiency"
    
    return (
        f"{row['Year']} {row['Make']} {row['Model']} ({row['Body']})\n"
        f"Exterior: {row['ExteriorColor']}, Interior: {row['InteriorColor']}\n"
        f"Miles: {row['Miles']}, Engine: {row['EngineDisplacement']}L {row['EngineCylinders']} cylinders\n"
        f"Drivetrain: {row['Drivetrain']}, Fuel Type: {row['Fuel_Type']}\n"
        f"Fuel Efficiency: {fuel_efficiency} ({efficiency_label})\n"
        f"Certified: {row['Certified']}"
    )

df["description"] = df.apply(create_detailed_description, axis=1)

# Initialize the embedding model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Generate embeddings for the descriptions
texts = df["description"].tolist()
metadata = df.drop(columns=["description"]).to_dict(orient="records")
vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadata)

# Save vector store for persistence
vectorstore.save_local("faiss_vehicle_index")
