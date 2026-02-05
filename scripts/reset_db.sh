#!/bin/bash
# This script fully resets the database, including all data.
# It is intended for development use only.

# Exit immediately if a command exits with a non-zero status.
set -e

# Define some colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}--- Step 1: Tearing down Docker containers and volumes... ---${NC}"
docker compose down -v
echo -e "${GREEN}Docker containers and volumes removed.${NC}\n"

echo -e "${YELLOW}--- Step 2: Starting services... ---${NC}"
docker compose up --build -d
# Wait for database to be ready
sleep 5
echo -e "${GREEN}Services started.${NC}\n"

echo -e "${YELLOW}--- Step 3: Stamping Alembic migration baseline... ---${NC}"
docker compose exec -T backend alembic stamp head
echo -e "${GREEN}Alembic baseline stamped.${NC}\n"

echo -e "${YELLOW}--- Step 4: Initializing database tables... ---${NC}"
docker compose exec -T backend python /scripts/init_db.py
echo -e "${GREEN}Database tables initialized.${NC}\n"

echo -e "${YELLOW}--- Step 5: Seeding exercises data... ---${NC}"
docker compose exec -T backend python /scripts/seed_exercises.py
echo -e "${GREEN}Exercise data seeded.${NC}\n"

echo -e "${GREEN}--- DATABASE RESET COMPLETE ---${NC}"
echo "Your database has been successfully reset with 34 exercises."
