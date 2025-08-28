#!/usr/bin/env python3
"""
Test script to verify score validation is working correctly.
This tests that "NA" scores are always converted to valid numbers.
"""

import os
import sys
from services.ai_suggestion_service import AISuggestionService

def test_score_validation():
    """Test that score validation prevents 'NA' values"""
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        return
    
    print("🧪 Testing Score Validation")
    print("=" * 50)
    
    # Initialize the service
    service = AISuggestionService(api_key=api_key)
    
    # Test Case 1: "NA" score
    print("\n1️⃣ Testing 'NA' score validation")
    test_response = {"overallScore": "NA"}
    validated_score = service._validate_overall_score(test_response["overallScore"])
    print(f"   Input: 'NA' -> Output: {validated_score} (type: {type(validated_score)})")
    
    # Test Case 2: "N/A" score
    print("\n2️⃣ Testing 'N/A' score validation")
    test_response = {"overallScore": "N/A"}
    validated_score = service._validate_overall_score(test_response["overallScore"])
    print(f"   Input: 'N/A' -> Output: {validated_score} (type: {type(validated_score)})")
    
    # Test Case 3: "n/a" score (lowercase)
    print("\n3️⃣ Testing 'n/a' score validation")
    test_response = {"overallScore": "n/a"}
    validated_score = service._validate_overall_score(test_response["overallScore"])
    print(f"   Input: 'n/a' -> Output: {validated_score} (type: {type(validated_score)})")
    
    # Test Case 4: Valid numeric score
    print("\n4️⃣ Testing valid numeric score")
    test_response = {"overallScore": 85}
    validated_score = service._validate_overall_score(test_response["overallScore"])
    print(f"   Input: 85 -> Output: {validated_score} (type: {type(validated_score)})")
    
    # Test Case 5: Test complete schema enforcement
    print("\n5️⃣ Testing complete schema enforcement with 'NA' score")
    test_ai_response = {
        "overallScore": "NA",
        "sectionSuggestions": {}
    }
    test_resume_data = {"experience": [{"role": "Developer"}]}
    
    enforced_response = service._enforce_schema_compliance(test_ai_response, test_resume_data)
    final_score = enforced_response.get("overallScore")
    print(f"   Final score after enforcement: {final_score} (type: {type(final_score)})")
    
    if isinstance(final_score, int) and final_score >= 0 and final_score <= 100:
        print("   ✅ SUCCESS: Score is valid number")
    else:
        print("   ❌ FAILURE: Score is still invalid")
    
    print("\n✅ Score validation testing completed!")
    print("\n💡 If you still see 'NA' in the web interface:")
    print("   1. Check the logs for validation messages")
    print("   2. Verify the schema enforcement is being called")
    print("   3. Check if there's a caching issue in the frontend")

if __name__ == "__main__":
    test_score_validation()
