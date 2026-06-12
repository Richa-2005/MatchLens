from textProcessor import parse_sections
from similarity import extract_keywords
from semantic import compute_section_semantic_similarity, find_related_skills_by_embedding
from impact import calculate_impact_score,generate_insights
from skill_matching import get_high_impact_missing, get_weighted_resume_skills, extract_skills,compare_weighted_skills,calculate_score
from role_classifier import calculate_role_match
from keyword_quality import analyze_keyword_quality
from summary_generator import generate_resume_summary

def analyze_resume(resume_text, job_text):
    
    parsed_sections = parse_sections(resume_text)

    impact_score = calculate_impact_score(parsed_sections)
    
    weighted_resume_skills = get_weighted_resume_skills(parsed_sections)
    job_skills = extract_skills(job_text)

    resume_skills = set(weighted_resume_skills.keys())
    role_match = calculate_role_match(
        resume_text,
        job_text,
        resume_skills,
        job_skills
    )

    role_match_score = role_match["matchScore"]

    related_skill_map, related_skill_similarity = find_related_skills_by_embedding(
        resume_skills,
        job_skills
    )
    related_skills = sorted(list(related_skill_map.keys()))

    #compare how many are matching and how many are missing
    matched, missing, weighted_sum = compare_weighted_skills(
        weighted_resume_skills,
        job_skills,
        related_skill_similarity,
        related_skill_map
    )
    
    missing_list = get_high_impact_missing(job_text,missing)

    #use formula to calculate the score
    skillOverlap = calculate_score(weighted_sum, job_skills)
    related_bonus = len(related_skills) / len(job_skills) if len(job_skills) > 0 else 0
    matched_list = sorted(list(matched))

    matched_key,key_overlap = extract_keywords(resume_text,job_text)
    semantic_score, section_semantic_scores = compute_section_semantic_similarity(
        parsed_sections,
        job_text
    )

    keyword_quality = analyze_keyword_quality(
        resume_text,
        job_skills,
        key_overlap,
        semantic_score
    )
    summary = generate_resume_summary(
        role_match,
        matched_list,
        sorted(list(missing)),
        impact_score,
        semantic_score
    )

    insights = generate_insights(
        skillOverlap,
        key_overlap,
        semantic_score,
        impact_score,
        related_bonus,
        missing_list[:3],
        related_skills,
        role_match
    )

    final_score = (
        0.28 * semantic_score +
        0.24 * skillOverlap +
        0.12 * key_overlap +
        0.08 * related_bonus +
        0.1 * impact_score +
        0.1 * role_match_score +
        0.08 * keyword_quality["keywordQualityScore"]
    )
    
    return {
        "overallScore": int(final_score*100),
        "probabilityScore": final_score,
        "matchedSkills": matched_list,
        "missingSkills": sorted(list(missing)),
        "relatedSkills": related_skills,
        "summary": summary,
        "signals": {
            "skillOverlap": skillOverlap,
            "keywordOverlap": key_overlap,
            "semanticSimilarity": semantic_score,
            "impactScore": impact_score,
            "relatedSkillBonus": related_bonus,
            "sectionSemanticScores": section_semantic_scores,
            "roleMatchScore": role_match_score,
            "roleMatch": role_match,
            "keywordQualityScore": keyword_quality["keywordQualityScore"],
            "keywordStuffingRisk": keyword_quality["keywordStuffingRisk"],
            "overusedKeywords": keyword_quality["overusedKeywords"]
        },
        "highImpactMissing": missing_list[:3],
        "insights": {
            "strengths": insights["strengths"],
            "issues": insights["issues"],
            "tips": insights["tips"]
        },
        "explanation": [
            "Score combines semantic alignment, skill coverage, keyword relevance, role match, and impact evidence.",
            "Semantic similarity uses section-aware embeddings to compare resume meaning with the job description.",
            "Skill overlap rewards exact and semantically related skill matches across resume sections.",
            "Impact score rewards action-driven project and experience bullets with outcomes, metrics, or scale.",
            "Role match checks whether the resume direction aligns with the target job category."
        ]
    }

