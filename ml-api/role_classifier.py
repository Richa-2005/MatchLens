from textProcessor import tokenize_text
from skills import ROLE_KEYWORDS

def classify_role(text, skills):
    text_lower = text.lower()
    tokens = set(tokenize_text(text_lower))
    skill_set = set(skills)

    role_scores = {}

    for role, keywords in ROLE_KEYWORDS.items():
        score = 0

        for keyword in keywords:
            if keyword in skill_set:
                score += 2

            if " " in keyword:
                if keyword in text_lower:
                    score += 1
            else:
                if keyword in tokens:
                    score += 1

        role_scores[role] = score

    best_role = max(role_scores, key=role_scores.get)
    best_score = role_scores[best_role]

    if best_score == 0:
        return {
            "role": "unknown",
            "confidence": 0,
            "scores": role_scores
        }

    total_score = sum(role_scores.values())
    confidence = best_score / total_score if total_score > 0 else 0

    return {
        "role": best_role,
        "confidence": round(confidence, 3),
        "scores": role_scores
    }


def calculate_role_match(resume_text, job_text, resume_skills, job_skills):
    resume_role = classify_role(resume_text, resume_skills)
    job_role = classify_role(job_text, job_skills)

    if resume_role["role"] == "unknown" or job_role["role"] == "unknown":
        match_score = 0.5
    elif resume_role["role"] == job_role["role"]:
        match_score = 1.0
    elif {
        resume_role["role"],
        job_role["role"]
    } <= {"frontend", "backend", "fullstack"}:
        match_score = 0.75
    elif {
        resume_role["role"],
        job_role["role"]
    } <= {"data_science", "machine_learning"}:
        match_score = 0.75
    else:
        match_score = 0.25

    return {
        "resumeRole": resume_role["role"],
        "jobRole": job_role["role"],
        "matchScore": match_score,
        "resumeConfidence": resume_role["confidence"],
        "jobConfidence": job_role["confidence"],
        "resumeRoleScores": resume_role["scores"],
        "jobRoleScores": job_role["scores"]
    }