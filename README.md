# 🐙 GitHub Profile Finder & Developer Impact Intelligence

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)


> A modern, full-stack intelligence platform for evaluating developer portfolios on GitHub. Beyond basic follower counts, **GitHub Profile Finder** analyzes real codebases, extracts verified skills from READMEs and commit histories, evaluates collaboration signals, and scores top repositories using a balanced impact algorithm.

---

## ✨ Features

- 🔍 **Instant Profile Discovery**: Fluid search interface with debounce, caching, and spring-animated profile previews.
- 🧠 **NLP & AST Skill Extraction**:
  - Automatically fetches and cleans repository README documentation.
  - Detects technical competencies, frameworks, databases, and DevOps tools across repositories.
  - Calculates confidence ratings and skill breakdown percentages per developer.
- 🏆 **Algorithmic Best 4 Impact Ranking (`best4`)**:
  - Scores repositories on a 100-point composite impact index.
  - Combines **Community Traction** (log-scaled stars & forks), **Documentation Depth** (markdown structure & length), **Maintenance & Freshness** (recency decay), **Metadata Completeness**, and **Live Deployments**.
  - Provides deterministic tie-breaking and exposes granular impact badges.
- 📊 **Deep Developer Analytics Dashboard**:
  - **Core 6 Metrics**: Commits/month, PR merge rates, stars, streak duration, code reviews, and lines added.
  - **Collaboration Signals**: Multi-contributor team repositories, external pull requests, issue reviews, and discussions.
  - **Contribution Heatmap**: Visual activity timeline and commit frequency tracking.

---

## 🛠️ Architecture & Tech Stack

```
github-profile-finder/
├── backend/
│   ├── database.py              # SQLAlchemy database engine & session factory
│   ├── models.py                # PostgreSQL schemas (User, Repo, Skills, repositorySkill)
│   ├── main.py                  # FastAPI application, route handlers, GitHub ingestion
│   ├── run.py                   # Development server entry point (Uvicorn)
│   ├── services/
│   │   ├── analytics.py         # Developer score, PR metrics, collaboration signals
│   │   ├── best4.py             # Balanced 100-pt repository impact scoring engine
│   │   ├── contributions.py     # GitHub contribution calendar & event aggregators
│   │   ├── repo_analyzer.py     # Text cleaning & markdown stripping pipeline
│   │   └── skill_extractor.py   # Skill categorization, confidence scoring & profile builder
│   └── tests/
│       ├── test_best4.py        # Best4 module unit tests & tie-breaking validation
│       ├── test_repo_skills.py  # Skill extraction & NLP verification
│       └── test_routes.py       # FastAPI endpoint tests
├── src/
│   ├── components/
│   │   ├── Modal.tsx            # Comprehensive developer intelligence modal
│   │   ├── ProfileCard.jsx      # Animated card preview with quick stats
│   │   ├── Search.jsx           # Real-time search bar with dropdown & keyboard navigation
│   │   └── loader.jsx           # Loading skeletons & spinners
│   ├── App.jsx                  # Main interface layout
│   └── main.jsx                 # React root renderer
└── package.json                 # Frontend dependencies & Vite configuration
```

### Technology Highlights

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Motion (Framer), Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, HTTPX (async client), SQLAlchemy |
| **Database** | PostgreSQL |
| **Testing** | Pytest, Pytest-Asyncio, FastAPI TestClient |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or newer) & **npm**
- **Python** (3.10 or newer)
- **PostgreSQL** instance running locally or via Docker
- **GitHub Personal Access Token (PAT)** ([Create one here](https://github.com/settings/tokens) with `public_repo` and `read:user` scopes)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install fastapi uvicorn sqlalchemy psycopg2-binary httpx python-dotenv pytest pytest-asyncio
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/fastapi"
   GITHUB_TOKEN="ghp_your_github_personal_access_token_here"
   ```

5. **Start the backend server**:
   ```bash
   python run.py
   ```
   The API will be available at `http://127.0.0.1:8000` (Interactive Swagger docs at `http://127.0.0.1:8000/docs`).

---

### 2. Frontend Setup

1. **Navigate to the project root**:
   ```bash
   cd ..
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check route |
| `GET` | `/github/{username}` | Fetches user profile, cached in PostgreSQL |
| `GET` | `/github/{username}/repos` | Fetches repositories, parses READMEs, extracts skills |
| `GET` | `/github/{username}/skills` | Returns verified skill percentages & category breakdown |
| `GET` | `/github/{username}/impact` | Returns author's top 4 repositories ranked by composite impact |
| `GET` | `/github/{username}/analytics` | Returns developer score, core 6 metrics & collaboration signals |
| `GET` | `/github/{username}/contributions` | Returns annual commit activity and heatmap data |
| `GET` | `/github/{username}/events` | Returns recent public activity events |
| `GET` | `/github/{username}/orgs` | Returns user organization memberships |

---

## 🧪 Testing

To execute backend unit and integration tests:

```bash
# From the project root
python -m pytest backend/tests -v
```

To validate the frontend build:

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
