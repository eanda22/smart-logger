from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Exercise(Base):
    """Exercise definition with metrics."""
    __tablename__ = "api_exercise"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), default="Misc")
    metric1_name = Column(String(50), default="Weight")
    metric1_units = Column(JSON, default=list)
    metric2_name = Column(String(50), default="Reps")
    metric2_units = Column(JSON, default=list)


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
    metric1_value = Column(Float)
    metric1_unit = Column(String(10))
    metric2_value = Column(Float)
    metric2_unit = Column(String(10))

    # Relationships
    session = relationship("WorkoutSession", back_populates="sets")
    exercise = relationship("Exercise")
