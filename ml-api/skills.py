#Skills dataset

SKILLS = {
    "programming": {
        "python": ["python"],
        "java": ["java"],
        "javascript": ["javascript", "js"],
        "typescript": ["typescript", "ts"],
        "cpp": ["c++", "cpp"],
        "go": ["go", "golang"],
        "rust": ["rust"],
    },

    "backend": {
        "node": ["node", "nodejs", "node.js"],
        "express": ["express", "expressjs"],
        "django": ["django"],
        "flask": ["flask"],
        "fastapi": ["fastapi"],
        "spring": ["spring", "springboot", "spring boot"],
        "rest api": ["rest api", "restful api", "rest"],
        "graphql": ["graphql"],
        "microservices": ["microservices", "microservice"],
    },

    "frontend": {
        "react": ["react", "reactjs", "react.js"],
        "nextjs": ["nextjs", "next.js"],
        "html": ["html"],
        "css": ["css"],
        "tailwind": ["tailwind", "tailwindcss"],
        "redux": ["redux"],
        "webpack": ["webpack"],
    },

    "database": {
        "postgresql": ["postgresql", "postgres"],
        "mysql": ["mysql"],
        "mongodb": ["mongodb", "mongo"],
        "redis": ["redis"],
        "sql": ["sql"],
        "prisma": ["prisma"],
    },

    "devops": {
        "docker": ["docker"],
        "kubernetes": ["kubernetes", "k8s"],
        "aws": ["aws", "amazon web services"],
        "gcp": ["gcp", "google cloud"],
        "ci/cd": ["ci cd", "ci/cd", "continuous integration"],
        "nginx": ["nginx"],
    },

    "ml": {
        "machine learning": ["machine learning", "ml"],
        "deep learning": ["deep learning", "dl"],
        "nlp": ["nlp", "natural language processing"],
        "pandas": ["pandas"],
        "numpy": ["numpy"],
        "scikit-learn": ["scikit", "scikit learn", "scikit-learn"],
        "tensorflow": ["tensorflow"],
        "pytorch": ["pytorch", "torch"],
    },

    "cs_fundamentals": {
        "dsa": ["dsa", "data structures", "data structures and algorithms"],
        "system design": ["system design"],
        "operating systems": ["operating systems", "os"],
        "dbms": ["dbms", "database management system"],
        "computer networks": ["computer networks", "cn"],
    }
}

SECTIONS={
    "skills":["skills", "technical skills", "core competencies"],
    "projects": ["projects", "academic projects", "personal projects"],
	"experience": ["experience", "work experience", "internship, employment"],
	"education": ["education", "academic background"]
}

SECTION_WEIGHTS = {
    "skills": 1.0,
    "projects": 1.5,
    "experience": 2.0,
    "other": 0.5
}

ACTION_WORDS = { "improved", "increased", "reduced", "optimized", "built", "created", 
                "developed", "automated", "achieved", "led"}

SCALE_WORDS = {"users","records","entries","requests","queries","apis","customers",
               "datasets","models","reports"}

RELATED_SKILLS = {
    "python": ["django", "flask", "pandas", "numpy"],
    "javascript": ["react", "node", "express"],
    "machine learning": ["scikit-learn", "tensorflow", "pytorch"],
    "data analysis": ["pandas", "numpy", "excel"],
    "sql": ["postgresql", "mysql", "sqlite"]
}