from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Exercise, WorkoutSession, WorkoutSet
from app.schemas import (
    WorkoutSessionCreate,
    WorkoutSessionRead,
    WorkoutSessionUpdate,
    WorkoutSetRead,
)

router = APIRouter(tags=["sessions"])


def _serialize_session(db_session: WorkoutSession) -> dict:
    """Convert WorkoutSession ORM object to dict with serialized nested sets."""
    sets = []
    for workout_set in db_session.sets:
        sets.append(
            {
                "id": workout_set.id,
                "exercise": workout_set.exercise.name,
                "set_number": workout_set.set_number,
                "metric1_value": workout_set.metric1_value,
                "metric1_unit": workout_set.metric1_unit,
                "metric2_value": workout_set.metric2_value,
                "metric2_unit": workout_set.metric2_unit,
                "metric3_value": workout_set.metric3_value,
                "metric3_unit": workout_set.metric3_unit,
            }
        )

    return {
        "id": db_session.id,
        "name": db_session.name,
        "date": db_session.date,
        "created_at": db_session.created_at,
        "sets": sets,
    }


@router.get("/sessions", response_model=list[WorkoutSessionRead])
def list_sessions(db: Session = Depends(get_db)):
    """List all sessions, ordered by date (most recent first), with nested sets."""
    sessions = (
        db.query(WorkoutSession).order_by(desc(WorkoutSession.date)).all()
    )
    return [_serialize_session(s) for s in sessions]


@router.post("/sessions", response_model=WorkoutSessionRead, status_code=status.HTTP_201_CREATED)
def create_session(
    session: WorkoutSessionCreate,
    db: Session = Depends(get_db),
):
    """Create a new session with nested sets.

    Each set's exercise field must be an existing exercise name.
    Returns 404 if any exercise name is not found.
    """
    # Create session
    db_session = WorkoutSession(name=session.name, date=session.date)
    db.add(db_session)
    db.flush()  # Flush to get the session ID before creating sets

    # Create sets
    for set_data in session.sets:
        # Look up exercise by name
        exercise = db.query(Exercise).filter(Exercise.name == set_data.exercise).first()
        if not exercise:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exercise '{set_data.exercise}' not found",
            )

        # Create set
        db_set = WorkoutSet(
            session_id=db_session.id,
            exercise_id=exercise.id,
            set_number=set_data.set_number,
            metric1_value=set_data.metric1_value,
            metric1_unit=set_data.metric1_unit,
            metric2_value=set_data.metric2_value,
            metric2_unit=set_data.metric2_unit,
        )
        db.add(db_set)

    db.commit()
    db.refresh(db_session)
    return _serialize_session(db_session)


@router.get("/sessions/latest-exercises-by-name", response_model=list[str])
def latest_exercises_by_name(name: str, db: Session = Depends(get_db)):
    """Get unique exercise names from the most recent session with a given name.

    Returns a list of exercise names (deduplicated, in insertion order).
    Returns empty list if no session with that name exists.
    """
    # Step 1: Find most recent session by name
    most_recent_session = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.name == name)
        .order_by(desc(WorkoutSession.date))
        .first()
    )

    if not most_recent_session:
        return []

    # Step 2: Get all sets from that session, ordered by pk
    sets = (
        db.query(WorkoutSet)
        .filter(WorkoutSet.session_id == most_recent_session.id)
        .order_by(WorkoutSet.id)
        .all()
    )

    # Step 3: Extract unique exercise names (preserving order with dict.fromkeys)
    exercise_names = [s.exercise.name for s in sets]
    unique_names = list(dict.fromkeys(exercise_names))

    return unique_names


@router.get("/sessions/{session_id}", response_model=WorkoutSessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    """Get session by ID with nested sets.

    Returns 404 if not found.
    """
    db_session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found",
        )
    return _serialize_session(db_session)


@router.patch("/sessions/{session_id}", response_model=WorkoutSessionRead)
def patch_session(
    session_id: int,
    session_update: WorkoutSessionUpdate,
    db: Session = Depends(get_db),
):
    """Partial update session (only provided fields updated, no set updates).

    Returns 404 if not found.
    """
    db_session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found",
        )

    # Update only provided fields
    update_data = session_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_session, field, value)

    db.commit()
    db.refresh(db_session)
    return _serialize_session(db_session)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: int, db: Session = Depends(get_db)):
    """Delete session by ID (cascade deletes sets).

    Returns 404 if not found.
    Returns 204 (no content) on success.
    """
    db_session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found",
        )
    db.delete(db_session)
    db.commit()
    return None
