from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime


# ==================== Exercise Schemas ====================

class ExerciseBase(BaseModel):
    """Base fields for Exercise."""
    name: str
    category: str = "Misc"
    category_type: str
    metric1_name: str = "Weight"
    metric1_units: List[str] = []
    metric2_name: str = "Reps"
    metric2_units: List[str] = []
    metric3_name: Optional[str] = None
    metric3_units: Optional[List[str]] = None
    field_config: Optional[dict] = None


class ExerciseCreate(ExerciseBase):
    """Schema for creating an exercise."""
    pass


class ExerciseUpdate(BaseModel):
    """Schema for updating an exercise (all fields optional)."""
    name: Optional[str] = None
    category: Optional[str] = None
    category_type: Optional[str] = None
    metric1_name: Optional[str] = None
    metric1_units: Optional[List[str]] = None
    metric2_name: Optional[str] = None
    metric2_units: Optional[List[str]] = None
    metric3_name: Optional[str] = None
    metric3_units: Optional[List[str]] = None
    field_config: Optional[dict] = None


class ExerciseRead(ExerciseBase):
    """Schema for reading an exercise (includes id)."""
    id: int

    class Config:
        from_attributes = True


# ==================== WorkoutSet Schemas ====================

class WorkoutSetBase(BaseModel):
    """Base fields for WorkoutSet."""
    exercise: str  # Exercise name (string, not ID)
    set_number: int
    metric1_value: Optional[str] = None
    metric1_unit: Optional[str] = None
    metric2_value: Optional[str] = None
    metric2_unit: Optional[str] = None
    metric3_value: Optional[str] = None
    metric3_unit: Optional[str] = None


class WorkoutSetCreate(WorkoutSetBase):
    """Schema for creating a set (nested in session)."""
    pass


class WorkoutSetRead(BaseModel):
    """Schema for reading a set (includes id)."""
    id: int
    exercise: str  # Exercise name
    set_number: int
    metric1_value: Optional[str] = None
    metric1_unit: Optional[str] = None
    metric2_value: Optional[str] = None
    metric2_unit: Optional[str] = None
    metric3_value: Optional[str] = None
    metric3_unit: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== WorkoutSession Schemas ====================

class WorkoutSessionBase(BaseModel):
    """Base fields for WorkoutSession."""
    name: str = "Workout"
    date: date


class WorkoutSessionCreate(WorkoutSessionBase):
    """Schema for creating a session with nested sets."""
    sets: List[WorkoutSetCreate] = []


class WorkoutSessionUpdate(BaseModel):
    """Schema for updating a session (all fields optional)."""
    name: Optional[str] = None
    date: Optional[date] = None


class WorkoutSessionRead(WorkoutSessionBase):
    """Schema for reading a session (includes id, created_at, nested sets)."""
    id: int
    created_at: datetime
    sets: List[WorkoutSetRead] = []

    class Config:
        from_attributes = True


# ==================== Template Schemas ====================

class TemplateExerciseRead(BaseModel):
    """Schema for reading an exercise in a template."""
    exercise_id: int
    sort_order: int

    class Config:
        from_attributes = True


class TemplateBase(BaseModel):
    """Base fields for Template."""
    name: str


class TemplateCreate(TemplateBase):
    """Schema for creating a template."""
    exercise_ids: List[int] = []


class TemplateRead(TemplateBase):
    """Schema for reading a template (includes id, timestamps, exercises)."""
    id: int
    created_at: datetime
    updated_at: datetime
    template_exercises: List[TemplateExerciseRead] = []

    class Config:
        from_attributes = True
