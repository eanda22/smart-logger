# Smart Logger

A workout tracking application for logging exercises, viewing history, and analyzing performance.

---

## Quick Start

### Docker
```bash
docker compose up --build
# Frontend: http://localhost:3000
# API: http://localhost:8000/api
```

### Local Development
See [SETUP.md](SETUP.md) for FastAPI + React setup without Docker.

---

## What's Inside

**Frontend:** React 18, TypeScript, React Router, TanStack Query
- Home page with quick links
- Workout page: template selection, logging, summary
- History page: calendar view and session details

**Backend:** FastAPI with SQLAlchemy and PostgreSQL
- 6 main endpoints for exercises and sessions
- Nested set creation in transactions
- Pre-fill from latest sessions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| State | TanStack Query, useState |
| Styling | CSS |
| Routing | React Router v6 |
| Backend | FastAPI, SQLAlchemy 2.0 (sync) |
| Database | PostgreSQL 16 |
| Container | Docker Compose |

---

## API Endpoints

All endpoints prefixed with `/api/`.

**Exercises**
- `GET /exercises` – List all
- `POST /exercises` – Create
- `GET /exercises/{id}` – Retrieve
- `PUT /exercises/{id}` – Update
- `DELETE /exercises/{id}` – Delete
- `GET /exercises/latest-sets-by-name?name=X` – Latest sets

**Sessions**
- `GET /sessions` – List all with nested sets
- `POST /sessions` – Create with nested sets
- `GET /sessions/{id}` – Retrieve with nested sets
- `PUT /sessions/{id}` – Update
- `DELETE /sessions/{id}` – Delete
- `GET /sessions/latest-exercises-by-name?name=X` – Unique exercises from latest

---

## Documentation

- [SETUP.md](SETUP.md) – Installation and development workflow
- [docs/migration-plan.md](docs/migration-plan.md) – Architecture and design decisions
- [tasks/todo.md](tasks/todo.md) – Progress tracking

---

## Project Structure

```
smart-logger/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── main.py      # FastAPI instance
│   │   ├── database.py  # SQLAlchemy setup
│   │   ├── models.py    # ORM models
│   │   ├── schemas.py   # Pydantic validation
│   │   └── routers/     # Endpoint handlers
│   └── requirements.txt
├── frontend/             # React application
│   ├── src/
│   │   ├── api/         # Fetch wrappers, types
│   │   ├── pages/       # Route components
│   │   ├── components/  # Reusable UI
│   │   ├── hooks/       # TanStack Query hooks
│   │   └── styles/      # CSS
│   ├── vite.config.ts
│   └── package.json
├── scripts/              # Utilities
├── docs/                 # Architecture and planning
├── docker-compose.yml
└── SETUP.md
```

---

## Development

### Tests
```bash
# Backend
docker compose exec backend pytest

# Frontend
cd frontend && npm run test
```

### Linting
```bash
# Backend
docker compose exec backend black . && docker compose exec backend ruff check .

# Frontend
cd frontend && npm run lint
```

---

## Troubleshooting

**Port already in use?** Update ports in `docker-compose.yml`.

**Database won't connect?** Check postgres service:
```bash
docker compose logs db
```

**Frontend can't reach API?** Verify `VITE_API_URL` in environment and nginx proxy config.

See [SETUP.md](SETUP.md) for more details.