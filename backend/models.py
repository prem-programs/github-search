from sqlalchemy import Column, Integer, String,ForeignKey
from database import Base

class Repo(Base):
    __tablename__ = "repo"

    Rid = Column(Integer, unique =True, primary_key=True, index=True)
    repo_name = Column(String)
    description = Column(String)
    languages = Column(String)
    stars = Column(Integer)
    forks = Column(Integer)
    topics = Column(String)
    created_at = Column(String ,nullable=False)
    updated_at = Column(String , nullable=False)
    owner_id = Column(Integer ,ForeignKey("users.id",ondelete="CASCADE"),nullable=False,index=True)
    
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String , nullable=True)
    username = Column(String , nullable=False , unique=True)
    name = Column(String , nullable=False)
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    public_repos = Column(Integer,nullable=True)



