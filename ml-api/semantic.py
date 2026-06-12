from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)


def normalize_text(text: str) -> str:
    return " ".join(text.split()).strip()


def split_into_chunks(text: str, max_len: int = 220):
    text = normalize_text(text)

    if not text:
        return []

    sentences = text.split(".")
    chunks = []
    current = ""

    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue

        if len(current) + len(sent) <= max_len:
            current = f"{current} {sent}".strip()
        else:
            if current:
                chunks.append(current)
            current = sent

    if current:
        chunks.append(current)

    return chunks


def get_chunk_similarity(section_text: str, job_text: str) -> float:
    section_text = normalize_text(section_text)
    job_text = normalize_text(job_text)

    if not section_text or not job_text:
        return 0.0

    chunks = split_into_chunks(section_text)

    if not chunks:
        return 0.0

    job_vec = model.encode(
        job_text,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    chunk_vecs = model.encode(
        chunks,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    similarities = cosine_similarity(
        chunk_vecs,
        job_vec.reshape(1, -1)
    ).flatten()

    top_score = float(np.max(similarities))
    avg_score = float(np.mean(similarities))

    # max catches the best relevant section, average prevents one lucky line from dominating
    return round((0.75 * top_score) + (0.25 * avg_score), 4)


def compute_section_semantic_similarity(parsed_sections, job_text: str):
    skills_text = " ".join(parsed_sections.get("skills", []))
    projects_text = " ".join(parsed_sections.get("projects", []))
    experience_text = " ".join(parsed_sections.get("experience", []))
    other_text = " ".join(parsed_sections.get("other", []))

    section_scores = {
        "skills": get_chunk_similarity(skills_text, job_text),
        "projects": get_chunk_similarity(projects_text, job_text),
        "experience": get_chunk_similarity(experience_text, job_text),
        "other": get_chunk_similarity(other_text, job_text),
    }

    has_experience = len(experience_text.strip()) > 0
    has_projects = len(projects_text.strip()) > 0
    has_skills = len(skills_text.strip()) > 0
    has_other = len(other_text.strip()) > 0

    weighted_sum = 0.0
    total_weight = 0.0

    if has_experience:
        weighted_sum += section_scores["experience"] * 0.45
        total_weight += 0.45

    if has_projects:
        weighted_sum += section_scores["projects"] * 0.35
        total_weight += 0.35

    if has_skills:
        weighted_sum += section_scores["skills"] * 0.15
        total_weight += 0.15

    if has_other:
        weighted_sum += section_scores["other"] * 0.05
        total_weight += 0.05

    if total_weight == 0:
        final_score = 0.0
    else:
        final_score = weighted_sum / total_weight

    return round(final_score, 4), section_scores


def compute_semantic_similarity(resume_text: str, job_text: str) -> float:
    """
    Fallback old-style full resume semantic score.
    Keep this if any old code still calls compute_semantic_similarity(resume_text, job_text).
    """
    resume_text = normalize_text(resume_text)
    job_text = normalize_text(job_text)

    if not resume_text or not job_text:
        return 0.0

    chunks = split_into_chunks(resume_text)

    if not chunks:
        return 0.0

    job_vec = model.encode(
        job_text,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    chunk_vecs = model.encode(
        chunks,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    similarities = cosine_similarity(
        chunk_vecs,
        job_vec.reshape(1, -1)
    ).flatten()

    top_score = float(np.max(similarities))
    avg_score = float(np.mean(similarities))

    return round((0.75 * top_score) + (0.25 * avg_score), 4)


def embed_skill(skill: str):
    skill_text = f"{skill} technology used in software development"
    return model.encode(
        skill_text,
        convert_to_numpy=True,
        normalize_embeddings=True
    )


def find_related_skills_by_embedding(resume_skills, job_skills, threshold: float = 0.6):
    related_skill_map = {}
    related_skill_similarity = {}

    resume_embeddings = {
        skill: embed_skill(skill)
        for skill in resume_skills
    }

    for job_skill in job_skills:
        if job_skill in resume_skills:
            continue

        job_embedding = embed_skill(job_skill)

        best_match = None
        best_score = 0.0

        for resume_skill, resume_embedding in resume_embeddings.items():
            score = cosine_similarity(
                job_embedding.reshape(1, -1),
                resume_embedding.reshape(1, -1)
            )[0][0]

            if score > best_score:
                best_score = float(score)
                best_match = resume_skill

        if best_match and best_score >= threshold:
            related_skill_map[job_skill] = best_match
            related_skill_similarity[job_skill] = round(best_score, 4)

    return related_skill_map, related_skill_similarity
