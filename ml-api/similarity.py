from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from textProcessor import tokenize_text

def compute_tfidf_similarity(resume_text, job_text):

    documents = [resume_text, job_text]

    vectorizer = TfidfVectorizer()

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

    return float(similarity[0][0])

def extract_keywords(resume, job):

    resume = set(tokenize_text(resume))
    job = set(tokenize_text(job))

    matched_key = resume.intersection(job)

    if len(job)==0:
        key_overlap = 0
    else :
        key_overlap = len(matched_key) / len(job)

    return matched_key,key_overlap