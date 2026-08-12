from fastapi import FastAPI,HTTPException,Depends
import httpx
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal,engine
from models import Repo,User,Base,repositorySkill,Skills
import base64
from services.repo_analyzer import analyse_repo
from services.skill_extractor import extract_repo_skills
from services.skill_extractor import build_developer_profile

Base.metadata.create_all(bind=engine)

app = FastAPI()

async def get_readme(username:str, repo_name):
    url = f"https://api.github.com/repos/{username}/{repo_name}/readme"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    readme = response.json()

    if "content" not in readme:
        return None

    
    decoded_content = base64.b64decode(readme["content"]).decode("utf-8")
    preprocessed_decoded_content = analyse_repo(decoded_content)
    print(preprocessed_decoded_content)
    return preprocessed_decoded_content


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#CORS connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

# getting user info 
@app.get("/github/{username}")
async def callGithub(username: str, db: Session = Depends(get_db)):
    url = f"https://api.github.com/users/{username}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        status = e.response.status_code if e.response is not None else 502
        if status == 404:
            raise HTTPException(status_code=404, detail="User not found")
        raise HTTPException(status_code=status, detail=e.response.text if e.response is not None else str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    ul = User(
        username=data.get("login"),
        name=data.get("name"),
        bio=data.get("bio"),
        email=data.get("email"),
        location=data.get("location"),
        public_repos=data.get("public_repos", 0),
    )
    try:
        db.add(ul)
        db.commit()
        db.refresh(ul)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail="unprocessable content")

    return {
        "username": data.get("login"),
        "name": data.get("name"),
        "logo": data.get("avatar_url"),
        "location": data.get("location"),
        "bio": data.get("bio"),
        "repo": data.get("public_repos", 0),
        "followers": data.get("followers", 0),
        "furl": data.get("followers_url"),
        "reposL": data.get("repos_url"),
        "profile": data.get("html_url"),
    }

@app.get("/github/{username}/repos")
async def store(username:str , db: Session = Depends(get_db)):
    url = f"https://api.github.com/users/{username}/repos"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="user not found")

    repos = response.json()

    if not repos:
        raise HTTPException(status_code=404, detail="No repositories found for user")

    # checking if user exists
    owner_login = repos[0].get("owner", {}).get("login")
    user = db.query(User).filter(User.username == owner_login).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = []
    dev_skills = build_developer_profile(repos)

    
    for name, count in dev_skills.get("skills", {}).items():
        sk = Skills(
            skills=name,
            profile_id=user.id,
            percentage=dev_skills.get("skill_percentage", {}).get(name, 0),
            category=dev_skills.get("skill_categories", {}).get(name, "Null"),
            repo_count=count,
        )
        db.add(sk)


    for repo in repos:
        if repo.get("fork") is False:
            repo_readme = await get_readme(username, repo.get("name"))
            repo_skills = extract_repo_skills(
                repo_readme or "",
                ",".join(repo.get("topics", [])),
                repo.get("description") or "",
                repo.get("language") or "",
            )
            Rp = Repo(
                Rid=repo.get("id"),
                repo_name=repo.get("name"),
                description=repo.get("description"),
                languages=repo.get("language"),
                forks=repo.get("forks_count", 0),
                topics=",".join(repo.get("topics", [])),
                readme=repo_readme,
                created_at=repo.get("created_at"),
                updated_at=repo.get("updated_at"),
                owner_id=user.id,
            )
            db.add(Rp)

            for skill, cat in (repo_skills or {}).items():
                Rs = repositorySkill(
                    repo_id=repo.get("id"),
                    repo_skill=skill,
                    skill_category=cat,
                )
                db.add(Rs)

            result.append({
                "repo_name": repo.get("name"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "topics": repo.get("topics", []),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "updated_at": repo.get("updated_at"),
            })

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=f"Unprocessable Content: {e}")

    return result


