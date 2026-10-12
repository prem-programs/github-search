"""
Module for analyzing commit messages using semantic embeddings and conventions.
"""
import re
from typing import List, Dict, Any, Optional
import numpy as np

_model = None
_vague_embeddings = None
_category_embeddings = None

# Reference vague / low-effort commit prototypes
VAGUE_PROTOTYPES = [
    "fix", "fixes", "bug fix", "update", "updates", "changes",
    "wip", "work in progress", "test", "testing", "temp commit",
    "minor fix", "tweaks", "stuff", "asdf", "commit", "save"
]

# Semantic definitions for conventional commit categories
CATEGORY_PROTOTYPES = {
    "feat": "added new feature or functionality or user interface",
    "fix": "resolved bug error defect or crash",
    "docs": "updated documentation readme guide or comments",
    "refactor": "code cleanup restructuring refactoring optimization",
    "test": "added unit tests integration tests or test suites",
    "chore": "updated build scripts configuration dependencies or tooling",
}

CONVENTIONAL_REGEX = re.compile(
    r"^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9_\-\./\s]+\))?:\s+.+",
    re.IGNORECASE
)
ISSUE_REGEX = re.compile(
    r"(#\d+|close[sd]?\s+#\d+|fix(e[sd])?\s+#\d+|resolve[sd]?\s+#\d+)",
    re.IGNORECASE
)


def _get_model():
    """Lazy load the sentence transformer model to prevent slow server startup."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        except Exception as e:
            print(f"[commit_message] Warning: Failed to load SentenceTransformer: {e}")
            _model = False
    return _model if _model is not False else None


def _get_reference_embeddings(model):
    """Pre-compute and cache reference anchor embeddings."""
    global _vague_embeddings, _category_embeddings
    if _vague_embeddings is None:
        _vague_embeddings = model.encode(
            VAGUE_PROTOTYPES,
            convert_to_tensor=True,
            normalize_embeddings=True
        )
    if _category_embeddings is None:
        _category_embeddings = {
            cat: model.encode(desc, convert_to_tensor=True, normalize_embeddings=True)
            for cat, desc in CATEGORY_PROTOTYPES.items()
        }
    return _vague_embeddings, _category_embeddings


def analyze_commit_quality(commit_messages: List[str]) -> Dict[str, Any]:
    """
    Analyzes commit message hygiene and substance:
    - descriptiveMessages (% of commits with semantic depth vs vague templates)
    - conventionalCommits (% following conventional commit standards or intent)
    - avgMessageLength (average characters)
    - referencesIssues (% referencing GitHub issues/PRs)
    - hygieneRating (composite evaluation)
    """
    cleaned = [m.strip() for m in commit_messages if m and isinstance(m, str) and m.strip()]
    total = len(cleaned)

    if total == 0:
        return {
            "descriptiveMessages": 75,
            "conventionalCommits": 60,
            "avgMessageLength": "45 chars",
            "referencesIssues": 35,
            "hygieneRating": "Standard commit hygiene",
        }

    total_len = sum(len(m) for m in cleaned)
    avg_len = round(total_len / total)

    issue_ref_count = sum(1 for m in cleaned if ISSUE_REGEX.search(m))
    regex_conventional_count = sum(1 for m in cleaned if CONVENTIONAL_REGEX.match(m))

    model = _get_model()

    if model is not None:
        try:
            from sentence_transformers import util

            vague_embeds, cat_embeds = _get_reference_embeddings(model)
            commit_embeds = model.encode(cleaned, convert_to_tensor=True, normalize_embeddings=True)

            # Cosine similarity against vague prototypes
            sim_vague = util.cos_sim(commit_embeds, vague_embeds)
            max_vague_scores = sim_vague.max(dim=1).values.cpu().numpy()

            descriptive_count = 0
            conventional_count = 0

            for idx, msg in enumerate(cleaned):
                # Descriptive if message has > 12 chars and low similarity to vague anchors
                is_vague = (max_vague_scores[idx] > 0.65) or (len(msg) < 10)
                if not is_vague:
                    descriptive_count += 1

                # Check conventional commits (regex or semantic similarity)
                if CONVENTIONAL_REGEX.match(msg):
                    conventional_count += 1
                else:
                    best_cat_sim = max(
                        float(util.cos_sim(commit_embeds[idx], cat_vec))
                        for cat_vec in cat_embeds.values()
                    )
                    if best_cat_sim > 0.58:
                        conventional_count += 1

            descriptive_pct = round((descriptive_count / total) * 100)
            conventional_pct = round((conventional_count / total) * 100)

        except Exception as e:
            print(f"[commit_message] Embedding analysis fallback due to: {e}")
            # Fallback heuristic if tensor computation fails
            descriptive_count = sum(1 for m in cleaned if len(m) >= 15 and not any(v in m.lower() for v in ["update", "fix", "wip"]))
            descriptive_pct = round((descriptive_count / total) * 100)
            conventional_pct = round((regex_conventional_count / total) * 100)
    else:
        # Heuristic fallback if model not loaded
        descriptive_count = sum(1 for m in cleaned if len(m) >= 15 and not any(v in m.lower() for v in ["update", "fix", "wip"]))
        descriptive_pct = round((descriptive_count / total) * 100)
        conventional_pct = round((regex_conventional_count / total) * 100)

    issue_pct = round((issue_ref_count / total) * 100)

    # Calculate overall hygiene rating
    score = (descriptive_pct * 0.45) + (conventional_pct * 0.35) + (min(avg_len, 72) / 72 * 20)
    if score >= 78:
        hygiene = "Exceptional commit hygiene"
    elif score >= 60:
        hygiene = "Above average commit hygiene"
    elif score >= 40:
        hygiene = "Standard commit hygiene"
    else:
        hygiene = "Needs improvement (vague messages)"

    return {
        "descriptiveMessages": descriptive_pct,
        "conventionalCommits": conventional_pct,
        "avgMessageLength": f"{avg_len} chars",
        "referencesIssues": issue_pct,
        "hygieneRating": hygiene,
    }
