from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify the origins you want to allow
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# MongoDB connection details
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)

# Connect to each region's database and its customers collection
region_databases = {
    "region_1": client["olist_database_region_1"]["customers"],
    "region_2": client["olist_database_region_2"]["customers"],
    "region_3": client["olist_database_region_3"]["customers"]
}

def build_query(zipRangeMin: int, zipRangeMax: int, city: Optional[str] = None, state: Optional[str] = None) -> Dict[str, Any]:
    # Create the base query with integer range for zip_code_prefix
    query: Dict[str, Any] = {
        "customer_zip_code_prefix": {"$gte": zipRangeMin, "$lte": zipRangeMax}
    }
    
    # Add city filter if provided
    if city:
        query["customer_city"] = {"$regex": city, "$options": "i"}  # MongoDB regex expects strings here
    
    # Add state filter if provided
    if state:
        query["customer_state"] = {"$regex": state, "$options": "i"}

    return query


# Sample data to simulate a database
mock_data = [
    {"customer_id": "49d0ea0986edde72da777f15456a0ee0", "customer_unique_id": "3e6fd6b2f0d499456a6a6820a40f2d79", "zip_code_prefix": 68485, "city": "Pacaja", "state": "PA"},
    {"customer_id": "1234abcd5678", "customer_unique_id": "abcd5678efgh", "zip_code_prefix": 12345, "city": "New York", "state": "NY"},
    {"customer_id": "9876efgh4321", "customer_unique_id": "ijkl9876mnop", "zip_code_prefix": 54321, "city": "Los Angeles", "state": "CA"},
    {"customer_id": "abcd1234efgh", "customer_unique_id": "mnop1234qrst", "zip_code_prefix": 67890, "city": "Chicago", "state": "IL"},
    {"customer_id": "lmno5678qrst", "customer_unique_id": "uvwx5678yzab", "zip_code_prefix": 11223, "city": "Miami", "state": "FL"},
    {"customer_id": "zxcv0987bnm5", "customer_unique_id": "abcd1234ijkl", "zip_code_prefix": 10234, "city": "Boston", "state": "MA"},
    {"customer_id": "asdf0987qwer", "customer_unique_id": "qrst5678uvwx", "zip_code_prefix": 45789, "city": "San Francisco", "state": "CA"},
    {"customer_id": "mnbv6543tyui", "customer_unique_id": "fghi5678jklm", "zip_code_prefix": 78901, "city": "Seattle", "state": "WA"},
    {"customer_id": "poiu0987lkjh", "customer_unique_id": "zxcv1234vbnm", "zip_code_prefix": 21345, "city": "Austin", "state": "TX"},
    {"customer_id": "wert5678asdf", "customer_unique_id": "nmkl8765hgfd", "zip_code_prefix": 43210, "city": "Denver", "state": "CO"},
    {"customer_id": "lkjh8765wert", "customer_unique_id": "bvcx5432nmkl", "zip_code_prefix": 65432, "city": "Phoenix", "state": "AZ"},
    {"customer_id": "hijk1234lmno", "customer_unique_id": "abcd5678efgh", "zip_code_prefix": 90876, "city": "San Diego", "state": "CA"},
    {"customer_id": "qrst0987lmno", "customer_unique_id": "mnop1234qrst", "zip_code_prefix": 67890, "city": "Las Vegas", "state": "NV"},
    {"customer_id": "zxcv5678plok", "customer_unique_id": "asdf1234hjkl", "zip_code_prefix": 10987, "city": "Dallas", "state": "TX"},
    {"customer_id": "mnbv8765hjk", "customer_unique_id": "lkjh4321vbnm", "zip_code_prefix": 56473, "city": "Orlando", "state": "FL"},
    {"customer_id": "asdf1234uiop", "customer_unique_id": "qwer0987lkjh", "zip_code_prefix": 78654, "city": "Atlanta", "state": "GA"},
    {"customer_id": "yuiop9876ghjk", "customer_unique_id": "zxcv0987hjkl", "zip_code_prefix": 67432, "city": "Charlotte", "state": "NC"},
    {"customer_id": "mnbvcxz12345", "customer_unique_id": "lkjhgf54321", "zip_code_prefix": 34210, "city": "Minneapolis", "state": "MN"},
    {"customer_id": "wert9876asdf", "customer_unique_id": "qwer1234hjkl", "zip_code_prefix": 54321, "city": "Portland", "state": "OR"},
    {"customer_id": "nmkl0987vbnm", "customer_unique_id": "asdf0987zxcv", "zip_code_prefix": 12345, "city": "Philadelphia", "state": "PA"},
    {"customer_id": "bvcx1234yuiop", "customer_unique_id": "plok0987wert", "zip_code_prefix": 67890, "city": "Detroit", "state": "MI"},
    {"customer_id": "lkjh4321dfgh", "customer_unique_id": "yuiop8765ghjk", "zip_code_prefix": 90876, "city": "Columbus", "state": "OH"},
    {"customer_id": "vbnm1234hjkl", "customer_unique_id": "zxcv7654mnbv", "zip_code_prefix": 10345, "city": "Nashville", "state": "TN"},
    {"customer_id": "uiop5432rtyu", "customer_unique_id": "wert4321lkjh", "zip_code_prefix": 45678, "city": "Kansas City", "state": "MO"},
    {"customer_id": "asdf1234wert", "customer_unique_id": "mnbv4321lkjh", "zip_code_prefix": 78901, "city": "Indianapolis", "state": "IN"},
    {"customer_id": "lkjh0987asdf", "customer_unique_id": "qwer8765hjkl", "zip_code_prefix": 23456, "city": "Raleigh", "state": "NC"},
    {"customer_id": "wert1234lkjh", "customer_unique_id": "asdf5678zxcv", "zip_code_prefix": 56789, "city": "Cleveland", "state": "OH"},
    {"customer_id": "yuiop9876ghjk", "customer_unique_id": "nmkl4321zxcv", "zip_code_prefix": 13579, "city": "St. Louis", "state": "MO"},
    {"customer_id": "qwer8765asdf", "customer_unique_id": "uiop4321nmkl", "zip_code_prefix": 97531, "city": "Cincinnati", "state": "OH"},
    {"customer_id": "hjkl0987plok", "customer_unique_id": "wert1234yuiop", "zip_code_prefix": 85246, "city": "Salt Lake City", "state": "UT"},
    # Add more as needed for a larger dataset
]


# Define the data model for incoming filter requests
class FilterRequest(BaseModel):
    zipRangeMin: int
    zipRangeMax: int
    city: Optional[str] = None
    state: Optional[str] = None

# Endpoint to filter records based on the criteria
@app.post("/filter-records")
async def filter_records(request: FilterRequest):
    # # Perform filtering based on provided criteria
    # filtered_records = [
    #     record for record in mock_data
    #     if record["zip_code_prefix"] >= request.zipRangeMin
    #     and record["zip_code_prefix"] <= request.zipRangeMax
    #     and (request.city.lower() in record["city"].lower() if request.city else True)
    #     and (request.state.lower() in record["state"].lower() if request.state else True)
    # ]

    # # Return filtered records
    # return filtered_records
    
    # Build MongoDB query
    query = build_query(
            zipRangeMin=request.zipRangeMin,
            zipRangeMax=request.zipRangeMax,
            city=request.city,
            state=request.state
        )

    # Now you can use this `query` in MongoDB's `find` method without type issues
    records = []
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

    # Return the records as a list
    if not records:
        raise HTTPException(status_code=404, detail="No records found")
    
    return records

# Root endpoint to check the server status
@app.get("/")
async def root():
    return {"message": "FastAPI server is running!"}
