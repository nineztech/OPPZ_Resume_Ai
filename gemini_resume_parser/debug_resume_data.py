#!/usr/bin/env python3
"""
Debug script to inspect resume data structure and identify issues with experience section detection.
Run this script with your resume data to see exactly what structure the AI service is working with.
"""

import json
import os
import sys
from services.ai_suggestion_service import AISuggestionService

def debug_resume_data(resume_data):
    """Debug a specific resume data structure"""
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        return
    
    print("🔍 DEBUGGING RESUME DATA STRUCTURE")
    print("=" * 60)
    
    # Initialize the service
    service = AISuggestionService(api_key=api_key)
    
    # Use the debug method
    debug_info = service.debug_resume_structure(resume_data)
    print(debug_info)
    
    print("\n" + "=" * 60)
    print("📝 TESTING FORMATTING")
    print("=" * 60)
    
    # Test the formatting method
    try:
        formatted_text = service._format_resume_for_comparison(resume_data)
        print("\n✅ Formatted resume text:")
        print("-" * 40)
        print(formatted_text)
        print("-" * 40)
    except Exception as e:
        print(f"\n❌ Error during formatting: {str(e)}")
        import traceback
        traceback.print_exc()

def debug_sample_resume():
    """Debug with a sample resume structure to test the service"""
    
    # Sample resume data structure
    sample_resume = {
        "basic_details": {
            "fullName": "John Doe",
            "professionalTitle": "Software Engineer",
            "email": "john@example.com",
            "phone": "+1-555-0123",
            "location": "San Francisco, CA"
        },
        "summary": "Experienced software engineer with 5+ years in web development",
        "skills": {
            "programming": ["Python", "JavaScript", "React"],
            "tools": ["Git", "Docker", "AWS"]
        },
        "experience": [
            {
                "role": "Senior Software Engineer",
                "company": "Tech Corp",
                "startDate": "2020-01",
                "endDate": "Present",
                "location": "San Francisco, CA",
                "description": "Led development of web applications using React and Node.js"
            },
            {
                "role": "Software Engineer",
                "company": "Startup Inc",
                "startDate": "2018-06",
                "endDate": "2019-12",
                "location": "New York, NY",
                "description": "Developed REST APIs and frontend components"
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science in Computer Science",
                "institution": "University of Technology",
                "startDate": "2014-09",
                "endDate": "2018-05"
            }
        ]
    }
    
    print("🧪 Testing with SAMPLE resume data")
    debug_resume_data(sample_resume)

def debug_from_file(file_path):
    """Debug resume data from a JSON file"""
    try:
        with open(file_path, 'r') as f:
            resume_data = json.load(f)
        print(f"📁 Loading resume data from: {file_path}")
        debug_resume_data(resume_data)
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in file: {file_path}")
    except Exception as e:
        print(f"❌ Error reading file: {str(e)}")

if __name__ == "__main__":
    print("🔍 Resume Data Debug Tool")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        # Debug from file
        file_path = sys.argv[1]
        debug_from_file(file_path)
    else:
        # Debug with sample data
        debug_sample_resume()
        
        print("\n" + "=" * 60)
        print("💡 USAGE:")
        print("   python debug_resume_data.py                    # Test with sample data")
        print("   python debug_resume_data.py resume.json       # Test with your resume file")
        print("=" * 60)
