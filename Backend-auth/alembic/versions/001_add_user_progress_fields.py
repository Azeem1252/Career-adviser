"""add_user_progress_fields

Revision ID: 001
Revises: 
Create Date: 2025-11-03 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add progress fields to users table
    op.add_column('users', sa.Column('xp', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('streak', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('progress', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remove progress fields from users table
    op.drop_column('users', 'progress')
    op.drop_column('users', 'streak')
    op.drop_column('users', 'xp')
