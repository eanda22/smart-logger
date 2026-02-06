from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Exercise(Base):
    """Exercise definition with metrics."""
    __tablename__ = "api_exercise"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), default="Misc")
    category_type = Column(String(20), nullable=False)
    metric1_name = Column(String(50), default="Weight")
    metric1_units = Column(JSON, default=list)
    metric2_name = Column(String(50), default="Reps")
    metric2_units = Column(JSON, default=list)
    metric3_name = Column(String(50), nullable=True)
    metric3_units = Column(JSON, nullable=True)
    field_config = Column(JSON, default=dict)

    # Relationships
    template_exercises = relationship("TemplateExercise", back_populates="exercise")


class WorkoutSession(Base):
    """A workout session (collection of sets)."""
    __tablename__ = "api_workoutsession"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Workout")
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to sets
    sets = relationship("WorkoutSet", back_populates="session", cascade="all, delete-orphan")


class WorkoutSet(Base):
    """A single set within a workout session."""
    __tablename__ = "api_workoutset"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("api_workoutsession.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("api_exercise.id"), nullable=False)
    set_number = Column(Integer, nullable=False)
    metric1_value = Column(String(20))
    metric1_unit = Column(String(10))
    metric2_value = Column(String(20))
    metric2_unit = Column(String(10))
    metric3_value = Column(String(20), nullable=True)
    metric3_unit = Column(String(10), nullable=True)

    # Relationships
    session = relationship("WorkoutSession", back_populates="sets")
    exercise = relationship("Exercise")


class Template(Base):
    """User-managed workout template."""
    __tablename__ = "api_template"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    template_exercises = relationship("TemplateExercise", back_populates="template", cascade="all, delete-orphan")


class TemplateExercise(Base):
    """Join table between Template and Exercise."""
    __tablename__ = "api_template_exercise"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("api_template.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("api_exercise.id", ondelete="CASCADE"), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    # Relationships
    template = relationship("Template", back_populates="template_exercises")
    exercise = relationship("Exercise", back_populates="template_exercises")
