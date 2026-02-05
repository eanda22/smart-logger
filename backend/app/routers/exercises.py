from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc

from app.database import get_db
from app.models import Exercise, WorkoutSession, WorkoutSet
from app.schemas import ExerciseCreate, ExerciseRead, ExerciseUpdate, WorkoutSetRead

router = APIRouter(tags=["exercises"])


@router.get("/exercises", response_model=list[ExerciseRead])
def list_exercises(db: Session = Depends(get_db)):
    """List all exercises, ordered by name."""
    exercises = db.query(Exercise).order_by(Exercise.name).all()
    return exercises


@router.post("/exercises", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
def create_exercise(exercise: ExerciseCreate, db: Session = Depends(get_db)):
    """Create a new exercise.

    Returns 409 if name already exists (duplicate).
    """
    db_exercise = Exercise(
        name=exercise.name,
        category=exercise.category,
        metric1_name=exercise.metric1_name,
        metric1_units=exercise.metric1_units,
        metric2_name=exercise.metric2_name,
        metric2_units=exercise.metric2_units,
    )
    db.add(db_exercise)
    try:
        db.commit()
        db.refresh(db_exercise)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Exercise with name '{exercise.name}' already exists",
        )
    return db_exercise


@router.get("/exercises/latest-sets-by-name", response_model=list[WorkoutSetRead])
def latest_sets_by_name(name: str, db: Session = Depends(get_db)):
    """Get most recent sets for a given exercise name.

    Returns sets from the most recent session containing this exercise,
    ordered by set number. Returns empty list if exercise has never been logged.
    """
    # Step 1: Find most recent session with this exercise
    most_recent_session = (
        db.query(WorkoutSession)
        .join(WorkoutSet)
        .join(Exercise)
        .filter(Exercise.name == name)
        .order_by(desc(WorkoutSession.date))
        .first()
    )

    if not most_recent_session:
        return []

    # Step 2: Get all sets from that session for this exercise, ordered by set_number
    sets = (
        db.query(WorkoutSet)
        .join(Exercise)
        .filter(
            WorkoutSet.session_id == most_recent_session.id,
            Exercise.name == name,
        )
        .order_by(WorkoutSet.set_number)
        .all()
    )

    # Convert to response format (manually construct dicts to map exercise relationship to name string)
    result = []
    for workout_set in sets:
        result.append(
            {
                "id": workout_set.id,
                "exercise": workout_set.exercise.name,
                "set_number": workout_set.set_number,
                "metric1_value": workout_set.metric1_value,
                "metric1_unit": workout_set.metric1_unit,
                "metric2_value": workout_set.metric2_value,
                "metric2_unit": workout_set.metric2_unit,
            }
        )

    return result


@router.get("/exercises/{exercise_id}", response_model=ExerciseRead)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    """Get exercise by ID.

    Returns 404 if not found.
    """
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with id {exercise_id} not found",
        )
    return exercise


@router.put("/exercises/{exercise_id}", response_model=ExerciseRead)
def update_exercise(
    exercise_id: int,
    exercise_update: ExerciseUpdate,
    db: Session = Depends(get_db),
):
    """Update exercise (all fields required for full update).

    Returns 404 if not found.
    Returns 409 if new name is a duplicate.
    """
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with id {exercise_id} not found",
        )

    # Update only provided fields
    update_data = exercise_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_exercise, field, value)

    try:
        db.commit()
        db.refresh(db_exercise)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Exercise with name '{exercise_update.name}' already exists",
        )
    return db_exercise


@router.patch("/exercises/{exercise_id}", response_model=ExerciseRead)
def patch_exercise(
    exercise_id: int,
    exercise_update: ExerciseUpdate,
    db: Session = Depends(get_db),
):
    """Partial update exercise (only provided fields updated).

    Returns 404 if not found.
    Returns 409 if new name is a duplicate.
    """
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with id {exercise_id} not found",
        )

    # Update only provided fields
    update_data = exercise_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_exercise, field, value)

    try:
        db.commit()
        db.refresh(db_exercise)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Exercise with name '{exercise_update.name}' already exists",
        )
    return db_exercise


@router.delete("/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    """Delete exercise by ID.

    Returns 404 if not found.
    Returns 204 (no content) on success.
    """
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with id {exercise_id} not found",
        )
    db.delete(db_exercise)
    db.commit()
    return None
