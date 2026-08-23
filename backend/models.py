from starlette.convertors import IntegerConvertor
from sqlalchemy import Column, Integer, String,ForeignKey,Float
from database import Base


class Repo(Base):
    __tablename__ = "repo"

    Rid = Column(Integer, unique =True, primary_key=True, index=True)
    owner_id = Column(Integer ,ForeignKey("users.id",ondelete="CASCADE"),nullable=False,index=True)
    repo_name = Column(String)
    description = Column(String)
    languages = Column(String)
    forks = Column(Integer)
    topics = Column(String)
    created_at = Column(String ,nullable=False)
    updated_at = Column(String , nullable=False)
    readme = Column(String)

class repositorySkill(Base):
    __tablename__ = "repository_skills"

    id = Column(Integer, primary_key=True, index=True)

    repo_id = Column(Integer,ForeignKey("repo.Rid", ondelete="CASCADE"),nullable=False,index=True)

    repo_skill = Column(String, nullable=False, index=True)
    skill_category = Column(String, nullable=False)
    confidence = Column(Float, nullable=False , default=0.0)

    
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String , unique=True)
    name = Column(String)
    logo = Column(String)
    bio = Column(String)
    location = Column(String, nullable=True)
    public_repos = Column(Integer,nullable=True)
    profile_url = Column(String,nullable=False)
    last_Activity = Column(String, nullable=False)

class Skills(Base):
    __tablename__ = "skills"

    id = Column(Integer , primary_key=True,index=True)
    profile_id = Column(Integer,ForeignKey("users.id",ondelete="CASCADE"),nullable=False,index=True)
    skills = Column(String)
    category = Column(String)
    repo_count = Column(Integer, nullable=False, default=0)
    percentage = Column(Float, nullable=False, default=0.0)

