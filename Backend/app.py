from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Adjust this to specify the origins you want to allow
    allow_origins=["*"],
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
        "customer_zip_code_prefix": {"$gte": str(zipRangeMin), "$lte": str(zipRangeMax)}
    }

    # Add city filter if provided
    if city:
        # MongoDB regex expects strings here
        query["customer_city"] = {"$regex": city, "$options": "i"}

    # Add state filter if provided
    if state:
        query["customer_state"] = {"$regex": state, "$options": "i"}

    return query

# Define the data model for incoming filter requests
class FilterRequest(BaseModel):
    zipRangeMin: int
    zipRangeMax: int
    city: Optional[str] = None
    state: Optional[str] = None

# Endpoint to filter records based on the criteria


@app.get("/filter-records")
async def filter_records(zipRangeMin: int, zipRangeMax: int, city: Optional[str] = None, state: Optional[str] = None):
    # Build MongoDB query
    query = build_query(
        zipRangeMin=zipRangeMin,
        zipRangeMax=zipRangeMax,
        city=city,
        state=state
    )
    print(query)
    # Now you can use this `query` in MongoDB's `find` method without type issues
    records = []
    for region_name, collection in region_databases.items():
        count = await collection.count_documents(query)
        async for record in collection.find(query).limit(20):
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

    return {"records": records, "count": count}

# Root endpoint to check the server status


@app.get("/")
async def root():
    return {"message": "FastAPI server is running!"}
