# Legacy Code Archive

This folder contains archived code from the original Django + Vanilla JS implementation.

## Contents

- **api/** – Django REST API app (replaced by FastAPI in `backend/app/routers/`)
- **core/** – Django core settings and configuration (replaced by `backend/app/`)
- **js/** – Original vanilla JavaScript (replaced by React in `frontend/src/`)
- ***.html** – Original HTML templates (replaced by React components)
- **css.old/** – Original CSS files (ported and refactored into `frontend/src/styles/`)

## Migration Status

✅ **Migration from Django + Vanilla JS to FastAPI + React complete**

All original functionality has been ported to the new stack:
- FastAPI provides the same 6 main endpoints as Django
- React components provide the same UI/UX as the original vanilla JS
- Database schema remains unchanged

This archive is kept for reference only and is not used in the current application.

## If You Need Reference

- For API endpoint specifications, see `docs/migration-plan.md`
- For implementation details, see `docs/current-state-analysis.md`
- For task progress, see `tasks/todo.md`
