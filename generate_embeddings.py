import pandas as pd
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Load the CSV
csv_file = "vehicles.csv"  # Replace with your CSV file path
df = pd.read_csv(csv_file)

# Create detailed descriptions with quantitative data and consistent formatting
def create_detailed_description(row):
    # Prepare quantitative attributes
    fuel_efficiency = f"{row['CityMPG']} city / {row['HighwayMPG']} highway MPG"
    if pd.isnull(row['HighwayMPG']):
        efficiency_label = "unknown fuel efficiency"
    elif row["HighwayMPG"] >= 35:
        efficiency_label = "high fuel efficiency"
    elif row["HighwayMPG"] >= 25:
        efficiency_label = "average fuel efficiency"
    else:
        efficiency_label = "low fuel efficiency"

    if pd.isnull(row['Miles']):
        mileage_label = "unknown mileage"
    elif row["Miles"] < 30000:
        mileage_label = "low mileage"
    elif row["Miles"] < 60000:
        mileage_label = "moderate mileage"
    else:
        mileage_label = "high mileage"

    if pd.isnull(row['SellingPrice']):
        price_label = "price not available"
    elif row["SellingPrice"] < 20000:
        price_label = "affordable price"
    elif row["SellingPrice"] < 40000:
        price_label = "moderate price"
    else:
        price_label = "premium price"

    # Handle possible None values for engine displacement and cylinders
    engine_displacement = f"{row['EngineDisplacement']}L" if pd.notnull(row['EngineDisplacement']) else "N/A"
    engine_cylinders = f"{row['EngineCylinders']}-cylinder engine" if pd.notnull(row['EngineCylinders']) else "engine"

    # Create a detailed description
    description = (
        f"{row['Year']} {row['Make']} {row['Model']} ({row['Body']}) with {mileage_label}\n"
        f"Exterior Color: {row['ExteriorColor']} | Interior Color: {row['InteriorColor']}\n"
        f"{engine_displacement} {engine_cylinders} | {row['Transmission']} transmission\n"
        f"Drivetrain: {row['Drivetrain']} | Fuel Type: {row['Fuel_Type']}\n"
        f"Fuel Efficiency: {fuel_efficiency} ({efficiency_label})\n"
        f"Passenger Capacity: {row['PassengerCapacity']} | Selling Price: ${row['SellingPrice']} ({price_label})\n"
        f"Certified: {'Yes' if row['Certified'] else 'No'}"
    )
    return description

# Apply the description function to each row and add it as a new column
df["description"] = df.apply(create_detailed_description, axis=1)

# Save the updated DataFrame back to the CSV (including the 'description' column)
df.to_csv(csv_file, index=False)

# Initialize the embedding model with a more powerful model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

# Generate embeddings for the descriptions
texts = df["description"].tolist()
metadata = df.drop(columns=["description"]).to_dict(orient="records")
ids = df.index.astype(str).tolist()

# Create the vector store with the embeddings
vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadata, ids=ids)

# Save the updated vector store for persistence
vectorstore.save_local("faiss_vehicle_index")
