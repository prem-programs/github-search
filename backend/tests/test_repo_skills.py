from services import skill_extractor

# Dummy data for testing
DUMMY_README = """
# My Awesome Project

This is a React application built with TypeScript and Node.js.
It uses Express.js for the backend and MongoDB for the database.
We also use Docker for containerization and Redis for caching.
"""

DUMMY_TOPICS = "javascript typescript react nodejs express mongodb"

DUMMY_DESCRIPTION = "A full-stack web application using React, Node.js, and MongoDB with Docker deployment"

DUMMY_LANGUAGE = "python typescript javascript"


def test_skill_extractor_with_dummy_data():
    """Test skill extraction with dummy data"""
    skills, confidence = skill_extractor.extract_repo_skills(
        readme=DUMMY_README,
        topics=DUMMY_TOPICS,
        description=DUMMY_DESCRIPTION,
        language=DUMMY_LANGUAGE
    )
    
    print("Skills found:", skills)
    print("Confidence score:", confidence)
    
    # Assertions to verify expected skills are detected
    expected_skills = {"React", "TypeScript", "JavaScript", "Node.js", "Express.js", "MongoDB", "Docker", "Redis", "Python"}
    detected_skills = set(skills.keys())
    
    print(f"Expected skills: {expected_skills}")
    print(f"Detected skills: {detected_skills}")
    print(f"Missing skills: {expected_skills - detected_skills}")
    
    assert len(skills) > 0, "No skills were detected"
    assert confidence > 0, "Confidence score should be greater than 0"


def test_skill_extractor_empty_data():
    """Test skill extraction with empty data"""
    skills, confidence = skill_extractor.extract_repo_skills()
    
    print("Empty test - Skills found:", skills)
    print("Empty test - Confidence score:", confidence)
    
    assert isinstance(skills, dict), "Skills should be a dictionary"


def test_skill_extractor_minimal_data():
    """Test skill extraction with minimal data"""
    skills, confidence = skill_extractor.extract_repo_skills(readme="Uses Python and Flask")
    
    print("Minimal test - Skills found:", skills)
    print("Minimal test - Confidence score:", confidence)
    
    assert "Python" in skills, "Python should be detected"
    assert "Flask" in skills, "Flask should be detected"

