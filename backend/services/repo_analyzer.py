# from sqlalchemy.orm import Session
# from database import SessionLocal,engine
# from models import Repo,User
# from main import Depends , get_db

import re

# preprocessing for better 

# Remove code blocks
#     │
#     ▼
# Remove markdown links
#     │
#     ▼
# Remove badges
#     │
#     ▼
# Remove HTML
#     │
#     ▼
# Lowercase
#     │
#     ▼
# Skill extraction

def analyse_repo(text):

    # text = db.query(Repo).filter(Repo.Rid== {id}).first()

   text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
   text = re.sub(r"```.*?```", "", text, flags=re.S)
   text = re.sub(r"`([^`]*)`", r"\1", text)
   text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", "", text)
   text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
   text = re.sub(r"<[^>]+>", "", text)
   text = re.sub(r"(?m)^\s{0,3}>\s?", "", text)
   text = re.sub(r"(?m)^\s{0,3}#{1,6}\s*", "", text)
   text = re.sub(r"(?m)^[*\-+]\s+", "", text)
   text = re.sub(r"(?m)^\d+\.\s+", "", text)
   text = re.sub(r"\*\*|__|\*|_|~~", "", text)
   text = re.sub(r"---", "", text)
   text = re.sub(r"/","",text)
   text = re.sub(r"[()]","",text)

   return " ".join(text.split())
       