from services import skill_extractor
from services.skill_extractor import SKILLS
from sqlalchemy.orm import bulk_persistence
from fastapi import exceptions
import os
from dotenv import load_dotenv
from fastapi import FastAPI,HTTPException,Depends
import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session,join
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal,engine
from models import Repo,User,Base,repositorySkill,Skills
import base64
from services.repo_analyzer import analyse_repo
from services.skill_extractor import extract_repo_skills,calculate_repo_confidence,build_developer_profile
import asyncio
from services.best4 import best4

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_github_headers():
    headers = {
        "User-Agent": "GitHub-Profile-Finder",
        "Accept": "application/vnd.github+json",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers



async def get_readme(username: str, repo_name: str):
    url = f"https://api.github.com/repos/{username}/{repo_name}/readme"
    headers = get_github_headers()
    timeout = httpx.Timeout(10.0, connect=5.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            response = await client.get(url)
            if response.status_code != 200:
                return None
            readme = response.json()
            if "content" not in readme:
                return None
            decoded_content = base64.b64decode(readme["content"]).decode("utf-8")
            preprocessed_decoded_content = analyse_repo(decoded_content)
            return preprocessed_decoded_content
    except Exception as e:
        print(f"Error fetching README for {username}/{repo_name}: {e}")
        return None


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


def user_skills(username:str, db: Session):
    user = db.query(User).filter(func.lower(User.username) == username.lower()).first()

    if not user:
        return []
    
    skills = db.query(Skills).filter(Skills.profile_id == user.id).all()
    return skills


#Routes
@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

# getting user info 
@app.get("/github/{username}")
async def callGithub(username: str, db: Session = Depends(get_db)):

     # Check if user already exists
    existing_user = db.query(User).filter(func.lower(User.username) == username.lower()).first()
    if existing_user:
        return {
                "username": existing_user.username,
                "name": existing_user.name,
                "logo":existing_user.logo,
                "bio" : existing_user.bio,
                "location": existing_user.location,
                "repo": existing_user.public_repos,
                "profile_url" : existing_user.profile_url,
                "last_Activity" : existing_user.last_Activity
            }


    url = f"https://api.github.com/users/{username}"
    headers = get_github_headers()
    timeout = httpx.Timeout(15.0, connect=10.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        status = e.response.status_code if e.response is not None else 502
        if status == 404:
            raise HTTPException(status_code=404, detail="User not found")
        raise HTTPException(status_code=status, detail=e.response.text if e.response is not None else str(e))
    except (httpx.ConnectTimeout, httpx.TimeoutException):
        raise HTTPException(status_code=504, detail="Connection to GitHub API timed out. Please check your internet connection or try again.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


    ul = User(
        username=data.get("login"),
        name=data.get("name"),
        bio = data.get("bio"),
        logo = data.get("avatar_url"),
        location=data.get("location"),
        public_repos=data.get("public_repos", 0),
        profile_url = data.get("html_url"),
        last_Activity = data.get("updated_at")
    )
    db.add(ul)

    try:
        db.commit()
        db.refresh(ul)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=f"{e}")

    return {
        "username": data.get("login"),
        "name": data.get("name"),
        "logo": data.get("avatar_url"),
        "bio": data.get("bio"),
        "location":data.get("location"),
       "public_repos":data.get("public_repos", 0),
        "profile_url" : data.get("html_url"),
        "last_Activity" : data.get("updated_at")
    }

@app.get("/github/{username}/repos")
async def store(username:str , db: Session = Depends(get_db)):
    url = f"https://api.github.com/users/{username}/repos"
    headers = get_github_headers()
    timeout = httpx.Timeout(15.0, connect=10.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            response = await client.get(url)
    except (httpx.ConnectTimeout, httpx.TimeoutException):
        raise HTTPException(status_code=504, detail="Connection to GitHub API timed out. Please check your network connection.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach GitHub API: {e}")

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="user not found")

    repos = response.json()

    if not repos:
        raise HTTPException(status_code=404, detail="No repositories found for user")

    # checking if user exists
    owner_login = repos[0].get("owner", {}).get("login", "")
    user = db.query(User).filter(func.lower(User.username) == username.lower()).first()
    if not user:
        user = db.query(User).filter(func.lower(User.username) == owner_login.lower()).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = []
    dev_skills = build_developer_profile(repos)

    # Clear existing skills summary for this user to avoid duplicates
    db.query(Skills).filter(Skills.profile_id == user.id).delete(synchronize_session=False)
    
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
            repo_skills, _ = extract_repo_skills(
                repo_readme or "",
                ",".join(repo.get("topics", [])),
                repo.get("description") or "",
                repo.get("language") or "",
            )

            repo_confidence = calculate_repo_confidence(
                readme=repo_readme,
                topics=",".join(repo.get("topics", [])),
                description=repo.get("description"),
                language=repo.get("language")
            )

            repo_id = repo.get("id")
            created_at_val = str(repo.get("created_at") or "")
            updated_at_val = str(repo.get("updated_at") or "")

       
            existing_repo = db.query(Repo).filter(Repo.Rid == repo_id).first()
            if existing_repo:
                existing_repo.repo_name = repo.get("name")
                existing_repo.description = repo.get("description")
                existing_repo.languages = repo.get("language")
                existing_repo.forks = repo.get("forks_count", 0)
                existing_repo.topics = ",".join(repo.get("topics", []))
                existing_repo.readme = repo_readme
                existing_repo.updated_at = updated_at_val
            else:
                Rp = Repo(
                    Rid=repo_id,
                    repo_name=repo.get("name"),
                    description=repo.get("description"),
                    languages=repo.get("language"),
                    forks=repo.get("forks_count", 0),
                    topics=",".join(repo.get("topics", [])),
                    readme=repo_readme,
                    created_at=created_at_val,
                    updated_at=updated_at_val,
                    owner_id=user.id,
                )
                db.add(Rp)

            # Clear existing skills for this repository to prevent duplicate key/rows
            db.query(repositorySkill).filter(repositorySkill.repo_id == repo_id).delete(synchronize_session=False)

            for skill, cat in repo_skills.items():
                Rs = repositorySkill(
                    repo_id=repo_id,
                    repo_skill=skill,
                    skill_category=cat,
                    confidence=repo_confidence,
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
        print("DATABASE COMMIT ERROR IN /repos:", repr(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=f"Database error: {e}")

    return result


@app.get("/github/{username}/orgs")
async def org(username:str , db:Session = Depends(get_db)):
    count = 0
    url = f"https://api.github.com/users/{username}/orgs"
    headers = get_github_headers()
    timeout = httpx.Timeout(15.0, connect=10.0)
    try: 
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            response = await client.get(url)
            
    except (httpx.ConnectTimeout, httpx.TimeoutException):
        raise HTTPException(status_code=504, detail="Connection to GitHub API timed out. Please check your network connection.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach GitHub API: {e}")

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="user not found")

    datas = response.json()

    for data in datas :
        count +=1

    return count
    


#PRs and all
@app.get("/github/{username}/contribution")
async def contribution(username:str , db:Session = Depends(get_db)):
    urls = [
        f"https://api.github.com/users/{username}/events",
        f"https://api.github.com/search/issues?q=author:{username}+type:pr"
    ]
     
    headers = get_github_headers()
    timeout = httpx.Timeout(15.0, connect=10.0)
    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            tasks = [client.get(url) for url in urls]
            responses = await asyncio.gather(*tasks) # making task to run simultaneously
    except (httpx.ConnectTimeout, httpx.TimeoutException):
        raise HTTPException(status_code=504, detail="Connection to GitHub API timed out. Please check your network connection.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach GitHub API: {e}")

    for response in responses:
        if (response).status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="user not found")

    for response in responses:
        return (f"Status: {response.status_code}, Data: {response.json()}")

#endpoint for getting most language used 
@app.get("/github/{username}/language")
def langPercent(username:str , db:Session = Depends(get_db)):

    langP =( db.query(User,Skills)
    .join(Skills,User.id == Skills.profile_id)
    .filter(func.lower(User.username) == username.lower()).all()
    )
    if langP:
        return [
            {
                "skill":skill.skills,
                "percentage":skill.percentage
            }
            for user, skill in langP
        ]
    else:
        raise HTTPException(status_code=404 , detail="Not found in db")

@app.get("/github/{username}/impact")
def sort_repo(username:str,db:Session = Depends(get_db)):
    user = db.query(User).filter(
        func.lower(User.username) == username.lower()
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    repos = db.query(Repo).filter(Repo.owner_id == user.id).all()

    repo_dicts = [
        {
            "name": repo.repo_name,
            "stargazers_count": 0,  # Not stored in your Repo model
            "forks_count": repo.forks,
            "size": 0,  # Not stored
            "readme": repo.readme,
        }
        for repo in repos
    ]

    best_repos = best4(repo_dicts)
    return {"best4":best_repos}