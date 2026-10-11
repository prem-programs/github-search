import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path for importing services
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from services.best4 import calculate_repo_score, best4


def test_calculate_repo_score_empty():
    """Empty repo should have a score of 0.0"""
    repo = {}
    score = calculate_repo_score(repo)
    assert score == 0.0, f"Expected 0.0, got {score}"


def test_calculate_repo_score_readme_substance():
    """Substantive README with structure should score significantly higher than 1-line placeholder"""
    placeholder_repo = {
        "readme": "# Just Title"  # < 20 chars
    }
    short_repo = {
        "readme": "This is a brief readme that just says hello world."  # ~50 chars, no structure
    }
    rich_readme = """
    # High-Performance Data Processing Engine
    
    A blazing fast streaming pipeline written in Python.
    
    ## Features
    - Distributed task queue
    - Zero-copy deserialization
    - Async IO streaming
    
    ## Installation
    ```bash
    pip install data-engine
    ```
    
    ## Quickstart
    ```python
    from engine import Pipeline
    p = Pipeline()
    p.run()
    ```
    """ + ("\n" * 5) + ("Documentation details with extended tutorials and API references. " * 25)

    rich_repo = {
        "readme": rich_readme
    }

    score_placeholder = calculate_repo_score(placeholder_repo)
    score_short = calculate_repo_score(short_repo)
    score_rich = calculate_repo_score(rich_repo)

    assert score_placeholder == 0.0, f"Tiny placeholder should score 0, got {score_placeholder}"
    assert score_short >= 6.0, f"Short readme should have base score, got {score_short}"
    assert score_rich >= 18.0, f"Rich readme should get near-max doc points, got {score_rich}"
    assert score_rich > score_short, "Rich README must outrank short README"


def test_calculate_repo_score_stars_and_forks_smooth_scaling():
    """Stars and forks should scale smoothly without abruptly plateauing at low numbers"""
    repo_10_stars = {"stargazers_count": 10}
    repo_50_stars = {"stargazers_count": 50}
    repo_500_stars = {"stargazers_count": 500}

    s10 = calculate_repo_score(repo_10_stars)
    s50 = calculate_repo_score(repo_50_stars)
    s500 = calculate_repo_score(repo_500_stars)

    assert s10 < s50 < s500, f"Stars score must strictly increase: {s10} < {s50} < {s500}"
    assert s500 <= 35.0, f"Max stars score should cap at 35.0, got {s500}"


def test_calculate_repo_score_recency_decay():
    """Recently maintained projects must earn more freshness points than stale/abandoned ones"""
    now = datetime.now(timezone.utc)
    recent_date = (now - timedelta(days=5)).isoformat()
    old_date = (now - timedelta(days=800)).isoformat()

    recent_repo = {"updated_at": recent_date}
    old_repo = {"updated_at": old_date}

    s_recent = calculate_repo_score(recent_repo)
    s_old = calculate_repo_score(old_repo)

    assert s_recent == 15.0, f"Recent update within 30 days should yield 15.0, got {s_recent}"
    assert s_old == 1.0, f"Old update > 2 years should yield 1.0, got {s_old}"


def test_calculate_repo_score_completeness_and_homepage():
    """Metadata completeness (description, language, topics) and homepage should add balanced bonuses"""
    repo_complete = {
        "description": "Production-ready machine learning framework for Python",
        "language": "Python",
        "topics": ["machine-learning", "deep-learning", "pytorch"],
        "homepage": "https://ml-framework.io"
    }

    score = calculate_repo_score(repo_complete)
    # 4.0 (desc) + 3.0 (lang) + 3.0 (topics) + 5.0 (homepage) = 15.0
    assert score == 15.0, f"Expected 15.0 for completeness + homepage, got {score}"


def test_popular_library_beats_empty_deployed_toy():
    """A real open-source library with stars and docs must beat a 0-star toy with just a Vercel link"""
    now = datetime.now(timezone.utc).isoformat()
    toy_repo = {
        "name": "toy-web",
        "readme": "# Just a test web page",
        "homepage": "https://my-toy.vercel.app",
        "stargazers_count": 0,
        "forks_count": 0,
        "updated_at": now
    }

    library_repo = {
        "name": "fast-async-rpc",
        "readme": """# fast-async-rpc
        High throughput asynchronous RPC toolkit.
        ```python
        import rpc
        rpc.serve()
        ```
        """ + ("Thorough guides for RPC configuration and client connection pooling. " * 20),
        "description": "High performance async RPC library for distributed microservices",
        "language": "Python",
        "topics": ["rpc", "asyncio", "networking"],
        "stargazers_count": 45,
        "forks_count": 8,
        "updated_at": now
    }

    score_toy = calculate_repo_score(toy_repo)
    score_lib = calculate_repo_score(library_repo)

    assert score_lib > score_toy, f"Library ({score_lib}) must beat toy app ({score_toy})"


def test_best4_sorting_and_limiting():
    """best4 should rank repositories by score, attach 'impact_score', and return top 4"""
    now = datetime.now(timezone.utc).isoformat()
    repos = [
        {"name": "repo-low", "stargazers_count": 0},
        {"name": "repo-top1", "stargazers_count": 200, "updated_at": now, "readme": "## Extensive docs " * 50},
        {"name": "repo-top2", "stargazers_count": 80, "updated_at": now, "description": "Good description here"},
        {"name": "repo-top3", "stargazers_count": 30, "updated_at": now},
        {"name": "repo-top4", "stargazers_count": 10, "updated_at": now},
        {"name": "repo-excluded", "stargazers_count": 1},
    ]

    top_repos = best4(repos)

    assert len(top_repos) == 4, f"Expected 4 repos, got {len(top_repos)}"
    assert top_repos[0]["name"] == "repo-top1"
    assert top_repos[1]["name"] == "repo-top2"
    assert top_repos[2]["name"] == "repo-top3"
    assert top_repos[3]["name"] == "repo-top4"
    assert "impact_score" in top_repos[0], "Returned repos must contain 'impact_score'"
    assert top_repos[0]["impact_score"] >= top_repos[1]["impact_score"]


def test_best4_deterministic_tie_breaking():
    """When scores are identical, repos must break ties deterministically on stars and name"""
    repos = [
        {"name": "alpha", "stargazers_count": 5},
        {"name": "beta", "stargazers_count": 20},
        {"name": "gamma", "stargazers_count": 20, "forks_count": 3},
    ]

    top = best4(repos)
    # gamma has 20 stars and 3 forks; beta has 20 stars and 0 forks; alpha has 5 stars
    assert top[0]["name"] == "gamma"
    assert top[1]["name"] == "beta"
    assert top[2]["name"] == "alpha"


def test_best4_fewer_than_four_repos():
    """best4 should handle input with fewer than 4 repositories gracefully"""
    repos = [
        {"name": "repo-1", "stargazers_count": 2},
        {"name": "repo-2", "stargazers_count": 25}
    ]
    top_repos = best4(repos)
    assert len(top_repos) == 2
    assert top_repos[0]["name"] == "repo-2"
    assert top_repos[1]["name"] == "repo-1"
    assert "impact_score" in top_repos[0]


if __name__ == "__main__":
    test_calculate_repo_score_empty()
    test_calculate_repo_score_readme_substance()
    test_calculate_repo_score_stars_and_forks_smooth_scaling()
    test_calculate_repo_score_recency_decay()
    test_calculate_repo_score_completeness_and_homepage()
    test_popular_library_beats_empty_deployed_toy()
    test_best4_sorting_and_limiting()
    test_best4_deterministic_tie_breaking()
    test_best4_fewer_than_four_repos()
    print("All best4 tests passed successfully!")
