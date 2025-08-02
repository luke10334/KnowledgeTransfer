from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sqlite3
from typing import List, Optional
import hashlib
import jwt
from datetime import datetime, timedelta
import uvicorn
from fastapi import File, UploadFile, Form
from typing import List
from github import Github, InputGitTreeElement
import os
import requests


app = FastAPI(title="Knowledge Transfer Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = "knowledge-transfer-secret-key-2025"

# Demo users data
DEMO_USERS = {
    "demo_ceo": {"password": "demo123", "role": "CEO", "level": 100, "is_hr": False, "full_name": "John Smith"},
    "demo_engineer": {"password": "demo123", "role": "ENGINEER", "level": 40, "is_hr": False, "full_name": "Alice Johnson"},
    "demo_intern": {"password": "demo123", "role": "INTERN", "level": 10, "is_hr": False, "full_name": "Bob Wilson"},
}

# Demo knowledge artifacts
DEMO_ARTIFACTS = [
    {
        "id": 1,
        "title": "Company Onboarding Guide",
        "content": "Welcome to the company! This comprehensive guide covers basic policies, procedures, and getting started information for new employees.",
        "type": "DOCUMENTATION",
        "access_level": 10,
        "is_hr_only": False,
        "tags": ["onboarding", "basics", "welcome"],
        "created_at": "2024-01-15"
    },
    {
        "id": 2,
        "title": "Python Development Standards",
        "content": "Our coding standards for Python development including PEP 8 compliance, testing requirements, code review processes, and deployment guidelines.",
        "type": "DOCUMENTATION", 
        "access_level": 30,
        "is_hr_only": False,
        "tags": ["python", "coding", "standards", "development"],
        "created_at": "2024-02-01"
    },
    {
        "id": 3,
        "title": "Architecture Decision Record - Microservices Migration", 
        "content": "Decision to migrate from monolith to microservices architecture. Includes rationale, implementation plan, timeline, and technical considerations.",
        "type": "ARCHITECTURE_DOC",
        "access_level": 60,
        "is_hr_only": False,
        "tags": ["architecture", "microservices", "migration", "technical"],
        "created_at": "2024-02-15"
    },
    {
        "id": 4,
        "title": "Strategic Product Roadmap Q1-Q4 2024",
        "content": "Confidential 12-month product strategy including competitive analysis, market positioning, feature priorities, and financial projections.",
        "type": "STRATEGY",
        "access_level": 80,
        "is_hr_only": False,
        "tags": ["strategy", "roadmap", "confidential", "leadership"],
        "created_at": "2024-03-01"
    }
]

def create_token(username: str, user_data: dict):
    payload = {
        "username": username,
        "role": user_data["role"],
        "level": user_data["level"],
        "is_hr": user_data["is_hr"],
        "full_name": user_data["full_name"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def check_access(artifact, user):
    # HR personnel can access HR-only content
    if artifact["is_hr_only"] and not user["is_hr"]:
        return False
    
    # Check minimum access level
    if user["level"] < artifact["access_level"]:
        return False
    
    return True

@app.get("/")
async def root():
    return {
        "message": "Knowledge Transfer Platform API", 
        "version": "1.0.0",
        "demo_users": ["demo_ceo", "demo_engineer", "demo_intern"],
        "endpoints": {
            "docs": "/docs",
            "login": "/api/v1/auth/login", 
            "artifacts": "/api/v1/artifacts",
            "search": "/api/v1/search",
            "chat": "/api/v1/chat/ask"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/v1/auth/login")
async def login(credentials: dict):
    username = credentials.get("username")
    password = credentials.get("password")
    
    if username not in DEMO_USERS:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = DEMO_USERS[username]
    if password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(username, user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": username,
            "full_name": user["full_name"],
            "role": user["role"],
            "level": user["level"],
            "is_hr": user["is_hr"]
        }
    }

@app.get("/api/v1/users/me")
async def get_current_user(user: dict = Depends(verify_token)):
    return {
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"],
        "level": user["level"],
        "is_hr": user["is_hr"]
    }

@app.get("/api/v1/artifacts")
async def get_artifacts(user: dict = Depends(verify_token)):
    accessible_artifacts = []
    for artifact in DEMO_ARTIFACTS:
        if check_access(artifact, user):
            accessible_artifacts.append(artifact)
    
    return {"artifacts": accessible_artifacts, "total": len(accessible_artifacts)}

@app.get("/api/v1/artifacts/{artifact_id}")
async def get_artifact(artifact_id: int, user: dict = Depends(verify_token)):
    artifact = next((a for a in DEMO_ARTIFACTS if a["id"] == artifact_id), None)
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    if not check_access(artifact, user):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return artifact

@app.post("/api/v1/chat/ask")
async def ai_chat(request: dict, user: dict = Depends(verify_token)):
    question = request.get("question", "")
    
    # Simple AI responses based on user role
    role_responses = {
        "CEO": f"As CEO, you have access to all company information. Regarding '{question}', I can help you with strategic decisions, financial data, organizational insights, and high-level planning.",
        "ENGINEER": f"As an Engineer, I can assist with '{question}' about technical documentation, coding standards, architecture decisions, development processes, and engineering best practices.",
        "INTERN": f"As an Intern, I can help you with '{question}' related to onboarding materials, basic procedures, learning resources, and foundational knowledge appropriate for your level."
    }
    
    response = role_responses.get(user["role"], "I can help you find information appropriate to your role.")
    
    return {
        "answer": response,
        "sources": ["Demo knowledge base"],
        "confidence": 0.85,
        "user_level": user["level"]
    }

@app.get("/api/v1/search")
async def search_knowledge(q: str = "", user: dict = Depends(verify_token)):
    if not q:
        return {"results": [], "total": 0}
from fastapi.responses import RedirectResponse, JSONResponse

@app.get("/api/v1/github/login")
def github_login():
    scope = "repo"  # Change scope as needed
    github_authorize_url = (
        f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_CALLBACK_URL}&scope={scope}"
    )
    return RedirectResponse(github_authorize_url)


@app.get("/api/v1/github/callback")
def github_callback(code: str = None):
    if not code:
        return JSONResponse({"error": "No code provided"}, status_code=400)

    token_url = "https://github.com/login/oauth/access_token"
    data = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
    }
    headers = {"Accept": "application/json"}

    resp = requests.post(token_url, data=data, headers=headers)
    if resp.status_code != 200:
        return JSONResponse({"error": "Failed to get access token"}, status_code=400)
    
    access_token = resp.json().get("access_token")
    if not access_token:
        return JSONResponse({"error": "No access token returned"}, status_code=400)
    
    # Here, in a real app, you associate the GitHub token with the current user securely.
    # For demo, return it in the response (not secure for production)
    return {"access_token": access_token}

    
    results = []
    for artifact in DEMO_ARTIFACTS:
        if check_access(artifact, user):
            if q.lower() in artifact["title"].lower() or q.lower() in artifact["content"].lower():
                results.append({
                    "id": artifact["id"],
                    "title": artifact["title"],
                    "content": artifact["content"][:200] + "..." if len(artifact["content"]) > 200 else artifact["content"],
                    "type": artifact["type"],
                    "relevance_score": 0.95,
                    "tags": artifact["tags"]
                })
    
    return {"results": results, "total": len(results)}

@app.post("/api/v1/github/push")
async def github_push(
    github_token: str = Form(...),
    repo_name: str = Form(...),          # e.g., "username/repo"
    target_path: str = Form(""),         # e.g., folder path inside repo
    commit_message: str = Form("Update from Knowledge Transfer Platform"),
    files: List[UploadFile] = File(...)
):
    try:
        g = Github(github_token)
        repo = g.get_repo(repo_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitHub repository access error: {str(e)}")
    
    try:
        # Get the reference for the default branch (usually main or master)
        ref = repo.get_git_ref(f"heads/{repo.default_branch}")
        latest_commit = repo.get_commit(ref.object.sha)
        base_tree = repo.get_git_tree(sha=latest_commit.sha)

        elements = []
        for upload in files:
            content_bytes = await upload.read()
            file_path = os.path.join(target_path, upload.filename).replace("\\", "/")  # Normalize path with forward slashes
            content_str = content_bytes.decode("utf-8")  # Assumes text files; binary handling would differ

            elem = InputGitTreeElement(
                path=file_path,
                mode='100644',
                type='blob',
                content=content_str
            )
            elements.append(elem)
        
        new_tree = repo.create_git_tree(elements, base_tree)
        new_commit = repo.create_git_commit(commit_message, new_tree, [latest_commit.commit])
        ref.edit(new_commit.sha)

        return {"detail": f"Successfully pushed {len(files)} files to {repo_name}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub push error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
