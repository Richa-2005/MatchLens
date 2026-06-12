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
                "developed", "automated", "achieved", "led", "design", "implement", 
                "integrate", "deploy", "create"}

SCALE_WORDS = {"users","records","entries","requests","queries","apis","customers",
               "models","reports", "datasets", "performance", "latency", "accuracy", 
               "system", "platform"}

# RELATED_SKILLS = {
#     "python": ["django", "flask", "pandas", "numpy"],
#     "javascript": ["react", "node", "express"],
#     "machine learning": ["scikit-learn", "tensorflow", "pytorch"],
#     "data analysis": ["pandas", "numpy", "excel"],
#     "sql": ["postgresql", "mysql", "sqlite"]
# }

OUTCOME_WORDS = {
    "improve", "increase", "reduce", "decrease", "optimize",
    "boost", "enhance", "accelerate", "automate", "streamline",
    "save", "cut", "achieve"
}

METRIC_CONTEXT_WORDS = {
    "user", "users", "api", "apis", "request", "requests", "endpoint", "endpoints",
    "ms", "sec", "seconds", "minutes", "hour", "hours", "day", "days",
    "latency", "accuracy", "performance", "speed", "throughput",
    "record", "records", "dataset", "datasets", "project", "projects"
}


ROLE_KEYWORDS = {
    "frontend": {
        "react", "html", "css", "javascript", "typescript", "tailwind",
        "ui", "frontend", "components", "hooks", "state", "responsive"
    },
    "backend": {
        "node", "express", "api", "rest api", "sql", "mongodb",
        "postgresql", "database", "backend", "server", "authentication", "jwt"
    },
    "fullstack": {
        "react", "node", "express", "api", "rest api", "database",
        "frontend", "backend", "fullstack", "full stack"
    },
    "data_science": {
        "python", "pandas", "numpy", "matplotlib", "data", "dataset",
        "visualization", "regression", "classification", "analysis"
    },
    "machine_learning": {
        "machine learning", "ml", "model", "scikit-learn", "tensorflow",
        "pytorch", "training", "prediction", "classification", "regression"
    },
}