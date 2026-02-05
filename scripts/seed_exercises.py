#!/usr/bin/env python3
"""
Idempotent seed script for exercises.

Reads exercises from backend/api/fixtures/workouts.json and inserts them into
the database using INSERT ... ON CONFLICT DO NOTHING.

Usage:
    export DATABASE_URL=postgresql://user:pass@localhost/dbname
    python scripts/seed_exercises.py
"""

import json
import os
import sys
import psycopg2
from pathlib import Path

def seed_exercises():
    """Load exercises from fixtures and seed database."""

    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)

    # Load fixtures
    # When running in Docker, script is at /scripts/seed_exercises.py
    # When running locally, script is at scripts/seed_exercises.py
    # Fixtures are at backend/api/fixtures/workouts.json
    fixtures_path = Path("/code/api/fixtures/workouts.json")
    if not fixtures_path.exists():
        # Fallback for local development
        fixtures_path = Path(__file__).parent.parent / "backend" / "api" / "fixtures" / "workouts.json"
    if not fixtures_path.exists():
        print(f"ERROR: Fixtures file not found: {fixtures_path}")
        sys.exit(1)

    with open(fixtures_path, "r") as f:
        fixtures = json.load(f)

    # Connect to database
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
    except psycopg2.Error as e:
        print(f"ERROR: Failed to connect to database: {e}")
        sys.exit(1)

    # Insert exercises with ON CONFLICT DO NOTHING (idempotent)
    inserted_count = 0
    duplicate_count = 0

    for fixture in fixtures:
        if fixture.get("model") != "api.exercise":
            continue

        fields = fixture["fields"]

        # Build INSERT statement
        insert_sql = """
            INSERT INTO api_exercise
            (name, category, metric1_name, metric1_units, metric2_name, metric2_units)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (name) DO NOTHING
        """

        values = (
            fields["name"],
            fields.get("category", "Misc"),
            fields.get("metric1_name", "Weight"),
            json.dumps(fields.get("metric1_units", [])),
            fields.get("metric2_name", "Reps"),
            json.dumps(fields.get("metric2_units", [])),
        )

        try:
            cursor.execute(insert_sql, values)
            if cursor.rowcount > 0:
                inserted_count += 1
            else:
                duplicate_count += 1
        except psycopg2.Error as e:
            print(f"ERROR: Failed to insert exercise {fields['name']}: {e}")
            cursor.close()
            conn.close()
            sys.exit(1)

    # Commit and close
    try:
        conn.commit()
        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"ERROR: Failed to commit transaction: {e}")
        sys.exit(1)

    # Report
    total = inserted_count + duplicate_count
    print(f"✓ Seeding complete: {inserted_count} inserted, {duplicate_count} already exist (total {total} exercises)")
    sys.exit(0)

if __name__ == "__main__":
    seed_exercises()
