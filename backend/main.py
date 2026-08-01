from fastapi import FastAPI
import httpx
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

@app.get("/call/{username}")
async def callGithub(username:str):
    url = f"https://api.github.com/users/{username}"

    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    data = response.json()
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