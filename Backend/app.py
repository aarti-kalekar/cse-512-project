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

backup_map = {
    1: 3,
    2: 1,
    3: 2
}

def get_region(zipcode_prefix: int) -> Optional[str]:
    """Determines the region based on the zipcode prefix."""
    if 1000 <= zipcode_prefix <= 39999:  # Example range for Region 1
        return "region_1"
    elif 40000 <= zipcode_prefix <= 69999:  # Example range for Region 2
        return "region_2"
    elif 70000 <= zipcode_prefix <= 99999:  # Example range for Region 3
        return "region_3"
    return None


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

def to_bool_list(input_str):
    return [item.lower() == 'true' for item in input_str.split(',')]


@app.get("/filter-records")
async def filter_records(zipRangeMin: int, zipRangeMax: int, city: Optional[str] = None, state: Optional[str] = None, nodes: str = None):
    # Build MongoDB query
    query = build_query(
        zipRangeMin=zipRangeMin,
        zipRangeMax=zipRangeMax,
        city=city,
        state=state
    )
    nodes_list = to_bool_list(nodes)

    records = []
    res = {}

    if nodes_list[0] == True:
        res["region_1"] = client["olist_database_region_1"]["customers"]
    elif nodes_list[backup_map[1] - 1] == True:
        res["region_1_backup"] = client["olist_database_region_" +
                                        str(backup_map[1])]["customers_2"]

    if nodes_list[1] == True:
        res["region_2"] = client["olist_database_region_2"]["customers"]
    elif nodes_list[backup_map[2] - 1] == True:
        res["region_2_backup"] = client["olist_database_region_" +
                                        str(backup_map[2])]["customers_2"]

    if nodes_list[2] == True:
        res["region_3"] = client["olist_database_region_3"]["customers"]
    elif nodes_list[backup_map[3] - 1] == True:
        res["region_3_backup"] = client["olist_database_region_" +
                                        str(backup_map[3])]["customers_2"]

    for region_name, collection in res.items():
        count = await collection.count_documents(query)
        async for record in collection.find(query).limit(100):
            records.append({
                "customer_id": record.get("customer_id"),
                "customer_unique_id": record.get("customer_unique_id"),
                "customer_zip_code_prefix": record.get("customer_zip_code_prefix"),
                "customer_city": record.get("customer_city"),
                "customer_state": record.get("customer_state"),
                "region": region_name  # Optional: indicate which region the record is from
            })

    return {"records": records, "count": count}


@app.put("/sync-databases")
async def execute_customer_updates(nodes: str = None):
    nodes_list = to_bool_list(nodes)

    # Access the `olist_database_general` database and `customers_updates` collection
    updates_db = client["olist_database_general"]
    updates_collection = updates_db["customers_updates"]

    # Iterate through each document in the `customers_updates` collection
    async for update_doc in updates_collection.find():
        # Extract information from the document
        target_db_name = update_doc.get("dbname")  # Target database name
        target_col_name = update_doc.get("colname")  # Target collection name
        query = update_doc.get("query")  # Query for the upsert

        if nodes_list[int(target_db_name[-1]) - 1] == True:
            # Validate that all fields exist
            if not all([target_db_name, target_col_name, query]):
                print(f"Skipping invalid document: {update_doc}")
                continue

            # Access the target database and collection
            target_db = client[target_db_name]
            target_collection = target_db[target_col_name]

            # Perform the upsert operation
            try:
                # Upsert query: replace_one with upsert=True
                result = target_collection.replace_one(
                    filter=query.get("filter", {}),  # The filter criteria
                    replacement=query.get(
                        "replacement", {}),  # The new document
                    upsert=True  # Create the document if it doesn't exist
                )
                print(f"Upserted in {target_db_name}.{
                      target_col_name}: {result}")

                # Delete the processed record from customers_updates
                delete_result = await updates_collection.delete_one({"_id": update_doc["_id"]})
                print(f"Deleted record from customers_updates: {
                      update_doc['_id']}")
                if delete_result.deleted_count > 0:
                    print(f"Deleted record from customers_updates: {
                          update_doc["_id"]}")
                else:
                    print(f"Failed to delete record: {update_doc["_id"]}")
            except Exception as e:
                print(f"Error processing document {update_doc}: {e}")


class UpdateRequest(BaseModel):
    customerId: str  # Mandatory: Unique identifier for the customer
    # Optional: Unique identifier for the customer
    customerUniqueId: Optional[str] = None
    zipCodePrefix: Optional[int] = None  # New zip code prefix field
    city: Optional[str] = None
    state: Optional[str] = None


@app.put("/update-record")
async def update_record(request: UpdateRequest, nodes: str = None):
    # Search query based solely on customer_id
    query = {"customer_id": request.customerId}

    # Prepare the fields to update or create
    update_data = {
        "customer_id": request.customerId,  # Include customer_id in case of creation
        "customer_unique_id": request.customerUniqueId,
    }
    if request.zipCodePrefix is not None:
        update_data["customer_zip_code_prefix"] = str(
            request.zipCodePrefix)  # Ensure stored as string
    if request.city:
        update_data["customer_city"] = request.city
    if request.state:
        update_data["customer_state"] = request.state

    # Update or create operation with upsert
    update_operation = {"$set": update_data}
    total_upserted = 0
    updated_regions = []

    nodes_list = to_bool_list(nodes)

    region_name = get_region(request.zipCodePrefix)

    res = {}
    if nodes_list[int(region_name[-1]) - 1] == True:
        res[region_name] = region_databases.get(region_name)
    else:
        client["olist_database_general"]["customers_updates"].insert_one(
            {
                "dbname": "olist_database_" + region_name,
                "colname": "customers",
                "query": {
                    "filter": query,
                    "replacement": update_data
                }
            }
        )

    if nodes_list[backup_map[int(region_name[-1])] - 1] == True:
        res[region_name + "_backup"] = client["olist_database_region_" +
                                              str(backup_map[int(region_name[-1])])]["customers_2"]
    else:
        client["olist_database_general"]["customers_updates"].insert_one(
            {
                "dbname": "olist_database_region_" + str(backup_map[int(region_name[-1])]),
                "colname": "customers_2",
                "query": {
                    "filter": query,
                    "replacement": update_data
                }
            }
        )
    for region_name, collection in res.items():
        result = await collection.update_one(query, update_operation, upsert=True)
        if result.matched_count > 0 or result.upserted_id:
            total_upserted += 1
            updated_regions.append(region_name)

        if total_upserted == 0:
            raise HTTPException(
                status_code=500, detail="Failed to update or create record")

    return {
        "message": "Record updated successfully" if total_upserted > 0 else "Record created successfully",
        "customer_id": request.customerId,
        "fields_processed": update_data,
        "regions_affected": updated_regions,
    }


@app.delete("/delete-record")
async def delete_record(customerId: str):
    total_deleted = 0

    for region_name, collection in region_databases.items():
        result = await collection.delete_one({"customer_id": customerId})
        total_deleted += result.deleted_count

    if total_deleted == 0:
        raise HTTPException(
            status_code=404, detail="No record found with the given customer_id")

    return {"message": "Record deleted successfully", "customer_id": customerId}


# Root endpoint to check the server status
@app.get("/")
async def root():
    return {"message": "FastAPI server is running!"}
