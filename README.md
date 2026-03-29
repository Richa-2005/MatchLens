# MatchLens

## Resume–Job Match Analyzer

MatchLens is an AI-assisted platform that evaluates how well a resume aligns with a job description.
It extracts skills, compares them with job requirements, and generates an interpretable match score with actionable insights.

The system is designed with a scalable multi-service architecture, separating application logic from ML processing for flexibility and future extensibility.

---

# Project Architecture

The system is built using a **multi-service architecture**: <br />
```
React Frontend 
    │ 
    ▼ 
Express Backend API (app-api) 
    │ 
    ▼ 
FastAPI ML Service (ml-api) 
    │ 
    ▼ 
PostgreSQL Database 
```
### Components

**Frontend (React)**
- Create, edit, and manage resumes and job descriptions
- Run analysis and view detailed results
- Browse analysis history with filtering
- Dark/light themed UI


**Backend API (Node + Express + Prisma)**
- JWT-based authentication
- Resume & job CRUD operations
- Analysis orchestration
- Prevents duplicate analysis using content hashing
- Maintains consistency between resumes, jobs, and analysis

**ML Service (Python + FastAPI)**
- Resume & job preprocessing
- Skill extraction
- Keyword analysis
- TF-IDF similarity computation
- Multi-signal scoring

**Database (PostgreSQL)**
- Users
- Resumes
- Job Descriptions
- Analysis Runs

---

# Key Features

### Resume Management
- Create, edit, and delete resumes and job descriptions
- Store multiple versions
- Inline editing with prefilled data
- Tag extraction for quick insights

### Job Description Management
- Create and manage job descriptions
- Store relevant tags and content

### Resume–Job Analysis
The system analyzes resume–job compatibility using multiple signals:

- Multi-signal scoring system
- Skill overlap detection
- Keyword overlap scoring
- TF-IDF similarity analysis
- Missing & high-impact skill identification

### Analysis Intelligence

Each analysis provides:
- Overall match score
- Probability score
- Matched / related / missing skills
- High-impact missing skills
- Signal breakdown (5 metrics)
- Structured insights:
1. Strengths
2. Issues
3. Actionable improvement tips
- Human-readable explanations

### Analysis History & Reuse
- View all past analyses
- Filter by resume or job
- Reuse existing resume–job pairs
- Prevent duplicate analyses using content hashing

### Data Consistency
- Automatically removes dependent analyses when a resume/job is deleted
- Ensures fresh analysis after updates
---

# Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

### ML Service
- Python
- FastAPI
- Scikit-learn
- TF-IDF Vectorization
- NLP preprocessing

### Frontend 
- React
- Axios
- Context API / State Management
- Tailwind CSS
---

# Scoring Method (V1)

The first version of the scoring system combines multiple signals:
```
Overall Score =
    0.40 × Skill Overlap +
    0.15 × Keyword Overlap +
    0.20 × TF-IDF Similarity +
    0.15 × Impact Score +
    0.10 × Related Skill Bonus
```

### Signals Explained

- **Skill Overlap**
Detects how many required skills appear in the resume.

- **Keyword Overlap**
Measures shared important words between resume and job description.

- **TF-IDF Similarity**
Captures contextual similarity between resume and job content.

- **Impact Score**
Rewards measurable achievements (e.g., metrics, scale, results)

- **Related Skill Bonus**
Credits transferable or adjacent skills

⚠️ Note: The scoring is heuristic-based and currently calibrated for interpretability. Further improvements are planned.

---

# API Overview

### Resume API
```
POST /resumes
GET /resumes
GET /resumes/:id
PUT /resumes/:id
DELETE /resumes/:id
```

### Job Description API
```
POST /jobs
GET /jobs
GET /jobs/:id
PUT /jobs/:id
DELETE /jobs/:id
```

### Analysis API
```
POST /analysis
GET /analysis?resumeId=&jobId=
GET /analysis/:id
```

---

# Example Analysis Response
```
{
  "overallScore": 68,
  "probabilityScore": 0.68,
  "matchedSkills": ["node", "express", "react"],
  "missingSkills": ["docker"],
  "relatedSkills": ["postgresql"],
  "highImpactMissing": ["docker"],
  "signals": {
    "skillOverlap": 0.7,
    "keywordOverlap": 0.5,
    "tfidfSimilarity": 0.42,
    "impactScore": 0.2,
    "relatedSkillBonus": 0.15
  },
  "insights": {
    "strengths": ["Strong full-stack alignment"],
    "issues": ["Missing key deployment skills"],
    "tips": ["Add Docker or deployment experience"]
  },
  "explanation": [
    "Score combines weighted skill evidence from resume sections",
    "Keyword overlap measures shared job language",
    "TF-IDF similarity measures overall contextual similarity",
    "Impact score rewards measurable achievements in projects and experience"
  ]
}
```

---

# Running the Project

## Backend API
```
cd app-api
npm install
npm run dev
```

---

## ML Service
```
cd ml-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app –reload –port xxxx
```

---

# Environment Variables

### Backend `.env`
```
DATABASE_URL=
JWT_SECRET=
ML_API_URL=http://localhost:xxxx
```

---

# Future Improvements (V3+)

### ML Improvements
- Improved scoring calibration (reduce under/overestimation)
- Skill importance weighting based on job context
- Embedding-based similarity (BERT / Sentence Transformers)
- Resume section-level analysis (projects, experience, skills)

### Product Improvements
- Better explanation quality (more personalized insights)
- Resume improvement rewriting suggestions
- ATS-style recruiter feedback simulation

### System Improvements
- Dockerization of services
- Background job queues for async analysis
- Caching layer for faster repeated queries
- Model versioning and experiment tracking

---

# Learning Goals

This project was built not only to implement resume analysis but also to explore **scalable software architecture**:

- Separation of application logic and ML services
- API-based microservice communication
- Structured data storage for ML insights
- Extensible scoring pipeline
- Versionable analysis results

The architecture allows future ML models to be upgraded independently without changing the application backend.

---

# Author

Richa Gupta  
Computer Science Engineering Student  
