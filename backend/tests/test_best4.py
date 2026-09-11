import os
import sys

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


def test_calculate_repo_score_readme_and_deployed():
    """Repo with README and deployed link should get 30 + 25 = 55 points"""
    repo = {
        "readme": "# Full Documentation here",
        "homepage": "https://my-app.vercel.app"
    }
    score = calculate_repo_score(repo)
    assert score == 55.0, f"Expected 55.0, got {score}"


def test_calculate_repo_score_stars_and_forks():
    """Repo with 1 star and 1 fork should score: log2(2)*4 + log2(2)*5 = 4 + 5 = 9 points"""
    repo = {
        "stargazers_count": 1,
        "forks_count": 1
    }
    score = calculate_repo_score(repo)
    assert score == 9.0, f"Expected 9.0, got {score}"


def test_calculate_repo_score_size():
    """Repo with size > 500 KB should receive 10 points"""
    repo = {"size": 600}
    score = calculate_repo_score(repo)
    assert score == 10.0, f"Expected 10.0, got {score}"

    repo_medium = {"size": 250}
    score_medium = calculate_repo_score(repo_medium)
    assert score_medium == 5.0, f"Expected 5.0, got {score_medium}"


def test_calculate_repo_score_max_cap():
    """Repo with huge stars/forks/size should be capped appropriately"""
    repo = {
        "readme": "Extensive README",
        "homepage": "https://live-demo.com",
        "stargazers_count": 10000,  # Max 20.0
        "forks_count": 5000,        # Max 15.0
        "size": 10000               # Max 10.0
    }
    score = calculate_repo_score(repo)
    expected_score = 30 + 25 + 20.0 + 15.0 + 10.0  # 100.0
    assert score == expected_score, f"Expected {expected_score}, got {score}"


def test_best4_sorting_and_limiting():
    """best4 should rank and return the top 4 repositories in descending order"""
    repos = [
        {"name": "repo-low", "size": 50},                                    # score = 0
        {"name": "repo-top1", "readme": "Yes", "homepage": "https://top.io", "stargazers_count": 50, "size": 600}, # high score
        {"name": "repo-top2", "readme": "Yes", "homepage": "https://top2.io", "size": 200},                          # 30+25+5 = 60
        {"name": "repo-top3", "readme": "Yes", "size": 600},                                                         # 30+10 = 40
        {"name": "repo-top4", "readme": "Yes"},                                                                      # 30
        {"name": "repo-excluded", "size": 10},                                                                       # score = 0
    ]

    top_repos = best4(repos)

    assert len(top_repos) == 4, f"Expected 4 repos, got {len(top_repos)}"
    assert top_repos[0]["name"] == "repo-top1"
    assert top_repos[1]["name"] == "repo-top2"
    assert top_repos[2]["name"] == "repo-top3"
    assert top_repos[3]["name"] == "repo-top4"


def test_best4_fewer_than_four_repos():
    """best4 should handle input with fewer than 4 repositories gracefully"""
    repos = [
        {"name": "repo-1", "readme": "Yes"},
        {"name": "repo-2", "readme": "Yes", "homepage": "https://demo.com"}
    ]
    top_repos = best4(repos)
    assert len(top_repos) == 2
    assert top_repos[0]["name"] == "repo-2"
    assert top_repos[1]["name"] == "repo-1"


if __name__ == "__main__":
    test_calculate_repo_score_empty()
    test_calculate_repo_score_readme_and_deployed()
    test_calculate_repo_score_stars_and_forks()
    test_calculate_repo_score_size()
    test_calculate_repo_score_max_cap()
    test_best4_sorting_and_limiting()
    test_best4_fewer_than_four_repos()
    print("All best4 tests passed successfully!")
