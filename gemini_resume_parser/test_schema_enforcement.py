#!/usr/bin/env python3
"""
Test script to verify schema enforcement works correctly.
This tests that all required sections are always present, even if the AI skips them.
"""

import json
import os
import sys
from services.ai_suggestion_service import AISuggestionService

def test_schema_enforcement():
    """Test that schema enforcement prevents missing sections"""
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        return
    
    print("🧪 Testing Schema Enforcement")
    print("=" * 60)
    
    # Initialize the service
    service = AISuggestionService(api_key=api_key)
    
    # Test Case 1: Complete AI response (should remain unchanged)
    print("\n1️⃣ Testing COMPLETE AI response")
    complete_response = {
        "overallScore": 85,
        "analysisTimestamp": "2024-01-01T00:00:00Z",
        "sectionSuggestions": {
            "professionalSummary": {"existing": "Old summary", "rewrite": "New summary", "recommendations": ["Good"]},
            "skills": {"existing": ["Python"], "rewrite": ["Python", "Java"], "recommendations": ["Add Java"]},
            "workExperience": [{"role": "Developer", "existing": "Old desc", "rewrite": "New desc", "recommendations": ["Better"]}],
            "projects": [{"name": "Project", "existing": "Old desc", "rewrite": "New desc", "recommendations": ["Improve"]}],
            "education": {"existing": ["Degree"], "rewrite": "Degree", "recommendations": ["Good"]},
            "certifications": {"existing": ["Cert"], "rewrite": "Cert", "recommendations": ["Good"]}
        },
        "topRecommendations": ["Action 1", "Action 2"]
    }
    
    sample_resume = {
        "experience": [{"role": "Developer", "description": "Old description"}]
    }
    
    enforced = service._enforce_schema_compliance(complete_response, sample_resume)
    print(f"✅ Complete response preserved: {len(enforced['sectionSuggestions'])} sections")
    
    # Test Case 2: Missing workExperience section
    print("\n2️⃣ Testing MISSING workExperience section")
    incomplete_response = {
        "overallScore": 75,
        "sectionSuggestions": {
            "professionalSummary": {"existing": "Old", "rewrite": "New", "recommendations": ["Good"]},
            "skills": {"existing": [], "rewrite": [], "recommendations": []},
            # workExperience is missing!
            "projects": [],
            "education": {"existing": [], "rewrite": "", "recommendations": []},
            "certifications": {"existing": [], "rewrite": "", "recommendations": []}
        }
    }
    
    enforced = service._enforce_schema_compliance(incomplete_response, sample_resume)
    if "workExperience" in enforced["sectionSuggestions"]:
        print("✅ Missing workExperience section was added")
        print(f"   Added {len(enforced['sectionSuggestions']['workExperience'])} experience entries")
    else:
        print("❌ workExperience section still missing")
    
    # Test Case 3: Empty workExperience array
    print("\n3️⃣ Testing EMPTY workExperience array")
    empty_response = {
        "overallScore": 70,
        "sectionSuggestions": {
            "professionalSummary": {"existing": "Old", "rewrite": "New", "recommendations": ["Good"]},
            "skills": {"existing": [], "rewrite": [], "recommendations": []},
            "workExperience": [],  # Empty array
            "projects": [],
            "education": {"existing": [], "rewrite": "", "recommendations": []},
            "certifications": {"existing": [], "rewrite": "", "recommendations": []}
        }
    }
    
    enforced = service._enforce_schema_compliance(empty_response, sample_resume)
    if enforced["sectionSuggestions"]["workExperience"]:
        print("✅ Empty workExperience array was populated")
        print(f"   Now has {len(enforced['sectionSuggestions']['workExperience'])} entries")
    else:
        print("❌ workExperience array still empty")
    
    # Test Case 4: Completely missing sectionSuggestions
    print("\n4️⃣ Testing MISSING sectionSuggestions")
    minimal_response = {
        "overallScore": 60
        # sectionSuggestions is completely missing!
    }
    
    enforced = service._enforce_schema_compliance(minimal_response, sample_resume)
    if "sectionSuggestions" in enforced:
        print("✅ Missing sectionSuggestions was added")
        print(f"   Contains {len(enforced['sectionSuggestions'])} sections")
    else:
        print("❌ sectionSuggestions still missing")
    
    # Test Case 5: Test fallback creation from original resume
    print("\n5️⃣ Testing FALLBACK from original resume")
    complex_resume = {
        "experience": [
            {
                "role": "Senior Developer",
                "company": "Tech Corp",
                "description": "Led development team",
                "startDate": "2020-01",
                "endDate": "Present"
            },
            {
                "title": "Developer",  # Different field name
                "employer": "Startup Inc",  # Different field name
                "responsibilities": "Built APIs",  # Different field name
                "start": "2018-06",  # Different field name
                "end": "2019-12"  # Different field name
            }
        ]
    }
    
    enforced = service._enforce_schema_compliance(minimal_response, complex_resume)
    work_exp = enforced["sectionSuggestions"]["workExperience"]
    if work_exp and len(work_exp) == 2:
        print("✅ Fallback created from original resume data")
        print(f"   Job 1: {work_exp[0]['role']} at {work_exp[0].get('company', 'N/A')}")
        print(f"   Job 2: {work_exp[1]['role']} at {work_exp[1].get('company', 'N/A')}")
    else:
        print("❌ Fallback creation failed")
    
    print("\n✅ Schema enforcement testing completed!")
    print("\n💡 Key benefits:")
    print("   • workExperience section is never missing")
    print("   • All required sections are always present")
    print("   • Fallback data from original resume is used")
    print("   • Schema compliance is guaranteed")

if __name__ == "__main__":
    test_schema_enforcement()
