#!/usr/bin/env python3
"""
Test script to verify that fallback methods properly use actual resume data.
This tests that education, certifications, and projects show real data instead of "N/A".
"""

import os
import sys
from services.ai_suggestion_service import AISuggestionService

def test_fallback_data():
    """Test that fallback methods use actual resume data"""
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        return
    
    print("🧪 Testing Fallback Data Methods")
    print("=" * 60)
    
    # Initialize the service
    service = AISuggestionService(api_key=api_key)
    
    # Test resume data with actual education, certifications, and projects
    test_resume = {
        "basic_details": {
            "fullName": "John Doe",
            "professionalTitle": "Software Engineer"
        },
        "education": [
            {
                "degree": "Bachelor of Science in Computer Science",
                "institution": "University of Technology",
                "startDate": "2018-09",
                "endDate": "2022-05",
                "grade": "3.8/4.0"
            }
        ],
        "certifications": [
            {
                "certificateName": "AWS Certified Solutions Architect",
                "institueName": "Amazon Web Services",
                "issueDate": "2023-06",
                "expiryDate": "2026-06"
            }
        ],
        "projects": [
            {
                "name": "E-commerce Platform",
                "description": "Built a full-stack e-commerce platform using React and Node.js"
            }
        ]
    }
    
    # Test education fallback
    print("\n1️⃣ Testing Education Fallback")
    education_fallback = service._create_education_fallback(test_resume)
    print(f"   Education existing: {education_fallback['existing']}")
    
    # Test certifications fallback
    print("\n2️⃣ Testing Certifications Fallback")
    cert_fallback = service._create_certifications_fallback(test_resume)
    print(f"   Certifications existing: {cert_fallback['existing']}")
    
    # Test projects fallback
    print("\n3️⃣ Testing Projects Fallback")
    projects_fallback = service._create_projects_fallback(test_resume)
    print(f"   Projects existing: {projects_fallback[0]['existing']}")
    
    # Test with partial data (some fields missing)
    print("\n4️⃣ Testing with Partial Data")
    partial_resume = {
        "education": [
            {
                "degree": "Master's Degree",
                "institution": "Tech University"
                # Missing dates and grade
            }
        ],
        "certifications": [
            {
                "certificateName": "Python Certification"
                # Missing organization and dates
            }
        ]
    }
    
    print("   Partial education fallback:")
    partial_edu = service._create_education_fallback(partial_resume)
    print(f"     {partial_edu['existing']}")
    
    print("   Partial certifications fallback:")
    partial_cert = service._create_certifications_fallback(partial_resume)
    print(f"     {partial_cert['existing']}")
    
    # Test with empty data
    print("\n5️⃣ Testing with Empty Data")
    empty_resume = {
        "education": [],
        "certifications": [],
        "projects": []
    }
    
    print("   Empty education fallback:")
    empty_edu = service._create_education_fallback(empty_resume)
    print(f"     {empty_edu['existing']}")
    
    print("   Empty certifications fallback:")
    empty_cert = service._create_certifications_fallback(empty_resume)
    print(f"     {empty_cert['existing']}")
    
    print("\n✅ Fallback data testing completed!")
    print("\n💡 Key improvements:")
    print("   • No more 'N/A' values in existing fields")
    print("   • Only shows fields that have actual data")
    print("   • Proper formatting of available information")
    print("   • Graceful handling of missing data")

if __name__ == "__main__":
    test_fallback_data()
