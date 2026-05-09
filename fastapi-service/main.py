import os
from datetime import datetime, timezone

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

app = FastAPI(title="Coffee Counter Stats Service")

mongo_client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
mongo_db = mongo_client[os.getenv("MONGODB_DB", "coffee_counter_stats")]
stats_collection = mongo_db[os.getenv("MONGODB_COLLECTION", "stats_snapshots")]


def get_postgres_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=os.getenv("POSTGRES_PORT", "5432"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "postgres"),
        dbname=os.getenv("POSTGRES_DB", "coffee_counter"),
    )


def compute_stats_from_postgres():
    connection = get_postgres_connection()
    cursor = connection.cursor()

    cursor.execute('SELECT COUNT(*) FROM "coffees";')
    total = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM "coffees" WHERE "createdAt"::date = CURRENT_DATE;')
    today = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT type
        FROM "coffees"
        GROUP BY type
        ORDER BY COUNT(*) DESC, type ASC
        LIMIT 1;
        """
    )
    favourite_row = cursor.fetchone()
    favourite = favourite_row[0] if favourite_row else "none"

    cursor.close()
    connection.close()

    return {
        "total": total,
        "today": today,
        "favourite": favourite,
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fastapi-stats"}


@app.get("/debug/postgres")
def check_postgres_connection():
    connection = get_postgres_connection()
    cursor = connection.cursor()

    cursor.execute('SELECT COUNT(*) FROM "coffees";')
    coffee_count = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return {
        "postgres": "connected",
        "coffeeCount": coffee_count,
    }


@app.get("/debug/mongodb")
async def check_mongodb_connection():
    await mongo_client.admin.command("ping")

    return {
        "mongodb": "connected",
        "database": os.getenv("MONGODB_DB", "coffee_counter_stats"),
        "collection": os.getenv("MONGODB_COLLECTION", "stats_snapshots"),
    }


@app.post("/stats/snapshot")
async def create_stats_snapshot():
    stats = compute_stats_from_postgres()

    snapshot = {
        **stats,
        "savedAt": datetime.now(timezone.utc),
    }

    result = await stats_collection.insert_one(snapshot)

    return {
        "snapshotId": str(result.inserted_id),
        "total": snapshot["total"],
        "today": snapshot["today"],
        "favourite": snapshot["favourite"],
        "savedAt": snapshot["savedAt"].isoformat(),
    }


@app.get("/stats/summary")
async def get_stats_summary():
    latest_snapshot = await stats_collection.find_one(sort=[("savedAt", -1)])

    if not latest_snapshot:
        return {
            "total": 0,
            "today": 0,
            "favourite": "none",
        }

    return {
        "total": latest_snapshot["total"],
        "today": latest_snapshot["today"],
        "favourite": latest_snapshot["favourite"],
    }