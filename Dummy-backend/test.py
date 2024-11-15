import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional

# MongoDB connection details
MONGO_DETAILS = "mongodb://localhost:27017"  # Adjust if needed

# Define MongoDB client and database collections
client = AsyncIOMotorClient(MONGO_DETAILS)

print(client)

# Connect to each region's database and customers collection
region_databases = {
    "region_1": client["olist_database_region_1"]["customers"],
    "region_2": client["olist_database_region_2"]["customers"],
    "region_3": client["olist_database_region_3"]["customers"]
}

# Function to build the query based on input parameters
def build_query(zipRangeMin: int, zipRangeMax: int, city: Optional[str] = None, state: Optional[str] = None) -> Dict[str, Any]:
    query:Dict[str, Any] = {
        "customer_zip_code_prefix": {"$gte": zipRangeMin, "$lte": zipRangeMax}
    }
    if city:
        query["customer_city"] = {"$regex": city, "$options": "i"}  # Case-insensitive match
    if state:
        query["customer_state"] = {"$regex": state, "$options": "i"}  # Case-insensitive match
    return query

# Asynchronous function to filter records in MongoDB
async def filter_records(zipRangeMin: int, zipRangeMax: int, city: Optional[str] = None, state: Optional[str] = None) -> List[Dict[str, Any]]:
    query = build_query(zipRangeMin, zipRangeMax, city, state)
    print("Generated MongoDB query:", query)  # Debugging output
    records = []
    
    # Query each region's customers collection
    for region_name, collection in region_databases.items():
        async for record in collection.find(query):
            records.append({
                "customer_id": record.get("customer_id"),
                "customer_unique_id": record.get("customer_unique_id"),
                "zip_code_prefix": record.get("customer_zip_code_prefix"),
                "city": record.get("customer_city"),
                "state": record.get("customer_state"),
                "region": region_name  # Optional: indicate which region the record is from
            })
    
    return records

# Main function to run the filter as a standalone script
async def main():
    # Example request data
    example_request = {
        "zipRangeMin": 0,
        "zipRangeMax": 99999,
        "city": "Sao Paulo",
        "state": "SP"
    }

    # Run the filter function with example request data
    results = await filter_records(
        zipRangeMin=example_request["zipRangeMin"],
        zipRangeMax=example_request["zipRangeMax"],
        city=example_request.get("city"),
        state=example_request.get("state")
    )

    # Print results
    print("Filtered records:", results)

# Run the script
if __name__ == "__main__":
    asyncio.run(main())
