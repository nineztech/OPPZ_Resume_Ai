#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from parser.sections.education_parser import parse_education_section

def test_grade_field():
    """Test the education parser with grade field"""
    
    # Test cases with different grade formats
    test_cases = [
        {
            "name": "CGPA format",
            "text": """EDUCATION
LJ University 2022 - 2026
BTech Computer Science and Engineering
CGPA: 9.5"""
        },
        {
            "name": "GPA format",
            "text": """EDUCATION
MIT University 2020 - 2024
Master of Science
GPA: 3.8"""
        },
        {
            "name": "Percentage format",
            "text": """EDUCATION
Stanford University 2018 - 2022
Bachelor of Engineering
Percentage: 85%"""
        },
        {
            "name": "SPI format",
            "text": """EDUCATION
IIT Delhi 2021 - 2025
B.Tech Computer Science
SPI: 8.9"""
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"Test Case {i}: {test_case['name']}")
        print(f"{'='*60}")
        print("Input:")
        print(test_case['text'])
        print("\nOutput:")
        
        result = parse_education_section(test_case['text'])
        
        for j, edu in enumerate(result, 1):
            print(f"Education {j}:")
            print(f"  ID: {edu.get('id', 'N/A')}")
            print(f"  Institution: {edu.get('institution', 'N/A')}")
            print(f"  Degree: {edu.get('degree', 'N/A')}")
            print(f"  Start Date: {edu.get('start_date', 'N/A')}")
            print(f"  End Date: {edu.get('end_date', 'N/A')}")
            print(f"  Grade: {edu.get('grade', 'N/A')}")
            print(f"  Description: {edu.get('description', 'N/A')}")
            print()
        
        # Check if grade field is populated
        if result and result[0].get('grade'):
            print(f"✅ SUCCESS: Grade field populated with '{result[0]['grade']}'")
        else:
            print("❌ FAILED: Grade field not populated")
    
    print(f"\n{'='*60}")
    print("All tests completed!")

if __name__ == "__main__":
    test_grade_field()
