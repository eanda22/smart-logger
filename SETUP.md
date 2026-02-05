# Development Environment Setup

This guide covers setup for Smart Logger using **Docker Compose** (recommended) or local development.

**Tech Stack:**
- Backend: FastAPI (Python 3.12)
- Frontend: React 18 + TypeScript (Node 18)
- Database: PostgreSQL 16
- State Management: TanStack Query

---

## Quick Start with Docker (Recommended)

### Prerequisites
- **Git** for cloning the repository
- **Docker Desktop** (includes Docker Engine, CLI, and Compose)

### 1. Clone & Navigate
```bash
git clone https://github.com/eanda22/smart-logger.git
cd smart-logger
```

### 2. Launch All Services
```bash
docker compose up --build
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **FastAPI** backend on `localhost:8000` (automatically seeded with 34 exercises)
- **React** frontend on `localhost:3000` (served via nginx)

The `--build` flag builds Docker images on first run.

### 3. Reset Database (if needed)
```bash
./scripts/reset_db.sh
```

This stops/restarts containers and re-seeds 34 exercises.

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/exercises

---

## Local Development (Without Docker)

### Backend Setup

**Requirements:** Python 3.12, PostgreSQL 16

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create .env)
export DATABASE_URL=postgresql://user:password@localhost:5432/smart_logger
export CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

Server runs on `http://localhost:8000`. Check health: `curl http://localhost:8000/api/exercises`

### Frontend Setup

**Requirements:** Node.js 18+

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (Vite)
npm run dev
```

Frontend runs on `http://localhost:5173`. The dev server proxies API requests to `http://localhost:8000`.

### Database Setup (Local)

Create PostgreSQL database:
```bash
psql -U postgres

CREATE DATABASE smart_logger;
CREATE USER user WITH PASSWORD 'password';
ALTER ROLE user SET client_encoding TO 'utf8';
ALTER ROLE user SET default_transaction_isolation TO 'read committed';
ALTER ROLE user SET default_transaction_deferrable TO 'off';
ALTER ROLE user SET default_transaction_read_only TO 'off';
ALTER ROLE user SET statement_timeout TO 0;
GRANT ALL PRIVILEGES ON DATABASE smart_logger TO user;
\q
```

Seed exercises:
```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/smart_logger
python scripts/seed_exercises.py
```

---

## Docker Commands Reference

### Stop Services
```bash
docker compose down
```

### Reset Everything (with fresh DB)
```bash
docker compose down -v
docker compose up --build
```

### Access Backend Container Shell
```bash
docker compose exec backend /bin/bash
```

### Query Database Directly
```bash
docker compose exec db psql -U user -d smart_logger -c "SELECT COUNT(*) FROM api_exercise;"
```

### View Logs
```bash
docker compose logs -f backend   # Follow backend logs
docker compose logs -f frontend  # Follow frontend logs
docker compose logs -f db        # Follow database logs
```

---

## API Endpoints

All endpoints require the `/api` prefix.

**Exercises:**
- `GET /api/exercises` – List all exercises
- `POST /api/exercises` – Create exercise
- `GET /api/exercises/{id}` – Get by ID
- `PUT /api/exercises/{id}` – Full update
- `PATCH /api/exercises/{id}` – Partial update
- `DELETE /api/exercises/{id}` – Delete
- `GET /api/exercises/latest-sets-by-name?name=X` – Latest sets for exercise

**Sessions:**
- `GET /api/sessions` – List all sessions (with nested sets)
- `POST /api/sessions` – Create session with nested sets
- `GET /api/sessions/{id}` – Get by ID (with nested sets)
- `PUT /api/sessions/{id}` – Update session
- `PATCH /api/sessions/{id}` – Partial update
- `DELETE /api/sessions/{id}` – Delete (cascades to sets)
- `GET /api/sessions/latest-exercises-by-name?name=X` – Unique exercises from latest session

---

## Troubleshooting

**Port conflicts:** If port 3000 or 8000 is in use, update `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "3001:80"  # Change first number to desired port
backend:
  ports:
    - "8001:8000"  # Change first number to desired port
```

**Database connection errors:**
- Verify `DATABASE_URL` environment variable is set correctly
- For Docker: ensure `postgres` service is healthy before `backend` starts
- For local: verify PostgreSQL is running and user/password match

**Frontend can't reach backend:**
- Verify backend is running on the correct port
- Check `VITE_API_URL` environment variable (should be `http://localhost:8000/api` for local dev)
- In Docker, the frontend nginx proxy should point to `http://backend:8000`

---

## Documentation

For more details, see:
- **docs/current-state-analysis.md** – Original Django + Vanilla JS system overview
- **docs/migration-plan.md** – Architecture decisions and tech choices
- **docs/task-checklist.md** – All 186 implementation tasks (phases 0-10)
- **tasks/todo.md** – Real-time progress tracking

---

## Next Steps

1. Review the home page: http://localhost:3000
2. Test the "Log Workout" flow (setup → logging → summary)
3. Test the "View History" page (calendar + session details)
4. Check backend API directly: `curl http://localhost:8000/api/exercises | jq .`
