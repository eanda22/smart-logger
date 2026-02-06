"""Add field_config for per-exercise customization

Revision ID: 0005
Revises: 0004
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa


revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade():
    # Add field_config JSON column
    op.add_column('api_exercise', sa.Column('field_config', sa.JSON, nullable=True))

    # Default to empty dict for all existing exercises
    op.execute("UPDATE api_exercise SET field_config = '{}'::json WHERE field_config IS NULL")


def downgrade():
    op.drop_column('api_exercise', 'field_config')
