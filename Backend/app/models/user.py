from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    website = Column(String, nullable=True)
    skills = Column(JSON, nullable=True)
    profile_summary = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    career_preferences = Column(JSON, nullable=True)
    notification_email = Column(Boolean, default=True)
    notification_push = Column(Boolean, default=False)
    notification_weekly = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    saved_runs = relationship("SavedRun", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_hash = Column(String, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    technologies = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    issuing_organization = Column(String, nullable=False)
    issue_date = Column(DateTime, nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="certifications")


class EmailToken(Base):
    __tablename__ = "email_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_hash = Column(String, index=True, nullable=False)
    email = Column(String, index=True, nullable=False)
    token_type = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RateLimitLog(Base):
    __tablename__ = "rate_limit_logs"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, index=True, nullable=False)
    endpoint = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class SavedRun(Base):
    __tablename__ = "saved_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    run_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_runs")


class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    roadmap_id = Column(Integer, ForeignKey("saved_runs.id", ondelete="CASCADE"), nullable=False)
    stage_index = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    completed_skills = Column(JSON, nullable=True)
    completed_resources = Column(JSON, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
    roadmap = relationship("SavedRun")


class CareerAssessment(Base):
    __tablename__ = "career_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    responses = Column(Text, nullable=False)
    results = Column(Text, nullable=True)
    assessment_type = Column(String, default="initial")
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
