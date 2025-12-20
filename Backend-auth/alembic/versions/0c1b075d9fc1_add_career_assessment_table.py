"""add_career_assessment_table

Revision ID: 0c1b075d9fc1
Revises: 23594b430825
Create Date: 2025-12-20 10:20:48.914589

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0c1b075d9fc1'
down_revision = '23594b430825'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'career_assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('responses', sa.Text(), nullable=False),
        sa.Column('results', sa.Text(), nullable=True),
        sa.Column('assessment_type', sa.String(), nullable=True, server_default='initial'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_career_assessments_id'), 'career_assessments', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_career_assessments_id'), table_name='career_assessments')
    op.drop_table('career_assessments')
