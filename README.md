# MatchLens

## Resume–Job Match Analyzer

An AI-assisted system that analyzes how well a resume matches a job description.  
The platform extracts skills, compares them with job requirements, and produces an interpretable match score with insights.

The system is designed with a **scalable microservice architecture** separating the application backend from the ML analysis service.

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
- User interface for creating resumes and job descriptions
- Running analysis
- Viewing results and history

**Backend API (Node + Express + Prisma)**
- Authentication (JWT)
- Resume management
- Job description management
- Analysis orchestration
- Stores analysis history

**ML Service (Python + FastAPI)**
- Resume and job text processing
- Skill extraction
- Keyword analysis
- TF-IDF similarity
- Match scoring

**Database (PostgreSQL)**
- Users
- Resumes
- Job Descriptions
- Analysis Runs

---

# Key Features

### Resume Management
- Create and update resumes
- Save multiple resume versions
- Store resume text and tags

### Job Description Management
- Create and manage job descriptions
- Store relevant tags and content

### Resume–Job Analysis
The system analyzes resume–job compatibility using multiple signals:

- Skill overlap detection
- Keyword overlap scoring
- TF-IDF similarity analysis
- Missing skill identification
- High-impact skill suggestions

### Analysis Insights
Each analysis provides:

- Overall match score
- Probability score
- Matched skills
- Missing skills
- High-impact missing skills
- Detailed explanation
- Signal breakdown

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

---

# Scoring Method (V1)

The first version of the scoring system combines multiple signals:
```
Overall Score = 
0.50 × Skill Overlap
0.20 × Keyword Overlap
0.30 × TF-IDF Similarity
```

### Signals Explained

- **Skill Overlap**
Detects how many required skills appear in the resume.

- **Keyword Overlap**
Measures shared important words between resume and job description.

- **TF-IDF Similarity**
Captures contextual similarity between resume and job content.

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
  “overallScore”: 74,
  “probabilityScore”: 0.74,
  “matchedSkills”: [“node”, “postgresql”, “docker”],
  “missingSkills”: [],
  “highImpactMissing”: [],
  “signals”: {
  “skillOverlap”: 1,
  “keywordOverlap”: 0.54,
  “tfidfSimilarity”: 0.44
  },
  “explanation”: [
  “Score based on skill overlap between resume and job description”,
  “Keyword overlap measures shared keywords between texts”,
  “TF-IDF similarity measures contextual similarity between resume and job”
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

# Future Improvements (Upcoming Versions)

### ML Improvements
- Resume section analysis
- Skill importance weighting
- Domain-specific models
- Real resume datasets
- Embedding-based similarity

### Product Improvements
- Resume PDF/DOCX upload
- Automatic text extraction
- Resume improvement suggestions
- ATS-style scoring
- Recruiter feedback simulation

### System Improvements
- Docker containerization
- Background job queues
- Caching layer
- Model versioning
- Rate limiting

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
