from fastapi import FastAPI,HTTPException,Depends
import httpx
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal,engine
from models import Repo,User,Base

Base.metadata.create_all(bind=engine)


app = FastAPI()

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
@app.get("/call/{username}")
async def callGithub(username:str , db: Session = Depends(get_db)):
    try:
        url = f"https://api.github.com/users/{username}"

        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)

        data = response.json()


    except Exception as e :
        print(e)

    ul = User(
        username = data["login"],
        name = data["name"],
        bio = data["bio"],
        email = data["email"],
        location = data["location"],
        public_repos = data["public_repos"],
    )
    try:
        db.add(ul)
        db.commit()
        db.refresh(ul)
    except Exception as e :
        db.rollback()
        print(e)
        raise HTTPException(status_code=422 , detail="unproccessable content")

    return {
        "username":data["login"],
        "name":data["name"],
        "logo":data["avatar_url"],
        "location":data["location"],
        "bio":data["bio"],
        "repo":data["public_repos"], 
        "followers":data["followers"],
        "furl":data["followers_url"],
        "reposL":data["repos_url"],
        "profile":data["html_url"]
    }

@app.get("/github/{username}/repos")
async def store(username:str , db: Session = Depends(get_db)):
    url = f"https://api.github.com/users/{username}/repos"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code , detail="user not found")

    repos = response.json()


    user = db.query(User).filter(
        User.username == repos[0]["owner"]["login"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    result = []
    
    for repo in repos:
        Rp = Repo(
            Rid = repo["id"],
            repo_name = repo["name"],
            description = repo["description"],
            languages = repo["language"],
            stars = repo["stargazers_count"],
            forks = repo["forks_count"],
            topics = ",".join(repo["topics"]),
            created_at = repo["created_at"],
            updated_at = repo["updated_at"],
            owner_id = user.id
            )
        try: 
            db.add(Rp)
        except :
            raise HTTPException(status_code=422 ,detail="Unprocessable Content")
        result.append({
            "repo_name": repo["name"],
            "description": repo["description"],
            "language": repo["language"],
            "topics": repo["topics"],
            "stars": repo["stargazers_count"],
            "forks": repo["forks_count"],
            "updated_at": repo["updated_at"],
        })
    
    db.commit()
    db.refresh(Rp)
    return result
         
    
