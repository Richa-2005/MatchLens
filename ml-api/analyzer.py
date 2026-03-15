from skills import SKILLS
import string 
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

#TF-IDF 
def compute_tfidf_similarity(resume_text, job_text):

    documents = [resume_text, job_text]

    vectorizer = TfidfVectorizer()

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

    return float(similarity[0][0])

def normalize_punctuations(text):
    punctuations = ",;:!?{()[]}"
    translator = str.maketrans('','',punctuations) #remove specific punctuations.
    text = text.translate(translator)
    text = re.sub(r'\s+', ' ', text).strip() #remove multiple whitespaces

    return text 

def stop_words(text):
    stop = {'the','and','is','or','are','am','must','should','for','of','in','to','a','an','has'}
    ans = []
    for word in text:
        if (word not in stop) and (len(word) >=3):
            ans.append(word)
    
    return ans

def tokenize_text(text):
    #lowercase the text
    text = text.lower()
    
    #normalize punctutations in the text specifically
    text = normalize_punctuations(text)
    
    #word list 
    text = text.split()
    #remove stop words
    text = stop_words(text)
    #convert to set to remove duplicates
    text = set(text)

    return text


def extract_keywords(resume, job):

    resume = tokenize_text(resume)
    job = tokenize_text(job)

    matched_key = resume.intersection(job)

    if len(job)==0:
        key_overlap = 0
    else :
        key_overlap = len(matched_key) / len(job)

    return matched_key,key_overlap

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

    matched_key,key_overlap = extract_keywords(resume_text,job_text)
    tfidf_score = compute_tfidf_similarity(resume_text, job_text)
    final_score = (score * 0.5) + (0.2 * key_overlap) + (0.3 * tfidf_score)
    return {
        "overallScore": int(final_score*100),
        "probabilityScore": final_score,
        "matchedSkills": matched_list,
        "missingSkills": missing_list,
        "signals": {
            "skillOverlap": score,
            "keywordOverlap": key_overlap,
            "tfidfSimilarity": tfidf_score
        },
        "highImpactMissing": missing_list[:3],
        "explanation": [
            "Score based on skill overlap between resume and job description",
            "Keyword overlap measures shared keywords between texts",
            "TF-IDF similarity measures contextual similarity between resume and job"
        ]
    }