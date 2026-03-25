import re
from textProcessor import normalize_punctuations
from skills import ACTION_WORDS,SCALE_WORDS

def count_elements(text):
    
    perc_rx = r'\d+(?:\.\d+)?\s*(?:%|percent)'
    mult_rx = r'\b\d+(?:\.\d+)?\s*[xX]\b'
    num_rx = r'\b\d+(?:\.\d+)?\b(?!\s*(?:%|percent|[xX]))'

    ans = len(re.findall(perc_rx, text, re.IGNORECASE)) + len(re.findall(mult_rx, text, re.IGNORECASE)) + len(re.findall(num_rx, text))

    return ans
    

def calculate_impact_score(parsed_sections):
    impact_text = " ".join(parsed_sections["projects"]) + " " + " ".join(parsed_sections["experience"])
    
    impact_text = impact_text.lower()
    impact_text = normalize_punctuations(impact_text)
    action_count = 0
    scale_count = 0
    for word in impact_text.split():
        if word in ACTION_WORDS:
            action_count = action_count +1
        elif word in SCALE_WORDS:
            scale_count = scale_count+1
    
    numeric_count = count_elements(impact_text)
    
    numeric_score = min(numeric_count / 3, 1.0)
    action_score = min(action_count / 4, 1.0)
    scale_score = min(scale_count / 3, 1.0)

    impactScore = 0.4 * numeric_score + 0.3 * action_score + 0.3 * scale_score

    return impactScore


def generate_insights(skillOverlap, keywordOverlap, tfidfSimilarity, impactScore, relatedSkillBonus,
    highImpactMissing, relatedSkills):

    insights = {
        "strengths": [],
        "issues": [],
        "tips": []
    }

    if skillOverlap >= 0.7:
        insights["strengths"].append(
            "Your resume demonstrates strong alignment with the core technical requirements of the role."
        )

    if keywordOverlap >= 0.5:
        insights["strengths"].append(
            "You effectively use keywords and terminology that match the job description."
        )

    if impactScore >= 0.6:
        insights["strengths"].append(
            "Your projects and experience include measurable outcomes, which strengthens credibility."
        )

    if len(relatedSkills) > 0:
        tools = ", ".join(relatedSkills[:3])
        insights["strengths"].append(
            f"You show relevant adjacent skills such as {tools}, indicating transferable knowledge."
        )

    if impactScore < 0.35:
        insights["issues"].append(
            "Your resume lacks measurable achievements or quantified results in projects or experience."
        )
        insights["tips"].append(
            "Add numbers, percentages, or scale (e.g., users, performance improvements) to highlight impact."
        )

    if len(highImpactMissing) > 0:
        tools = ", ".join(highImpactMissing[:3])
        insights["issues"].append(
            f"Key required skills such as {tools} are missing or not clearly highlighted."
        )
        insights["tips"].append(
            f"If you have experience with {tools}, include it clearly; otherwise consider prioritizing these skills."
        )

    if keywordOverlap < 0.3:
        insights["issues"].append(
            "Your resume does not closely reflect the language and keywords used in the job description."
        )
        insights["tips"].append(
            "Align your wording with the job description by reusing relevant terms and phrases naturally."
        )

    if tfidfSimilarity < 0.3:
        insights["issues"].append(
            "Overall, your resume content is not strongly aligned with this specific role."
        )
        insights["tips"].append(
            "Tailor your resume by emphasizing the most relevant experience and removing unrelated content."
        )

    if skillOverlap < 0.4:
        insights["issues"].append(
            "There is a low overlap between your skills and the core requirements of the role."
        )
        insights["tips"].append(
            "Focus on showcasing projects or experiences that directly match the required skills."
        )
    

    # Related skill improvement
    if relatedSkillBonus > 0 and len(highImpactMissing) > 0:
        tools = ", ".join(highImpactMissing[:2])
        rel = ", ".join(relatedSkills[:2])

        insights["issues"].append(
            f"You have related experience (e.g., {rel}), but the exact required skills like {tools} are not explicitly mentioned."
        )

        insights["tips"].append(
            f"Explicitly mention skills like {tools} in your resume if applicable, even if they were used indirectly through tools like {rel}."
        )

    insights["strengths"] = insights["strengths"][:3]
    insights["issues"] = insights["issues"][:3]
    insights["tips"] = insights["tips"][:3]

    return insights