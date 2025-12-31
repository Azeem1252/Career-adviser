# Career Adviser - Professional career Development Platform

Career Adviser is a sophisticated, AI-driven platform designed to empower professionals with strategic career insights, resume analysis, and trajectory planning. By leveraging advanced neural matching and market intelligence, the platform provides a comprehensive suite of tools for the modern career journey.

## Core Features

- **Strategic Dashboard**: Real-time overview of professional achievements, analysis history, and career growth metrics.
- **Skill Gap Analyzer**: High-fidelity resume analysis against specific job descriptions or market standards, identifying critical skill gaps.
- **Neural Roadmaps**: Dynamic, structured learning paths tailored for specific target roles and career trajectories.
- **Mock Interview Consultant**: AI-powered interview simulations with real-time feedback on technical accuracy and strategic depth.
- **Professional Asset Builder**: Generative engine for crafting high-impact cover letters and optimizing professional manifestos.
- **Career Knowledge Hub**: Curated library of resources and job opportunities tailored to individual skill profiles.

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with a premium glassmorphic UI design system.
- **Animations**: Framer Motion for smooth, interactive transitions.
- **State Management**: Zustand for efficient client-side state handling.

### Backend
- **Framework**: FastAPI (Python)
- **AI Integration**: Google Gemini API for advanced career matching, roadmap generation, and interview evaluation.
- **Database**: PostgreSQL with SQLAlchemy ORM for robust data management.
- **Migrations**: Alembic for version-controlled database schema evolution.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL

### Installation

1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend**:
   ```bash
   cd Backend-auth
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## Design Philosophy

Career Adviser prioritizes a clean, professional, and state-of-the-art user experience. The interface uses modern typography, vibrant accents, and functional animations to provide a premium feel while maintaining high usability for professional tasks.
