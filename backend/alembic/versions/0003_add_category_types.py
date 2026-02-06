"""Add category_type and remap metrics

Revision ID: 0003
Revises: 0002
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa


revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade():
    # Add category_type column (nullable initially)
    op.add_column('api_exercise', sa.Column('category_type', sa.String(20), nullable=True))

    # Populate category_type based on old category
    op.execute("""
        UPDATE api_exercise SET category_type =
        CASE
            WHEN category IN ('Upper Body', 'Lower Body', 'Core', 'Kettlebell') THEN 'strength'
            WHEN category = 'Cardio' THEN 'cardio'
            WHEN category = 'Mobility' THEN 'flexibility'
            WHEN category = 'Recovery' THEN 'recovery'
            ELSE 'strength'
        END
    """)

    # Remap metric names to match category defaults
    # Strength exercises
    op.execute("""
        UPDATE api_exercise
        SET metric1_name = 'Weight', metric2_name = 'Reps'
        WHERE category_type = 'strength'
    """)

    # Cardio exercises (Treadmill Walk: Distance/Time → Duration/Distance/Heart Rate)
    op.execute("""
        UPDATE api_exercise
        SET metric1_name = 'Duration',
            metric2_name = 'Distance',
            metric3_name = 'Heart Rate',
            metric3_units = '["bpm"]'::json
        WHERE category_type = 'cardio' AND name = 'Treadmill Walk'
    """)

    # Flexibility exercises (Time/Quality → Hold Time/Reps)
    op.execute("""
        UPDATE api_exercise
        SET metric1_name = 'Hold Time',
            metric2_name = 'Reps'
        WHERE category_type = 'flexibility'
    """)

    # Recovery exercises (Duration/Heart Rate → Duration/Intensity)
    op.execute("""
        UPDATE api_exercise
        SET metric1_name = 'Duration',
            metric2_name = 'Intensity'
        WHERE category_type = 'recovery'
    """)

    # Make category_type NOT NULL after population
    op.alter_column('api_exercise', 'category_type', nullable=False)


def downgrade():
    op.drop_column('api_exercise', 'category_type')
    # Note: metric name remapping is not reversed (data loss would occur)
