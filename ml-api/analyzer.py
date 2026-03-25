from textProcessor import parse_sections
from similarity import compute_tfidf_similarity,extract_keywords
from impact import calculate_impact_score,generate_insights
from skill_matching import get_high_impact_missing, get_weighted_resume_skills, extract_skills,find_related_skills,compare_weighted_skills,calculate_score


def analyze_resume(resume_text, job_text):
    
    parsed_sections = parse_sections(resume_text)

    impact_score = calculate_impact_score(parsed_sections)
    
    weighted_resume_skills = get_weighted_resume_skills(parsed_sections)
    job_skills = extract_skills(job_text)

    resume_skills = set(weighted_resume_skills.keys())
    related_skills = sorted(list(find_related_skills(resume_skills, job_skills)))

    #compare how many are matching and how many are missing
    matched, missing, weighted_sum = compare_weighted_skills(weighted_resume_skills, job_skills)
    
    missing_list = get_high_impact_missing(job_text,missing,related_skills)

    #use formula to calculate the score
    skillOverlap = calculate_score(weighted_sum, job_skills)
    related_bonus = len(related_skills) / len(job_skills) if len(job_skills) > 0 else 0
    matched_list = sorted(list(matched))

    matched_key,key_overlap = extract_keywords(resume_text,job_text)
    tfidf_score = compute_tfidf_similarity(resume_text, job_text)

    insights = generate_insights(skillOverlap,key_overlap,tfidf_score,impact_score,
                                 related_bonus,missing_list[:3],related_skills)

    final_score = (
        0.4 * skillOverlap +
        0.15 * key_overlap +
        0.2 * tfidf_score +
        0.15 * impact_score +
        0.1 * related_bonus
    )
    return {
        "overallScore": int(final_score*100),
        "probabilityScore": final_score,
        "matchedSkills": matched_list,
        "missingSkills": sorted(list(missing)),
        "relatedSkills": related_skills,
        "signals": {
            "skillOverlap": skillOverlap,
            "keywordOverlap": key_overlap,
            "tfidfSimilarity": tfidf_score,
            "impactScore": impact_score,
            "relatedSkillBonus": related_bonus
        },
        "highImpactMissing": missing_list[:3],
        "insights": {
            "strengths": insights["strengths"],
            "issues": insights["issues"],
            "tips": insights["tips"]
        },
        "explanation": [
            "Score combines weighted skill evidence from resume sections",
            "Keyword overlap measures shared job language",
            "TF-IDF similarity measures overall contextual similarity",
            "Impact score rewards measurable achievements in projects and experience"
        ]
    }


