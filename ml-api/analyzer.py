from skills import SKILLS
import string 
import re

def normalize_punctuations(text):
    punctuations = ",;:!?{()[]}"
    translator = str.maketrans('','',punctuations) #remove specific punctuations.
    text = text.translate(translator)
    text = re.sub(r'\s+', ' ', text).strip() #remove multiple whitespaces

    return text 

def extract_skills(text):
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

def compare_skills(resume_skills, job_skills):
    matched = resume_skills.intersection(job_skills)
    missing = job_skills.difference(resume_skills)

    return matched, missing

def calculate_score(matched, job_skills):
    if len(job_skills) == 0:
        return 0

    return len(matched) / len(job_skills)

def analyze_resume(resume_text, job_text):
    
    #extract the skills from both jobs and resume
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_text)

    #compare how many are matching and how many are missing
    matched, missing = compare_skills(resume_skills, job_skills)
    
    #use formula to calculate the score
    score = calculate_score(matched, job_skills)

    matched_list = sorted(list(matched))
    missing_list = sorted(list(missing))

    return {
        "overallScore": int(score * 100),
        "probabilityScore": score,
        "matchedSkills": matched_list,
        "missingSkills": missing_list,
        "signals": {
            "keywordOverlap": score
        },
        "highImpactMissing": missing_list[:3],
        "explanation": [
            "Score based on skill overlap between resume and job description"
        ]
    }