from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Template, TemplateExercise, Exercise
from app.schemas import TemplateCreate, TemplateRead, TemplateExerciseRead

router = APIRouter(tags=["templates"])


@router.get("/templates", response_model=list[TemplateRead])
def list_templates(db: Session = Depends(get_db)):
    """List all templates, ordered by name."""
    templates = db.query(Template).order_by(Template.name).all()
    return templates


@router.post("/templates", response_model=TemplateRead, status_code=status.HTTP_201_CREATED)
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    """Create a new template.

    Returns 409 if name already exists (duplicate).
    """
    db_template = Template(name=template.name)

    # Add exercises if provided
    if template.exercise_ids:
        for sort_order, exercise_id in enumerate(template.exercise_ids):
            exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
            if not exercise:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Exercise with id {exercise_id} not found",
                )
            template_exercise = TemplateExercise(
                exercise_id=exercise_id,
                sort_order=sort_order
            )
            db_template.template_exercises.append(template_exercise)

    db.add(db_template)
    try:
        db.commit()
        db.refresh(db_template)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Template with name '{template.name}' already exists",
        )
    return db_template


@router.get("/templates/{template_id}", response_model=TemplateRead)
def get_template(template_id: int, db: Session = Depends(get_db)):
    """Get template by ID.

    Returns 404 if not found.
    """
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id {template_id} not found",
        )
    return template


@router.patch("/templates/{template_id}", response_model=TemplateRead)
def patch_template(
    template_id: int,
    template_update: TemplateCreate,
    db: Session = Depends(get_db),
):
    """Partial update template (only provided fields updated).

    Returns 404 if not found.
    Returns 409 if new name is a duplicate.
    """
    db_template = db.query(Template).filter(Template.id == template_id).first()
    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id {template_id} not found",
        )

    # Update name if provided
    if template_update.name:
        db_template.name = template_update.name

    try:
        db.commit()
        db.refresh(db_template)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Template with name '{template_update.name}' already exists",
        )
    return db_template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete template by ID.

    Returns 404 if not found.
    Returns 204 (no content) on success.
    """
    db_template = db.query(Template).filter(Template.id == template_id).first()
    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id {template_id} not found",
        )
    db.delete(db_template)
    db.commit()
    return None


@router.post("/templates/{template_id}/exercises", status_code=status.HTTP_201_CREATED)
def add_exercise_to_template(
    template_id: int,
    exercise_id: int,
    db: Session = Depends(get_db),
):
    """Add an exercise to a template.

    Returns 404 if template or exercise not found.
    Returns 409 if exercise already in template.
    """
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id {template_id} not found",
        )

    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with id {exercise_id} not found",
        )

    # Check if exercise already in template
    existing = (
        db.query(TemplateExercise)
        .filter(
            TemplateExercise.template_id == template_id,
            TemplateExercise.exercise_id == exercise_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Exercise {exercise_id} already in template {template_id}",
        )

    # Get next sort_order
    max_sort = (
        db.query(TemplateExercise)
        .filter(TemplateExercise.template_id == template_id)
        .order_by(TemplateExercise.sort_order.desc())
        .first()
    )
    next_sort_order = (max_sort.sort_order + 1) if max_sort else 0

    template_exercise = TemplateExercise(
        template_id=template_id,
        exercise_id=exercise_id,
        sort_order=next_sort_order,
    )
    db.add(template_exercise)
    db.commit()
    return {"status": "added"}


@router.delete("/templates/{template_id}/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_exercise_from_template(
    template_id: int,
    exercise_id: int,
    db: Session = Depends(get_db),
):
    """Remove an exercise from a template.

    Returns 404 if template or exercise not found.
    Returns 204 (no content) on success.
    """
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id {template_id} not found",
        )

    template_exercise = (
        db.query(TemplateExercise)
        .filter(
            TemplateExercise.template_id == template_id,
            TemplateExercise.exercise_id == exercise_id,
        )
        .first()
    )
    if not template_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise {exercise_id} not in template {template_id}",
        )

    db.delete(template_exercise)
    db.commit()
    return None


@router.put("/templates/{template_id}/exercises/sort")
def sort_template_exercises(
    template_id: int,
    exercise_ids: list[int],
    db: Session = Depends(get_db),
):
    """Reorder exercises in a template.

    Exercise IDs provided in desired order.
    Returns 404 if template not found.
    """
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id {template_id} not found",
        )

    # Update sort_order for each exercise
    for sort_order, exercise_id in enumerate(exercise_ids):
        template_exercise = (
            db.query(TemplateExercise)
            .filter(
                TemplateExercise.template_id == template_id,
                TemplateExercise.exercise_id == exercise_id,
            )
            .first()
        )
        if template_exercise:
            template_exercise.sort_order = sort_order

    db.commit()
    return {"status": "sorted"}
