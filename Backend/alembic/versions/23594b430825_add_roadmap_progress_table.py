"""add_roadmap_progress_table

Revision ID: 23594b430825
Revises: b6e567a62474
Create Date: 2025-12-20 10:00:02.174173

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '23594b430825'
down_revision = 'b6e567a62474'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'roadmap_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('roadmap_id', sa.Integer(), nullable=False),
        sa.Column('stage_index', sa.Integer(), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['roadmap_id'], ['saved_runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roadmap_progress_id'), 'roadmap_progress', ['id'], unique=False)
    op.create_index('ix_roadmap_progress_user_roadmap', 'roadmap_progress', ['user_id', 'roadmap_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_roadmap_progress_user_roadmap', table_name='roadmap_progress')
    op.drop_index(op.f('ix_roadmap_progress_id'), table_name='roadmap_progress')
    op.drop_table('roadmap_progress')
