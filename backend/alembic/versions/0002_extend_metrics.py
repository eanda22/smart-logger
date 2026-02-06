"""Extend metrics to support 3+ fields and BW storage

Revision ID: 0002
Revises: 0001
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    # Add metric3 columns to api_exercise
    op.add_column('api_exercise', sa.Column('metric3_name', sa.String(50), nullable=True))
    op.add_column('api_exercise', sa.Column('metric3_units', sa.JSON, nullable=True))

    # Add metric3 columns to api_workoutset
    op.add_column('api_workoutset', sa.Column('metric3_value', sa.String(20), nullable=True))
    op.add_column('api_workoutset', sa.Column('metric3_unit', sa.String(10), nullable=True))

    # Change metric1_value and metric2_value from Float to String (PostgreSQL specific)
    # Using USING clause to cast values during type change
    op.execute("ALTER TABLE api_workoutset ALTER COLUMN metric1_value TYPE VARCHAR(20) USING metric1_value::VARCHAR")
    op.execute("ALTER TABLE api_workoutset ALTER COLUMN metric2_value TYPE VARCHAR(20) USING metric2_value::VARCHAR")


def downgrade():
    # Remove metric3 columns
    op.drop_column('api_workoutset', 'metric3_unit')
    op.drop_column('api_workoutset', 'metric3_value')
    op.drop_column('api_exercise', 'metric3_units')
    op.drop_column('api_exercise', 'metric3_name')

    # Revert to Float (NOTE: will fail if BW values exist)
    op.execute("ALTER TABLE api_workoutset ALTER COLUMN metric1_value TYPE FLOAT USING metric1_value::FLOAT")
    op.execute("ALTER TABLE api_workoutset ALTER COLUMN metric2_value TYPE FLOAT USING metric2_value::FLOAT")
