# Career Adviser - AI-Powered Career Guidance Platform

> **An intelligent career guidance ecosystem leveraging cutting-edge AI technology to transform professional development**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Architecture](#project-architecture)
3. [Core Features](#core-features)
4. [Technical Stack](#technical-stack)
5. [Screenshots Gallery](#screenshots-gallery)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [AI Integration](#ai-integration)
9. [Security](#security)

---

## Executive Summary

**Career Adviser** is an enterprise-grade, AI-powered career guidance platform designed to empower professionals with intelligent career insights, personalized recommendations, and strategic development tools.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Frontend Code** | 15,000+ lines TypeScript/React |
| **Backend Code** | 5,000+ lines Python |
| **API Endpoints** | 40+ RESTful endpoints |
| **Database Models** | 9 SQLAlchemy models |
| **AI Capabilities** | 8 distinct features |
| **UI Components** | 30+ custom components |

---

## Project Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Pages   │ │   UI     │ │  State   │ │    API Client    │   │
│  │ & Routes │ │Components│ │Management│ │     (Axios)      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │   Auth   │ │   API    │ │    AI    │ │    Database      │   │
│  │  Router  │ │ Routers  │ │ Service  │ │     Layer        │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│    AI SERVICES          │     │        DATABASE             │
│  (Google Gemini API)    │     │  (SQLite / PostgreSQL)      │
└─────────────────────────┘     └─────────────────────────────┘
```

### Directory Structure

```
Career-Adviser/
├── frontend/                    # Next.js 14 Application
├── Backend-auth/               # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Configuration & security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routers/           # API route handlers
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic & AI
│   ├── alembic/               # Database migrations
│   └── requirements.txt
└── AI Project SS/             # Project Screenshots
```

---

## Backend Architecture & Module Deep-Dive

The backend is built with **FastAPI**, following a modular design that separates concerns into distinct layers. This architecture ensures scalability, security, and easy maintenance of AI features.

### Codebase Highlights

![Backend Core & Models](./AI%20Project%20SS/backend_structure_1.png)
*Figure 1: Core system modules and database models*

![Backend Routers & Scopes](./AI%20Project%20SS/backend_structure_2.png)
*Figure 2: API Route handlers and data schemas*

---

### Module Explanations (Technical Detail)

#### 1. `core/` - System Foundation
Handles the critical infrastructure utilities that power the entire ecosystem.
- **`config.py`**: Centralized management for environment variables (API keys, database URLs).
- **`security.py`**: Manages the auth lifecycle. **Technical Detail**: Uses `PyJWT` for secure token generation and `bcrypt` for one-way password hashing.
- **`email.py` & `email_templates.py`**: An asynchronous notification system that sends branded HTML emails for account verification and security alerts.

#### 2. `models/` - Data Persistence
Defines the relational architecture of the platform using SQLAlchemy ORM.
- **`user.py`**: Maps complex user profiles, work history, and certifications to the database.
- **`SavedRun` Model**: **Technical Detail**: Implements a flexible JSON storage schema to persist AI-generated analysis, roadmaps, and interview results, enabling a full user history feature.

#### 3. `routers/` - Feature Implementation (APIs)
The "engines" of the platform that process user requests and orchestrate AI logic.
- **`analyzer.py`**: **AI Resume Analysis**. **Technical Detail**: Leverages `PyPDF2` (for PDFs) and `python-docx` (for Word documents) to perform deep text extraction before AI processing.
- **`assessment.py`**: **Career Diagnostic**. Orchestrates the 6-step stateful journey from user profile to AI career recommendations.
- **`auth.py`**: **Identity Management**. Secure endpoints for registration, login with token rotation, and password recovery.
- **`careers.py`**: **Career Intelligence**. Provides high-speed access to the career database and matching algorithms.
- **`interviewer.py`**: **Mock Preparation**. Specialized logic that prompts the AI to generate role-specific questions and evaluate candidate performance.
- **`roadmaps.py`**: **Learning Path Generation**. **Technical Detail**: Implements a progress-tracking system that allows users to mark stages, skills, and resources as completed.
- **`users.py`**: **Profile Services**. CRUD operations for user profiles, project portfolios, and industry certifications.

#### 4. `schemas/` - Data Integrity
Uses **Pydantic** models to enforce strict type-checking, preventing invalid data from entering the system and ensuring consistent API responses.

#### 5. `services/` - External Integrations
- **`ai_service.py`**: **The AI Gateway**. **Technical Detail**: This is the most complex backend module. It manages prompt engineering for Google Gemini, implements "gibberish detection" for inputs, and features a custom JSON cleaner to parse structured AI responses reliably even if they contain markdown artifacts.

---

## Core Features

### 1. 🏠 Landing Page & Homepage

Modern, visually stunning homepage with:
- Animated hero section with gradient backgrounds
- Feature showcase with interactive cards
- Statistics and social proof
- Call-to-action buttons
- Responsive design

![Homepage Hero Section](./AI%20Project%20SS/Screenshot%202026-01-01%20200412.png)

---

### 2. 🎯 Career Exploration

Browse and discover career paths with:
- Comprehensive career database
- Detailed career profiles with salary ranges
- Skills requirements
- Industry insights
- Growth projections

![Career Exploration Page](./AI%20Project%20SS/Screenshot%202026-01-01%20200453.png)

---

### 3. 🔐 Authentication System

Secure, enterprise-grade authentication:
- Email/password registration
- Email verification with tokens
- JWT-based authentication
- Refresh token rotation
- Password reset functionality

![Login Page](./AI%20Project%20SS/Screenshot%202026-01-01%20200844.png)

---

### 4. 📊 User Dashboard

Personalized command center featuring:
- Career match overview
- Recent activity tracking
- Quick action cards
- Progress indicators
- AI-powered insights

![User Dashboard](./AI%20Project%20SS/Screenshot%202026-01-01%20201056.png)

---

### 5. 🧠 AI Career Assessment

Comprehensive 6-step career diagnostic system:

| Step | Title | Data Collected |
|------|-------|----------------|
| 1 | Profile | Name, location, experience level |
| 2 | Education | Degrees, certifications, institutions |
| 3 | Industry | Work history, sectors, duration |
| 4 | Skills | Technical skills, soft skills, proficiency |
| 5 | Preferences | Salary range, work style, culture fit |
| 6 | AI Analysis | Processing & recommendations |

![Assessment Skills Selection](./AI%20Project%20SS/Screenshot%202026-01-01%20201448.png)

---

### 6. 🎯 Career Recommendations

AI-generated personalized career matches:
- Match percentage calculation
- Salary range predictions
- Required skills mapping
- Growth potential analysis
- Action recommendations

![Career Recommendations](./AI%20Project%20SS/Screenshot%202026-01-01%20201526.png)

---

### 7. 🎤 AI Mock Interviewer

Practice interviews with AI feedback:
- Role-specific question generation
- Difficulty level selection
- Real-time answer evaluation
- Detailed feedback scoring
- Improvement suggestions

![Mock Interview Interface](./AI%20Project%20SS/Screenshot%202026-01-01%20201615.png)

---

### 8. 📝 Resume Analyzer

AI-powered resume analysis:
- ATS compatibility scoring
- Skill extraction
- Improvement recommendations
- Industry comparison
- Formatting suggestions

![Resume Analyzer](./AI%20Project%20SS/Screenshot%202026-01-01%20201716.png)

---

### 9. 👤 User Profile

Comprehensive profile management:
- Personal information
- Education history
- Work experience
- Skills & certifications
- Projects portfolio

![User Profile Page](./AI%20Project%20SS/Screenshot%202026-01-01%20201745.png)

---

### 10. 🗺️ Career Roadmaps

AI-generated learning paths:
- Skill progression mapping
- Resource recommendations
- Timeline estimates
- Milestone tracking
- Progress visualization

![Career Roadmap View](./AI%20Project%20SS/Screenshot%202026-01-01%20201853.png)

---

### 11. 💬 AI Chat Widget

Contextual AI assistance:
- Floating chat interface
- Career guidance Q&A
- Instant responses
- Context-aware suggestions

![AI Chat Widget](./AI%20Project%20SS/Screenshot%202026-01-01%20202012.png)

---

### 12. 📄 Cover Letter Generator

AI-powered cover letter creation:
- Job-specific customization
- Professional formatting
- Keyword optimization
- Template options

![Cover Letter Generator](./AI%20Project%20SS/Screenshot%202026-01-01%20202236.png)

---

## Technical Stack

### Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 14.x |
| **TypeScript** | Type-safe JavaScript | 5.x |
| **Tailwind CSS** | Utility-first CSS framework | 3.x |
| **Framer Motion** | Animations & transitions | Latest |
| **Zustand** | State management | Latest |
| **Axios** | HTTP client | Latest |
| **Lucide React** | Icon library | Latest |

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Async Python web framework | 0.100+ |
| **SQLAlchemy** | ORM & database toolkit | 2.x |
| **Pydantic** | Data validation | 2.x |
| **PyJWT** | JWT token handling | Latest |
| **Alembic** | Database migrations | Latest |
| **Google Gemini** | AI/ML capabilities | Latest |

---

## AI Integration

### AI Capabilities

| Feature | Description | Input | Output |
|---------|-------------|-------|--------|
| **Career Matching** | Profile-to-career alignment | User profile | Match percentages |
| **Resume Analysis** | ATS & content scoring | Resume file | Analysis report |
| **Interview Prep** | Question generation | Job title | Questions list |
| **Answer Evaluation** | Response scoring | Q&A pair | Feedback & score |
| **Cover Letter** | Personalized generation | Profile + job | Letter text |
| **Roadmap Generation** | Learning path creation | Skills + goal | Roadmap plan |
| **Chat Assistant** | Career Q&A | User query | AI response |

---

## Security

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with salt |
| **JWT Tokens** | Short-lived access (15min) |
| **Refresh Tokens** | Long-lived with rotation |
| **Email Verification** | Token-based confirmation |
| **CORS Protection** | Whitelist-based origins |
| **Input Validation** | Pydantic schemas |
| **SQL Injection Prevention** | SQLAlchemy ORM |

---

## Conclusion

**Career Adviser** represents a comprehensive solution to modern career development challenges. By leveraging AI technology, the platform provides tailored guidance, practical tools, and a secure architecture to transform professional development.

---

![Project Logo](./AI%20Project%20SS/download.png)
