import re
from textProcessor import normalize_punctuations
from skills import SKILLS, SECTION_WEIGHTS,RELATED_SKILLS


def extract_skills(text):
    
    #lowercase the text
    text = text.lower()
    
    #normalize punctutations in the text specifically
    text = normalize_punctuations(text)

    found = set() #empty set

    for category in SKILLS.values():
        for canonical in category:
            for skill in category[canonical]:
                if skill in text:
                    ind = text.find(skill)
                    left_ok = (ind == 0) or (not text[ind - 1].isalpha())
                    right_index = ind + len(skill)
                    right_ok = (right_index == len(text)) or (not text[right_index].isalpha())

                    if left_ok and right_ok:
                        found.add(canonical)

    return found

def get_weighted_resume_skills(parsed_sections):

    output = {}

    for section in ["skills", "projects", "experience", "other"]:
        skills_in_section = extract_skills(parsed_sections[section])
        weight = SECTION_WEIGHTS[section]

        for skill in skills_in_section:
            output[skill] = max(output.get(skill, 0), weight)

    return output
    
def compare_weighted_skills(weighted_resume_skills, job_skills):
    matched = set()
    missing = set()
    weighted_sum = 0

    for skill in job_skills:
        if skill in weighted_resume_skills:
            matched.add(skill)
            weighted_sum += weighted_resume_skills[skill]
        else:
            missing.add(skill)

    return matched, missing, weighted_sum

def find_related_skills(resume_skills, job_skills):
    related = set()

    for job_skill in job_skills:
        if job_skill in resume_skills:
            continue

        if job_skill in RELATED_SKILLS:
            for rel in RELATED_SKILLS[job_skill]:
                if rel in resume_skills:
                    related.add(rel)

    return related

def count_skill_mentions(text, skill):
    text = normalize_punctuations(text.lower())
    skill = skill.lower()
    return len(re.findall(rf'\b{re.escape(skill)}\b', text))


def get_high_impact_missing(job_text, missing_skills, related_skills):
    
    score = {}

    for skill in missing_skills:
        cnt = count_skill_mentions(job_text,skill)
        score[skill] = cnt

        if skill in RELATED_SKILLS:
            is_related_covered = False
            for i in RELATED_SKILLS[skill]:
                if i in related_skills:
                    is_related_covered = True
                    break
            
            if is_related_covered == False:
                score[skill] += 1
    
    sorted_values = [key for key, value in sorted(score.items(), key=lambda item: item[1], reverse=True)]
    return sorted_values

def calculate_score(weighted_sum, job_skills):
    if len(job_skills) == 0:
        return 0

    weighted_score = weighted_sum / (len(job_skills) * 2.0)
    return weighted_score
