def impact_label(score):
    if score >= 0.6:
        return "strong impact evidence"
    if score >= 0.35:
        return "moderate implementation evidence"
    return "limited measurable impact"


def generate_resume_summary(
    role_match,
    matched_skills,
    missing_skills,
    impact_score,
    semantic_score
):
    resume_role = role_match.get("resumeRole", "unknown").replace("_", " ")
    job_role = role_match.get("jobRole", "unknown").replace("_", " ")

    top_skills = matched_skills[:4]
    top_missing = missing_skills[:3]

    skill_text = ", ".join(top_skills) if top_skills else "limited direct skill matches"
    missing_text = ", ".join(top_missing) if top_missing else "no major missing skills"

    impact_text = impact_label(impact_score)

    profile_summary = (
        f"This resume appears closest to a {resume_role} profile and is being compared "
        f"against a {job_role} role. It shows alignment through {skill_text}."
    )

    recruiter_view = (
        f"Recruiter view: The candidate has {skill_text}. "
        f"The main gaps are {missing_text}. "
        f"The resume shows {impact_text}. "
    )

    if semantic_score >= 0.6:
        recruiter_view += "Overall role alignment is meaningfully strong."
    elif semantic_score >= 0.35:
        recruiter_view += "Overall role alignment is moderate and could improve with sharper targeting."
    else:
        recruiter_view += "Overall role alignment appears weak for this job."

    return {
        "profileSummary": profile_summary,
        "recruiterView": recruiter_view
    }