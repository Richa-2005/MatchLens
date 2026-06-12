import re
import spacy
from textProcessor import normalize_punctuations
from skills import ACTION_WORDS, SCALE_WORDS,METRIC_CONTEXT_WORDS, OUTCOME_WORDS

nlp = spacy.load("en_core_web_sm")


def clean_bullet_lines(lines):
    cleaned = []

    for line in lines:
        if not line or not line.strip():
            continue

        text = normalize_punctuations(line.lower().strip())

        # remove common bullet/numbering prefixes
        text = re.sub(r"^\s*([•●■\-\*\d\.\)\(]+)\s*", "", text)

        # collapse extra spaces
        text = re.sub(r"\s+", " ", text).strip()

        if len(text) >= 6:
            cleaned.append(text)

    return cleaned


def split_long_text_to_bullets(text):
    if not text or not text.strip():
        return []

    text = normalize_punctuations(text.lower())

    # fallback for badly parsed PDF text
    parts = re.split(r"[•●■;\n]+|\.\s+", text)

    return clean_bullet_lines(parts)


def has_metric_pattern(text):
    percent_pattern = r"\b\d+(?:\.\d+)?\s*(%|percent)\b"
    multiplier_pattern = r"\b\d+(?:\.\d+)?\s*x\b"
    plain_number_pattern = r"\b\d+(?:\.\d+)?\b"

    return bool(
        re.search(percent_pattern, text)
        or re.search(multiplier_pattern, text)
        or re.search(plain_number_pattern, text)
    )


def has_metric_context(doc):
    lemmas = {token.lemma_.lower() for token in doc}
    return any(word in lemmas for word in METRIC_CONTEXT_WORDS)


def score_bullet(text):
    """
    Scores one project/experience bullet from 0.0 to 1.0.

    Strong bullet:
    - action + metric + outcome/scale

    Medium bullet:
    - action + implementation evidence

    Weak bullet:
    - vague or no clear achievement
    """

    if not text.strip():
        return 0.0

    doc = nlp(text)

    has_action = False
    has_scale = False
    has_outcome = False

    for token in doc:
        lemma = token.lemma_.lower()

        if token.pos_ == "VERB" and lemma in ACTION_WORDS:
            has_action = True

        if lemma in SCALE_WORDS:
            has_scale = True

        if lemma in OUTCOME_WORDS:
            has_outcome = True

    has_metric = has_metric_pattern(text)
    useful_metric = has_metric and has_metric_context(doc)

    if has_action and useful_metric and (has_outcome or has_scale):
        return 1.0

    if has_action and useful_metric:
        return 0.8

    if has_action and (has_outcome or has_scale):
        return 0.65

    if has_action:
        return 0.45

    if useful_metric and (has_outcome or has_scale):
        return 0.35

    if useful_metric:
        return 0.2

    return 0.0


def score_section(section_lines):
    """
    Scores a section like projects or experience.
    """

    bullets = clean_bullet_lines(section_lines)

    if not bullets:
        return 0.0

    bullet_scores = [score_bullet(bullet) for bullet in bullets]

    avg_score = sum(bullet_scores) / len(bullet_scores)

    strong_bullets = sum(1 for score in bullet_scores if score >= 0.8)
    medium_bullets = sum(1 for score in bullet_scores if 0.45 <= score < 0.8)

    # small bonus for multiple meaningful bullets
    bonus = min((strong_bullets * 0.08) + (medium_bullets * 0.03), 0.2)

    return min(avg_score + bonus, 1.0)


def calculate_impact_score(parsed_sections):
    """
    Final impact score from 0.0 to 1.0.

    Experience is usually stronger evidence than projects.
    But if the user has no experience section, projects are allowed
    to carry the impact score fully. This is important for student resumes.
    """

    exp_lines = parsed_sections.get("experience", [])
    project_lines = parsed_sections.get("projects", [])

    if isinstance(exp_lines, str):
        exp_lines = split_long_text_to_bullets(exp_lines)

    if isinstance(project_lines, str):
        project_lines = split_long_text_to_bullets(project_lines)

    exp_bullets = clean_bullet_lines(exp_lines)
    project_bullets = clean_bullet_lines(project_lines)

    exp_score = score_section(exp_bullets)
    project_score = score_section(project_bullets)

    has_exp = len(exp_bullets) > 0
    has_projects = len(project_bullets) > 0

    if has_exp and has_projects:
        final_score = (0.6 * exp_score) + (0.4 * project_score)
    elif has_exp:
        final_score = exp_score
    elif has_projects:
        final_score = project_score
    else:
        final_score = 0.0

    return round(min(final_score, 1.0), 3)


def generate_insights(
    skillOverlap,
    keywordOverlap,
    semanticSimilarity,
    impactScore,
    relatedSkillBonus,
    highImpactMissing,
    relatedSkills,
    roleMatch
):
    insights = {
        "strengths": [],
        "issues": [],
        "tips": []
    }
    roleMatchScore = roleMatch.get("matchScore", 0.5)
    resumeRole = roleMatch.get("resumeRole", "unknown")
    jobRole = roleMatch.get("jobRole", "unknown")

    if skillOverlap >= 0.6:
        insights["strengths"].append(
            "Your resume shows strong coverage of the technical skills required for this role."
        )

    if keywordOverlap >= 0.45:
        insights["strengths"].append(
            "Your resume uses several important terms that appear in the job description."
        )

    if semanticSimilarity >= 0.6:
        insights["strengths"].append(
            "Your resume is meaningfully aligned with the role, even beyond exact keyword matches."
        )

    if impactScore >= 0.6:
        insights["strengths"].append(
            "Your projects or experience show strong impact through actions, outcomes, or measurable evidence."
        )
    elif impactScore >= 0.35:
        insights["strengths"].append(
            "Your resume shows practical implementation work, but the impact could be made clearer with stronger outcomes or metrics."
        )

    if len(relatedSkills) > 0:
        skills = ", ".join(relatedSkills[:3])
        insights["strengths"].append(
            f"You partially cover related requirements such as {skills}."
        )

    if impactScore < 0.3:
        insights["issues"].append(
            "Your resume does not show enough measurable or outcome-driven impact in projects or experience."
        )
        insights["tips"].append(
            "Rewrite some bullets to show what you built, what problem it solved, and any numbers or scale involved."
        )

    if len(highImpactMissing) > 0:
        skills = ", ".join(highImpactMissing[:3])
        insights["issues"].append(
            f"Important required skills such as {skills} are not clearly covered."
        )
        insights["tips"].append(
            f"If you have used {skills}, mention them clearly in your projects or experience."
        )

    if keywordOverlap < 0.3:
        insights["issues"].append(
            "Your resume does not strongly reflect the wording used in the job description."
        )
        insights["tips"].append(
            "Use relevant job description terms naturally, especially in project and experience bullets."
        )

    if semanticSimilarity < 0.35:
        insights["issues"].append(
            "The overall resume content is not strongly aligned with this role."
        )
        insights["tips"].append(
            "Tailor the resume toward this specific role by emphasizing the most relevant work."
        )

    if skillOverlap < 0.35:
        insights["issues"].append(
            "The overlap between demonstrated skills and job requirements is still low."
        )
        insights["tips"].append(
            "Prioritize role-specific tools, frameworks, and technical skills more clearly."
        )

    if roleMatchScore >= 0.9 and jobRole != "unknown":
        insights["strengths"].append(
            f"Your resume direction matches the target {jobRole.replace('_', ' ')} role."
        )

    elif roleMatchScore <= 0.4 and resumeRole != "unknown" and jobRole != "unknown":
        insights["issues"].append(
            f"Your resume appears closer to a {resumeRole.replace('_', ' ')} profile, while this job is closer to {jobRole.replace('_', ' ')}."
        )
        insights["tips"].append(
            f"Reframe your projects, skills, and summary toward the {jobRole.replace('_', ' ')} role before applying."
        )

    insights["strengths"] = insights["strengths"][:3]
    insights["issues"] = insights["issues"][:3]
    insights["tips"] = insights["tips"][:3]

    return insights