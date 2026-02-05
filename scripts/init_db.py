#!/usr/bin/env python3
"""
Initialize database tables from SQLAlchemy models.

This script creates all tables defined in the models using the ORM.
It's safe to run multiple times (idempotent).

Usage:
    export DATABASE_URL=postgresql://user:pass@localhost/dbname
    python scripts/init_db.py
"""

import sys
import os

# Add /code to path (Docker) or backend dir (local)
if os.path.exists('/code'):
    sys.path.insert(0, '/code')
else:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import Base, engine
import app.models  # noqa - import models to register them with Base

def init_db():
    """Create all tables defined in SQLAlchemy models."""
    try:
        print("Creating database tables from SQLAlchemy models...")
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")
        return 0
    except Exception as e:
        print(f"ERROR: Failed to create tables: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(init_db())
