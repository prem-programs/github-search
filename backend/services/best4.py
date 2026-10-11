# Module for ranking author's top repositories by true impact and quality
import math
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


def _parse_iso_datetime(date_str: Optional[str]) -> Optional[datetime]:
    """Parse ISO datetime string safely with timezone awareness."""
    if not date_str or not isinstance(date_str, str):
        return None
    try:
        clean_str = date_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean_str)
    except Exception:
        return None


def calculate_repo_score(repo: Dict[str, Any]) -> float:
    """
    Calculates a balanced repository impact score (0.0 to 100.0) based on:
    1. Community Traction: Stars (max 35.0) & Forks (max 15.0) on smooth logarithmic curves
    2. Documentation Quality: Readme substance, length, and markdown structure (max 20.0)
    3. Maintenance & Recency: Time decay from latest update (max 15.0)
    4. Project Completeness: Description, Language, Topics (max 10.0)
    5. Deployment / Usability: Live demo or deployed URL (max 5.0)
    """
    if not repo or not isinstance(repo, dict):
        return 0.0

    score = 0.0

    # 1. Community Traction - Stars (max 35.0 pts)
    stars = repo.get("stargazers_count", 0) or repo.get("stars", 0) or 0
    try:
        stars_val = max(0, int(stars))
    except (ValueError, TypeError):
        stars_val = 0
    score += min(35.0, math.log10(stars_val + 1) * 11.5)

    # Community Traction - Forks (max 15.0 pts)
    forks = repo.get("forks_count", 0) or repo.get("forks", 0) or 0
    try:
        forks_val = max(0, int(forks))
    except (ValueError, TypeError):
        forks_val = 0
    score += min(15.0, math.log10(forks_val + 1) * 6.5)

    # 2. Documentation Depth - README (max 20.0 pts)
    readme = repo.get("readme")
    if readme and isinstance(readme, str):
        readme_clean = readme.strip()
        readme_len = len(readme_clean)
        if readme_len >= 20:
            # Base presence for meaningful readme
            doc_score = 6.0
            # Length bonus (up to 10.0 pts for comprehensive docs >= 1200 chars)
            doc_score += min(10.0, (readme_len / 1200.0) * 10.0)
            # Structure bonus for headers, code blocks, lists or links (up to 4.0 pts)
            has_structure = bool(re.search(r"(?:^#{1,6}\s+|```|`[^`]+`|\[.*?\]\(.*?\)|^\s*[-*]\s+)", readme_clean, re.MULTILINE))
            if has_structure:
                doc_score += 4.0
            score += min(20.0, doc_score)

    # 3. Maintenance & Recency - Time Decay (max 15.0 pts)
    updated_at_str = repo.get("updated_at") or repo.get("pushed_at")
    dt = _parse_iso_datetime(updated_at_str)
    if dt:
        now = datetime.now(timezone.utc)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        diff_days = max(0, (now - dt).days)

        if diff_days <= 30:
            score += 15.0
        elif diff_days <= 90:
            score += 12.0
        elif diff_days <= 180:
            score += 9.0
        elif diff_days <= 365:
            score += 6.0
        elif diff_days <= 730:
            score += 3.0
        else:
            score += 1.0

    # 4. Project Completeness (max 10.0 pts)
    # Description (4.0 pts)
    description = repo.get("description")
    if description and isinstance(description, str) and len(description.strip()) >= 10:
        score += 4.0

    # Language defined (3.0 pts)
    language = repo.get("language") or repo.get("languages")
    if language and isinstance(language, str) and language.strip() and language.strip().lower() != "null":
        score += 3.0

    # Topics / Tags (3.0 pts)
    topics = repo.get("topics")
    if topics:
        if isinstance(topics, list) and len(topics) > 0:
            score += 3.0
        elif isinstance(topics, str) and topics.strip():
            score += 3.0

    # 5. Deployment / Live Demo (max 5.0 pts)
    homepage = repo.get("homepage") or repo.get("deployed_url")
    if homepage and isinstance(homepage, str):
        clean_hp = homepage.strip()
        if clean_hp.startswith("http://") or clean_hp.startswith("https://"):
            score += 5.0

    return round(min(100.0, max(0.0, score)), 2)


def best4(repos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks repositories by composite impact score and returns the top 4 repositories.
    Each returned repository includes its calculated 'impact_score'.
    Uses deterministic tie-breaking (score, stars, forks, recency, name).
    """
    if not repos:
        return []

    scored_repos = []
    for repo in repos:
        if not isinstance(repo, dict):
            continue
        score = calculate_repo_score(repo)
        repo_copy = dict(repo)
        repo_copy["impact_score"] = score

        # Key for tie-breaking
        stars = repo_copy.get("stargazers_count", 0) or repo_copy.get("stars", 0) or 0
        forks = repo_copy.get("forks_count", 0) or repo_copy.get("forks", 0) or 0
        updated = repo_copy.get("updated_at") or repo_copy.get("pushed_at") or ""
        name = repo_copy.get("name") or repo_copy.get("repo_name") or ""

        scored_repos.append((score, stars, forks, str(updated), str(name), repo_copy))

    # Sort descending by score, then stars, forks, recency, and ascending by name for deterministic ordering
    scored_repos.sort(
        key=lambda item: (item[0], item[1], item[2], item[3]),
        reverse=True
    )

    return [item[5] for item in scored_repos[:4]]