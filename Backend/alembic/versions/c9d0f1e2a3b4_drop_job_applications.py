"""Drop job_applications table

Revision ID: c9d0f1e2a3b4
Revises: 8e62d0781b2a
Create Date: 2026-01-01

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c9d0f1e2a3b4'
down_revision = '8e62d0781b2a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the job_applications table
    op.drop_table('job_applications')


def downgrade() -> None:
    # Recreate the job_applications table if needed
    op.create_table(
        'job_applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('company_name', sa.String(), nullable=False),
        sa.Column('job_title', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('applied_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('job_url', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('salary_expectation', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_applications_id'), 'job_applications', ['id'], unique=False)
