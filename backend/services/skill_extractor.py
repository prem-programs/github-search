import re

SKILLS = {
    # Languages
    "Python": "language",
    "JavaScript": "language",
    "TypeScript": "language",
    "Java": "language",
    "C++": "language",
    "C" :"language",
    "C#": "language",
    "Go": "language",
    "Rust": "language",

    # Frontend
    "React": "frontend",
    "Next.js": "frontend",
    "Vue.js": "frontend",
    "Angular": "frontend",
    "Svelte": "frontend",
    "Tailwind CSS": "frontend",
    "Bootstrap": "frontend",

    # Backend
    "Node.js": "backend",
    "Express.js": "backend",
    "NestJS": "backend",
    "FastAPI": "backend",
    "Flask": "backend",
    "Django": "backend",
    "Spring Boot": "backend",

    # Database
    "PostgreSQL": "database",
    "MySQL": "database",
    "SQLite": "database",
    "MongoDB": "database",
    "Redis": "database",

    # DevOps
    "Docker": "devops",
    "Kubernetes": "devops",
    "Nginx": "devops",

    # Cloud
    "AWS": "cloud",
    "Google Cloud": "cloud",
    "Azure": "cloud",
    "Vercel": "cloud",
    "Render": "cloud",

    # AI / ML
    "TensorFlow": "ai",
    "PyTorch": "ai",
    "OpenCV": "ai",
    "LangChain": "ai",
    "LlamaIndex": "ai",
    "Transformers": "ai",
    "Sentence Transformers": "ai",
    "FAISS": "ai",
    "pgvector": "ai",
    "OpenAI": "ai",
    "Gemini": "ai",

    # Authentication
    "JWT": "auth",
    "OAuth2": "auth",
    "bcrypt": "auth",

    # ORM
    "SQLAlchemy": "orm",
    "Prisma": "orm",
    "TypeORM": "orm",
    "Hibernate": "orm",

    # Testing
    "Pytest": "testing",
    "Jest": "testing",
    "Playwright": "testing",

    # Mobile
    "React Native": "mobile",
    "Flutter": "mobile",
    "Expo": "mobile",
}


ALIASES = {
    "python": "Python",
    "python3": "Python",

    "javascript": "JavaScript",
    "js": "JavaScript",

    "typescript": "TypeScript",
    "ts": "TypeScript",

    "java": "Java",

    "c++": "C++",
    "cpp": "C++",

    "c" :"C",

    "c#": "C#",
    "csharp": "C#",

    "golang": "Go",
    "go": "Go",

    "rust": "Rust",

    "react": "React",
    "reactjs": "React",
    "react.js": "React",

    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",

    "vue": "Vue.js",
    "vuejs": "Vue.js",

    "angular": "Angular",

    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",

    "bootstrap": "Bootstrap",

    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",

    "express": "Express.js",
    "expressjs": "Express.js",

    "nestjs": "NestJS",

    "fastapi": "FastAPI",

    "flask": "Flask",

    "django": "Django",

    "spring boot": "Spring Boot",

    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "pg": "PostgreSQL",

    "mysql": "MySQL",

    "sqlite": "SQLite",

    "mongo": "MongoDB",
    "mongodb": "MongoDB",

    "redis": "Redis",

    "docker": "Docker",
    "docker compose": "Docker",
    "docker-compose": "Docker",

    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",

    "nginx": "Nginx",

    "aws": "AWS",
    "amazon web services": "AWS",

    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",

    "azure": "Azure",

    "vercel": "Vercel",

    "render": "Render",

    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",

    "torch": "PyTorch",
    "pytorch": "PyTorch",

    "opencv": "OpenCV",
    "cv2": "OpenCV",

    "langchain": "LangChain",

    "llamaindex": "LlamaIndex",

    "transformers": "Transformers",

    "sentence transformers": "Sentence Transformers",
    "sentence-transformers": "Sentence Transformers",

    "faiss": "FAISS",

    "pgvector": "pgvector",
    "pg vector": "pgvector",

    "openai": "OpenAI",
    "chatgpt": "OpenAI",
    "gpt": "OpenAI",

    "gemini": "Gemini",

    "jwt": "JWT",

    "oauth": "OAuth2",
    "oauth2": "OAuth2",

    "bcrypt": "bcrypt",

    "sqlalchemy": "SQLAlchemy",

    "typeorm": "TypeORM",

    "prisma": "Prisma",

    "hibernate": "Hibernate",

    "pytest": "Pytest",

    "jest": "Jest",

    "playwright": "Playwright",

    "react native": "React Native",
    "react-native": "React Native",

    "flutter": "Flutter",

    "expo": "Expo",
    "expo go": "Expo",
}


def contains_keyword(text: str, keyword: str) -> bool:
    pattern = rf"(?<![A-Za-z0-9_]){re.escape(keyword)}(?![A-Za-z0-9_])"
    return re.search(pattern, text, flags=re.IGNORECASE) is not None

def extract_repo_skills(
    readme: str = "",
    topics: str = "",
    description: str = "",
    language: str = "",
):

    combined_text = f"""
    {readme}
    {topics}
    {description}
    {language}
    """.lower()

    skill_categories = {}
    confidence = 0.0

    for alias, canonical in ALIASES.items():
        if contains_keyword(combined_text, alias):
            skill_categories[canonical] = SKILLS.get(canonical, "other")

        if canonical.lower() in str(topics).lower() or canonical.lower() in str(language).lower() or canonical.lower() in str(readme).lower():
            confidence += 0.30
        elif alias in combined_text:
            confidence += 0.10

    return skill_categories, confidence


def build_developer_profile(repositories):

    skill_count = {}
    category_count = {}
    skill_categories = {}

    total_repositories = len(repositories)

    for repo in repositories:

        repo_skills, _ = extract_repo_skills(
            readme=repo.get("readme", ""),
            topics=repo.get("topics", ""),
            description=repo.get("description", ""),
            language=repo.get("language", ""),
        )

        for skill, category in repo_skills.items():
            skill_count[skill] = skill_count.get(skill, 0) + 1
            skill_categories[skill] = category
            category_count[category] = category_count.get(category, 0) + 1

    percentages = {}

    if total_repositories > 0:
        for skill, count in skill_count.items():
            percentages[skill] = round((count / total_repositories) * 100, 2)

    return {
        "skills": skill_count,
        "categories": category_count,
        "skill_percentage": percentages,
        "skill_categories": skill_categories,
    }


def calculate_repo_confidence(
                    readme: str="",
                    topics: str="",
                    description : str="",
                    language : str = ""
                ):
    text = " ".join(str(value or "") for value in (readme, topics, description, language)).lower()
    confidence = 0.0

    for skill in SKILLS:
        if contains_keyword(text, skill.lower()):
            confidence += 0.20

    return round(min(confidence, 1.0), 2)
    

if __name__ == "__main__":
    sample_result = extract_repo_skills(
        readme="A React and Python project",
        topics="react, python",
        description="Uses FastAPI and PostgreSQL",
        language="JavaScript",
    )
    for skill,cat in sample_result.items():
        print(skill)
        print(cat)

