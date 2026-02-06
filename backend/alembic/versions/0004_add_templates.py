"""Add template storage tables

Revision ID: 0004
Revises: 0003
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade():
    # Create api_template table
    op.create_table(
        'api_template',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True, index=True),
        sa.Column('created_at', sa.DateTime(), server_default=func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=func.now(), onupdate=func.now())
    )

    # Create api_template_exercise join table
    op.create_table(
        'api_template_exercise',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('template_id', sa.Integer(), sa.ForeignKey('api_template.id', ondelete='CASCADE'), nullable=False),
        sa.Column('exercise_id', sa.Integer(), sa.ForeignKey('api_exercise.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, default=0)
    )

    # Add indexes for performance
    op.create_index('idx_template_exercise_template', 'api_template_exercise', ['template_id'])
    op.create_index('idx_template_exercise_exercise', 'api_template_exercise', ['exercise_id'])


def downgrade():
    op.drop_index('idx_template_exercise_exercise')
    op.drop_index('idx_template_exercise_template')
    op.drop_table('api_template_exercise')
    op.drop_table('api_template')
