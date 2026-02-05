# Smart Logger

A modern workout tracking application featuring an intuitive interface for logging exercises, viewing history, and analyzing performance.

**Status:** Migrated from Django + Vanilla JS to **FastAPI + React** ✅

---

## Quick Start

### Docker (Recommended)
```bash
docker compose up --build
# Frontend: http://localhost:3000
# API: http://localhost:8000/api
```

### Local Development
See [SETUP.md](SETUP.md) for FastAPI + React setup without Docker.

---

## What's Inside

**Frontend:** React 18 with TypeScript, React Router, TanStack Query
- Home page with quick links
- Workout page: template selection → logging → summary
- History page: calendar view + session details

**Backend:** FastAPI with SQLAlchemy + PostgreSQL
- 6 main endpoints for exercises and sessions
- Nested set creation in transactions
- Pre-fill from latest sessions

**Architecture:** See [docs/migration-plan.md](docs/migration-plan.md) for design decisions and trade-offs.

---

## Key Features

✅ **Workout Logging**
- Pre-fill exercises from previous sessions
- Flexible set creation with custom metrics
- Immediate summary view

✅ **History Tracking**
- Calendar view of all workouts
- Expandable session details
- Exercise and set metrics

✅ **Responsive Design**
- Mobile-friendly interface
- Drag-and-drop exercise reordering
- Real-time form updates

✅ **Type Safety**
- TypeScript frontend
- Pydantic + SQLAlchemy backend
- Fully typed API contracts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| State | TanStack Query (server), useState (UI) |
| Styling | CSS (no CSS-in-JS) |
| Routing | React Router v6 |
| DnD | @dnd-kit (sortable) |
| Backend | FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.0 (sync) |
| Database | PostgreSQL 16 |
| Container | Docker + Docker Compose |

---

## Documentation

- **[SETUP.md](SETUP.md)** – Installation & development workflow
- **[docs/migration-plan.md](docs/migration-plan.md)** – Architecture & design decisions
- **[docs/current-state-analysis.md](docs/current-state-analysis.md)** – Original Django system overview
- **[docs/task-checklist.md](docs/task-checklist.md)** – All 186 implementation tasks
- **[tasks/todo.md](tasks/todo.md)** – Real-time progress (127/186 tasks complete before Phase 10)

---

## Migration Summary

### Before (Legacy)
- Backend: Django 3.x
- Frontend: Vanilla JavaScript + jQuery
- CSS: Global styles, inline JS logic

### After (Current)
- Backend: FastAPI (same 6 endpoints, cleaner code)
- Frontend: React (component-driven, type-safe)
- State: TanStack Query (no Redux, minimal boilerplate)
- CSS: Modular CSS files (no global namespace pollution)

**Why?** FastAPI is simpler for this use case (no auth, single user). React is more maintainable than vanilla JS for complex forms. TanStack Query avoids Redux boilerplate.

---

## Development

### Running Tests
```bash
# Backend: Run pytest (if added)
docker compose exec backend pytest

# Frontend: Run vitest
cd frontend && npm run test
```

### Linting & Formatting
```bash
# Backend
docker compose exec backend black --check .
docker compose exec backend ruff check .

# Frontend
cd frontend && npm run lint
cd frontend && npm run format
```

### Database Migrations
```bash
# Stamp baseline (no-op, schema is fixed)
docker compose exec backend alembic stamp head

# Create new migration (if schema changes)
docker compose exec backend alembic revision --autogenerate -m "description"
```

---

## API Overview

All endpoints prefixed with `/api/`.

### Exercises
- `GET /exercises` – List all (ordered by name)
- `POST /exercises` – Create new
- `GET /exercises/{id}` – Retrieve
- `PUT /exercises/{id}` – Full update
- `PATCH /exercises/{id}` – Partial update
- `DELETE /exercises/{id}` – Delete
- `GET /exercises/latest-sets-by-name?name=X` – Last logged sets

### Sessions
- `GET /sessions` – List all (ordered by date DESC, nested sets)
- `POST /sessions` – Create with nested sets
- `GET /sessions/{id}` – Retrieve with nested sets
- `PUT /sessions/{id}` – Update metadata
- `PATCH /sessions/{id}` – Partial update
- `DELETE /sessions/{id}` – Delete (cascades to sets)
- `GET /sessions/latest-exercises-by-name?name=X` – Unique exercises from latest

See [docs/migration-plan.md](docs/migration-plan.md) for request/response schemas.

---

## Troubleshooting

**Port already in use?** Update ports in `docker-compose.yml`.

**Database won't connect?** Ensure `postgres` service is healthy:
```bash
docker compose logs db
```

**Frontend can't reach API?** Verify `VITE_API_URL` and nginx proxy config.

See [SETUP.md](SETUP.md) for more troubleshooting tips.

---

## Project Structure

```
smart-logger/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI instance
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── models.py          # ORM models
│   │   ├── schemas.py         # Pydantic validation
│   │   └── routers/           # Endpoint handlers
│   ├── alembic/               # Database migrations
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
├── frontend/                   # React application
│   ├── src/
│   │   ├── api/               # Fetch wrappers, types
│   │   ├── pages/             # Route components
│   │   ├── components/        # Reusable UI
│   │   ├── hooks/             # TanStack Query hooks
│   │   └── styles/            # CSS modules
│   ├── index.html
│   ├── vite.config.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── scripts/                    # Utilities (seed, reset DB)
├── docs/                       # Architecture & planning
├── tasks/                      # Progress tracking
├── docker-compose.yml
└── SETUP.md                    # Installation guide
```

---

## Contributing

1. Review [PHASE_10_PLAN.md](PHASE_10_PLAN.md) for current work
2. Check [tasks/todo.md](tasks/todo.md) for task status
3. Follow git commit conventions (used in project history)
4. Keep changes minimal and focused (no premature abstractions)

---

## License

[Your License Here]

---

## Support

For issues, questions, or suggestions:
- Review the [SETUP.md](SETUP.md) troubleshooting section
- Check [docs/migration-plan.md](docs/migration-plan.md) for architecture questions
- File an issue on GitHub

**Happy logging!** 💪