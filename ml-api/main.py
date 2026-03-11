from fastapi import FastAPI
from analyzer import analyze_resume



app = FastAPI()

#Checking for api is running 
@app.get("/health")
def health():
    return {"status": "ml-api-running"}

#recieving data from node and returning result back.
@app.post("/analyze")
def analyze(data: dict):
    resume_text = data["resume"]
    job_text = data["job"]

    result = analyze_resume(resume_text, job_text)

    return result