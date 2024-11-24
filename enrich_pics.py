import pandas as pd
import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Load the CSV file
input_csv = "vehicles.csv"  # Replace with your file path
api_url = "https://api.bing.microsoft.com/v7.0/images/search"
subscription_key = os.getenv("BING_API_KEY")  # Replace with your actual Bing API key

def fetch_car_image(make, model, year):
    """Fetch a car image URL from Bing Image Search API based on make, model, and year."""
    try:
        query = f"{year} {make} {model} car"
        headers = {"Ocp-Apim-Subscription-Key": subscription_key}
        params = {"q": query, "count": 1}
        response = requests.get(api_url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        if data["value"]:
            return data["value"][0]["contentUrl"]
        return None
    except Exception as e:
        print(f"Error fetching image for {year} {make} {model}: {e}")
        return None

def process_csv(input_csv):
    """Process the CSV to add car image URLs."""
    # Read the CSV
    df = pd.read_csv(input_csv)

    # Add a new column for image links
    links = []
    for index, row in df.iterrows():
        make, model, year = row["Make"], row["Model"], row["Year"]
        print(f"Processing row {index + 1}/{len(df)}: {year} {make} {model}")
        image_link = fetch_car_image(make, model, year)
        links.append(image_link)
        if image_link:
            print(f"Image found: {image_link}")
        else:
            print("No image found or error occurred.")

    df["Image_Link"] = links
    
    # Save the updated CSV
    df.to_csv(input_csv, index=False)
    print(f"Updated CSV saved to {input_csv}")

# Run the processing
process_csv(input_csv)