# Distributed Database Management System for Region-Specific Data

This project is a **Distributed Database Management System** designed for efficient management of customer data across multiple regional databases. It allows the system to handle node availability dynamically, ensuring that data operations such as creating records are logged, replicated, and recovered efficiently using **Kafka** for messaging and **Redis** for storing node statuses.

The system leverages a **FastAPI-based middleware** to facilitate seamless interactions between the frontend and backend, while handling node unavailability gracefully by logging data to Kafka and processing it when the nodes come back online. Additionally, **MongoDB** serves as the primary database system, with cross-region replication for data redundancy and fault tolerance.

---

## Key Features

- **Dynamic Node Status Management**: Node statuses are managed using Redis, allowing real-time updates to node availability.
- **Kafka for Logging Unavailable Nodes**: When a node is unavailable, customer records are logged to Kafka for later processing.
- **Cross-Region Replication**: Ensures data redundancy by replicating data across regional databases.
- **Efficient Middleware**: FastAPI-based backend efficiently routes data and handles recovery operations.
- **Streamlined Frontend**: A user-friendly interface for viewing and creating customer records with node status displayed dynamically.

---

## Why Use Kafka and Redis?

### Kafka:
- **Reliable Logging**: Ensures no data is lost during node downtime by logging to topics for each unavailable node.
- **Asynchronous Processing**: Processes Kafka messages only when nodes become available, ensuring efficient recovery.

### Redis:
- **Real-Time Updates**: Stores and retrieves node statuses instantly for dynamic routing.
- **Persistence**: Retains node statuses across application restarts.

---

## Setup Instructions

### Prerequisites

- **Docker**: Ensure Docker is installed and running.
- **Kafka and Redis**: Ensure Kafka and Redis are available via Docker or local installation.
- **Python 3.9+**

---

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

#### 2. Set Up the Python Environment
```bash
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following content:
```env
KAFKA_BOOTSTRAP_SERVER=localhost:9092
REDIS_HOST=localhost
REDIS_PORT=6379
MONGO_URI=mongodb://localhost:27017
FASTAPI_PORT=8000
```

#### 4. Start Services Using Docker Compose
Ensure Docker is running, then execute:
```bash
docker compose up
```

#### 5. Start the Backend
```bash
python app/main.py
```

#### 6. Access the Frontend
Open the following URLs in your browser:
- **Create Records**: `http://localhost:8000/create-records`
- **View Records**: `http://localhost:8000/view-records`

---

## Usage Instructions

### Frontend
- **Node Management**: View real-time statuses of nodes using sliding switches.
- **Create Records**: Add customer data dynamically, with unavailability logged to Kafka.
- **View Records**: Query and view customer data across regions, leveraging alternate databases during downtime.

### Backend API Endpoints
- **Node Status**:
  - `POST /node-status`: Update the status of a node (available/unavailable).
- **Customer Records**:
  - `POST /create-customer`: Create a customer record, with fallback for unavailable nodes.
  - `GET /filter-records`: Query customer records with filters.

---

## Contribution Guidelines

Contributions are welcome! If you'd like to contribute:
1. Open an issue to discuss your proposal.
2. Fork the repository and create a feature branch.
3. Submit a pull request with a clear description of your changes.

For any questions, feel free to reach out!
