import httpx
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import re

LEVEL_MAP = {
    "NONE": 0,
    "FIRST_QUARTILE": 1,
    "SECOND_QUARTILE": 2,
    "THIRD_QUARTILE": 3,
    "FOURTH_QUARTILE": 4,
}

def calculate_streaks(all_days: List[Dict[str, Any]]) -> Dict[str, int]:
    """Calculate current and longest streaks from a list of sorted days."""
    if not all_days:
        return {"currentStreak": 0, "longestStreak": 0}

    longest_streak = 0
    temp_streak = 0
    
    # Sort days by date just in case
    sorted_days = sorted(all_days, key=lambda d: d.get("date", ""))
    
    for day in sorted_days:
        count = day.get("count", 0)
        if count > 0:
            temp_streak += 1
            if temp_streak > longest_streak:
                longest_streak = temp_streak
        else:
            temp_streak = 0

    # Current streak calculation (backwards from latest day)
    current_streak = 0
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday_str = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    # Filter only days up to today
    past_days = [d for d in sorted_days if d.get("date", "") <= today_str]
    
    for day in reversed(past_days):
        count = day.get("count", 0)
        date = day.get("date", "")
        
        # If the most recent day has 0 contributions, allow yesterday to continue streak if today isn't over yet
        if current_streak == 0 and count == 0 and date == today_str:
            continue
        if count > 0:
            current_streak += 1
        else:
            break

    return {
        "currentStreak": current_streak,
        "longestStreak": longest_streak,
    }


async def fetch_github_graphql_contributions(username: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Fetch official GitHub contribution calendar using GraphQL API."""
    query = """
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
    """
    headers = {
        "User-Agent": "GitHub-Profile-Finder",
        "Accept": "application/vnd.github+json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            res = await client.post(
                "https://api.github.com/graphql",
                json={"query": query, "variables": {"username": username}},
            )
            if res.status_code != 200:
                return None
            data = res.json()
            user_data = data.get("data", {}).get("user")
            if not user_data:
                return None
            
            cal = user_data.get("contributionsCollection", {}).get("contributionCalendar", {})
            raw_weeks = cal.get("weeks", [])
            total_contributions = cal.get("totalContributions", 0)

            all_days = []
            formatted_weeks = []

            for w in raw_weeks:
                week_days = []
                for d in w.get("contributionDays", []):
                    lvl_str = d.get("contributionLevel", "NONE")
                    lvl_num = LEVEL_MAP.get(lvl_str, 0)
                    day_item = {
                        "date": d.get("date"),
                        "count": d.get("contributionCount", 0),
                        "level": lvl_num,
                    }
                    week_days.append(day_item)
                    all_days.append(day_item)
                if week_days:
                    formatted_weeks.append({"days": week_days})

            streaks = calculate_streaks(all_days)

            return {
                "totalContributions": total_contributions,
                "currentStreak": streaks["currentStreak"],
                "longestStreak": streaks["longestStreak"],
                "weeks": formatted_weeks,
            }
    except Exception as e:
        print(f"Error fetching GraphQL contributions for {username}: {e}")
        return None


async def fetch_public_contributions_fallback(username: str) -> Optional[Dict[str, Any]]:
    """Fallback to public contributions API if token is missing or GraphQL fails."""
    try:
        async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "GitHub-Profile-Finder"}) as client:
            res = await client.get(f"https://github-contributions-api.jogruber.de/v4/{username}?y=last")
            if res.status_code == 200:
                data = res.json()
                contributions = data.get("contributions", [])
                total = data.get("total", {}).get("lastYear", 0) or sum(c.get("count", 0) for c in contributions)

                all_days = []
                for c in contributions:
                    all_days.append({
                        "date": c.get("date"),
                        "count": c.get("count", 0),
                        "level": c.get("level", 0),
                    })

                # Group days into weeks of 7 (starting Sunday)
                formatted_weeks = []
                current_week = []
                for d in all_days:
                    current_week.append(d)
                    if len(current_week) == 7:
                        formatted_weeks.append({"days": current_week})
                        current_week = []
                if current_week:
                    formatted_weeks.append({"days": current_week})

                streaks = calculate_streaks(all_days)

                return {
                    "totalContributions": total,
                    "currentStreak": streaks["currentStreak"],
                    "longestStreak": streaks["longestStreak"],
                    "weeks": formatted_weeks,
                }
    except Exception as e:
        print(f"Fallback contributions error for {username}: {e}")
    return None


async def get_user_contributions(username: str, token: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve contributions calendar for user with primary GraphQL + public fallback."""
    # 1. Try GraphQL first
    data = await fetch_github_graphql_contributions(username, token)
    if data and data.get("weeks"):
        return data

    # 2. Try Fallback API
    fallback_data = await fetch_public_contributions_fallback(username)
    if fallback_data and fallback_data.get("weeks"):
        return fallback_data

    # 3. If all else fails, return empty structure
    return {
        "totalContributions": 0,
        "currentStreak": 0,
        "longestStreak": 0,
        "weeks": [],
    }


