import math

def calculate_repo_score(repo:dict)->float:
    parameters = ['stars','professional','forks','loc','depolyed']
    # readme present >deployed>stars>forks>loc
    score = 0
    
    if repo.get("readme"):
        score +=30
    homepage = repo.get("homepage") or repo.get("deployed_url")
    if homepage and homepage.strip().startswith("http"):
        score += 25
    
    stars = repo.get("stargazers_count",0) or repo.get("stars",0)
    score += min(20.0, math.log2(stars + 1) * 4.0)

    forks = repo.get("forks_count", 0) or repo.get("forks", 0)
    score += min(15.0, math.log2(forks + 1) * 5.0)

    size_kb = repo.get("size",0)
    if size_kb > 500:
        score +=10
    elif size_kb > 100:
        score += 5
    return round(score,2)

def best4(repos:list)->list:
    scored_repo = []

    for repo in repos:
        score = calculate_repo_score(repo)
        if score >= 0 :
            scored_repo.append((score,repo))
        
    scored_repo.sort(key=lambda x:x[0],reverse=True)
    return [repo for _,repo in scored_repo[:4]]