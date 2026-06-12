import re
from textProcessor import normalize_punctuations


def count_mentions(text, keyword):
    text = normalize_punctuations(text.lower())
    keyword = keyword.lower()
    return len(re.findall(rf"\b{re.escape(keyword)}\b", text))


def analyze_keyword_quality(resume_text, job_skills, keyword_overlap, semantic_score):
    overused = []

    for skill in job_skills:
        count = count_mentions(resume_text, skill)
        if count > 5:
            overused.append(skill)

    stuffing_risk = "low"

    if len(overused) > 0:
        stuffing_risk = "medium"

    if keyword_overlap >= 0.45 and semantic_score < 0.35:
        stuffing_risk = "high"

    penalty = min(len(overused) * 0.1, 0.3)

    if stuffing_risk == "high":
        keyword_quality_score = max(keyword_overlap - 0.3, 0)
    else:
        keyword_quality_score = max(keyword_overlap - penalty, 0)

    return {
        "keywordQualityScore": round(keyword_quality_score, 4),
        "keywordStuffingRisk": stuffing_risk,
        "overusedKeywords": overused
    }