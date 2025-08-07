#!/usr/bin/env python3
"""
Test script to verify that summary sections are captured completely.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from parser.sections.main_section_parser import split_into_sections

def test_summary_complete():
    """Test that summary content is captured completely"""
    
    # Test resume text with a comprehensive summary
    test_resume = """
John Doe
john.doe@email.com
+1-555-123-4567
New York, NY

SUMMARY
Experienced software developer with 5 years of experience in developing web applications. 
I have developed multiple projects using React and Node.js, including an e-commerce platform 
and a portfolio website. Passionate about creating innovative solutions and working with 
modern technologies. Skilled in JavaScript, Python, and various frameworks. 
Collaborative team player with strong problem-solving abilities and attention to detail.

EXPERIENCE
Software Developer | Tech Corp | 2020-2023
- Developed and maintained web applications using React and Node.js
- Built RESTful APIs and integrated with MongoDB database
- Created responsive user interfaces using modern CSS frameworks

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2016-2020

SKILLS
JavaScript, React, Node.js, Python, MongoDB, Express.js
"""
    
    print("Testing complete summary capture...")
    print("=" * 60)
    print("Input resume:")
    print(test_resume)
    print("=" * 60)
    
    # Parse the resume
    result = split_into_sections(test_resume)
    
    print("Parsed sections:")
    print(f"Summary length: {len(result['summary'])} characters")
    print(f"Summary content: '{result['summary']}'")
    print(f"Experience: {result['experience']}")
    print(f"Education: {result['education']}")
    print(f"Skills: {result['skills']}")
    print("=" * 60)
    
    # Verify that summary is complete
    expected_keywords = ['developed', 'projects', 'react', 'node.js', 'passionate', 'collaborative']
    missing_keywords = []
    
    for keyword in expected_keywords:
        if keyword.lower() not in result['summary'].lower():
            missing_keywords.append(keyword)
    
    if not missing_keywords:
        print("✅ SUCCESS: Summary captured completely with all expected keywords")
    else:
        print(f"❌ FAILURE: Missing keywords in summary: {missing_keywords}")
    
    # Check if summary is substantial
    if len(result['summary']) > 100:
        print("✅ SUCCESS: Summary is substantial in length")
    else:
        print(f"❌ FAILURE: Summary too short ({len(result['summary'])} characters)")
    
    return result

if __name__ == "__main__":
    test_summary_complete() 