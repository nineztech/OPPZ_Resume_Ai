#!/usr/bin/env python3
"""
Test script to verify experience section detection works correctly with different data structures.
This will help identify why the experience section might be showing as empty.
"""

import os
import sys
from services.ai_suggestion_service import AISuggestionService

def test_experience_detection():
    """Test experience detection with various data structures"""
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        return
    
    print("🧪 Testing Experience Section Detection")
    print("=" * 60)
    
    # Initialize the service
    service = AISuggestionService(api_key=api_key)
    
    # Test Case 1: Standard experience structure
    print("\n1️⃣ Testing STANDARD experience structure")
    standard_resume = {
        "basic_details": {"fullName": "John Doe"},
        "experience": [
            {
                "role": "Software Engineer",
                "company": "Tech Corp",
                "startDate": "2020-01",
                "endDate": "Present",
                "description": "Developed web applications"
            }
        ]
    }
    
    debug_info = service.debug_resume_structure(standard_resume)
    print(debug_info)
    
    # Test Case 2: Alternative experience key
    print("\n2️⃣ Testing ALTERNATIVE experience key (work_experience)")
    alt_resume = {
        "basic_details": {"fullName": "Jane Smith"},
        "work_experience": [
            {
                "title": "Developer",
                "employer": "Startup Inc",
                "start": "2019-06",
                "end": "2020-12",
                "responsibilities": "Built APIs"
            }
        ]
    }
    
    debug_info = service.debug_resume_structure(alt_resume)
    print(debug_info)
    
    # Test Case 3: Empty experience
    print("\n3️⃣ Testing EMPTY experience structure")
    empty_resume = {
        "basic_details": {"fullName": "Bob Wilson"},
        "experience": []
    }
    
    debug_info = service.debug_resume_structure(empty_resume)
    print(debug_info)
    
    # Test Case 4: Missing experience key
    print("\n4️⃣ Testing MISSING experience key")
    missing_resume = {
        "basic_details": {"fullName": "Alice Brown"},
        "skills": ["Python", "JavaScript"]
    }
    
    debug_info = service.debug_resume_structure(missing_resume)
    print(debug_info)
    
    # Test Case 5: Malformed experience data
    print("\n5️⃣ Testing MALFORMED experience data")
    malformed_resume = {
        "basic_details": {"fullName": "Charlie Davis"},
        "experience": "Not a list"
    }
    
    debug_info = service.debug_resume_structure(malformed_resume)
    print(debug_info)
    
    print("\n✅ Experience detection testing completed!")
    print("\n💡 If your resume shows empty experience, check:")
    print("   • The exact key name used for experience data")
    print("   • Whether the experience data is a list")
    print("   • Whether the list contains valid job objects")
    print("   • Field names within each job object")

if __name__ == "__main__":
    test_experience_detection()
