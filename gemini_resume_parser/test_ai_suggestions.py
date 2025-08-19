#!/usr/bin/env python3
"""
Test script for AI Suggestions functionality
This script tests the AI suggestions service to ensure it's working properly.
"""

import os
import sys
import json
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from services.ai_suggestion_service import AISuggestionService
from services.gemini_parser_service import GeminiResumeParser

def test_ai_suggestions():
    """Test the AI suggestions functionality"""
    print("🧪 Testing AI Suggestions Service")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = Path('.env')
    if not env_file.exists():
        print("❌ .env file not found!")
        print("Please run setup_env.py first to configure your environment.")
        return False
    
    try:
        # Test 1: Initialize AI service
        print("\n📋 Test 1: Initializing AI Service")
        ai_service = AISuggestionService()
        print("✅ AI Service initialized successfully")
        
        # Test 2: Test job description generation
        print("\n🎯 Test 2: Job Description Generation")
        print("Generating job description for Software Engineer in Technology sector, USA...")
        
        job_description = ai_service.generate_job_description(
            sector="Technology",
            country="USA", 
            designation="Software Engineer"
        )
        
        if isinstance(job_description, dict) and 'jobTitle' in job_description:
            print("✅ Job description generated successfully")
            print(f"   Job Title: {job_description.get('jobTitle', 'N/A')}")
            print(f"   Experience Level: {job_description.get('experienceLevel', 'N/A')}")
            print(f"   Salary Range: {job_description.get('salaryRange', 'N/A')}")
        else:
            print("❌ Job description generation failed or returned unexpected format")
            print(f"   Type: {type(job_description)}")
            print(f"   Content: {job_description}")
            return False
        
        # Test 3: Test resume parsing (with sample data)
        print("\n📄 Test 3: Resume Parsing")
        print("Testing with sample resume data...")
        
        # Sample resume data that matches the expected structure
        sample_resume = {
            "basic_details": {
                "fullName": "John Doe",
                "professionalTitle": "Software Engineer",
                "email": "john.doe@email.com",
                "phone": "+1-555-0123",
                "location": "San Francisco, CA",
                "linkedin": "linkedin.com/in/johndoe"
            },
            "summary": "Experienced software engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about creating scalable solutions and mentoring junior developers.",
            "skills": {
                "Languages": ["JavaScript", "Python", "Java"],
                "Frameworks": ["React", "Node.js", "Express"],
                "Databases": ["MongoDB", "PostgreSQL", "Redis"],
                "Cloud": ["AWS", "Docker", "Kubernetes"]
            },
            "experience": [
                {
                    "company": "Tech Corp",
                    "role": "Senior Software Engineer",
                    "startDate": "2022-01",
                    "endDate": "Present",
                    "description": "Led development of microservices architecture, mentored 3 junior developers, improved system performance by 40%",
                    "location": "San Francisco, CA"
                }
            ],
            "education": [
                {
                    "institution": "University of Technology",
                    "degree": "Bachelor of Science in Computer Science",
                    "startDate": "2018-09",
                    "endDate": "2022-05",
                    "grade": "3.8/4.0",
                    "description": "Graduated with honors, specialized in software engineering"
                }
            ]
        }
        
        # Test 4: Test AI suggestions generation
        print("\n🤖 Test 4: AI Suggestions Generation")
        print("Comparing sample resume with job description...")
        
        suggestions = ai_service.compare_resume_with_jd(sample_resume, job_description)
        
        if isinstance(suggestions, dict) and 'overallScore' in suggestions:
            print("✅ AI suggestions generated successfully")
            print(f"   Overall Score: {suggestions.get('overallScore', 'N/A')}")
            
            if 'atsCompatibility' in suggestions:
                ats = suggestions['atsCompatibility']
                print(f"   ATS Score: {ats.get('score', 'N/A')}%")
            
            if 'skillsAnalysis' in suggestions:
                skills = suggestions['skillsAnalysis']
                print(f"   Matching Skills: {len(skills.get('matchingSkills', []))}")
                print(f"   Missing Skills: {len(skills.get('missingSkills', []))}")
        else:
            print("❌ AI suggestions generation failed or returned unexpected format")
            print(f"   Type: {type(suggestions)}")
            print(f"   Content: {suggestions}")
            return False
        
        print("\n🎉 All tests passed! AI suggestions service is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure you have a valid GEMINI_API_KEY in your .env file")
        print("2. Check that all required packages are installed: pip install -r requirements.txt")
        print("3. Verify your internet connection")
        print("4. Check the logs for more detailed error information")
        return False

def main():
    """Main test function"""
    print("🚀 AI Suggestions Test Suite")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path('config/config.py').exists():
        print("❌ Please run this script from the gemini_resume_parser directory")
        sys.exit(1)
    
    success = test_ai_suggestions()
    
    if success:
        print("\n✨ AI suggestions are working properly!")
        print("\n🔧 Next steps:")
        print("1. Run the web UI: python web_ui.py")
        print("2. Test with real resumes through the web interface")
        sys.exit(0)
    else:
        print("\n❌ AI suggestions test failed. Please check the configuration.")
        sys.exit(1)

if __name__ == "__main__":
    main()
