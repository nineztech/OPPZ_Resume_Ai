#!/usr/bin/env python3
"""
Test script for ATS services
Run this to test both Standard ATS and JD-Specific ATS analysis
"""

import os
import json
from services.ats_service import StandardATSService, JDSpecificATSService

def test_standard_ats():
    """Test Standard ATS analysis"""
    print("🧪 Testing Standard ATS Analysis...")
    
    # Sample resume text for testing
    sample_resume = """
    John Doe
    Software Engineer
    john.doe@email.com
    +1-555-0123
    
    SUMMARY
    Experienced software engineer with 5+ years in web development, specializing in React, Node.js, and cloud technologies. Led development of 3 major applications serving 10,000+ users.
    
    SKILLS
    Programming Languages: JavaScript, Python, Java
    Frameworks: React, Node.js, Express.js, Django
    Databases: MongoDB, PostgreSQL, MySQL
    Cloud: AWS, Docker, Kubernetes
    
    EXPERIENCE
    Senior Developer at TechCorp
    2020-Present
    - Developed web applications using modern technologies
    - Managed team of 8 developers
    - Increased application performance by 40%
    - Implemented CI/CD pipeline reducing deployment time by 60%
    
    Junior Developer at StartupXYZ
    2018-2020
    - Built responsive web interfaces
    - Collaborated with cross-functional teams
    - Contributed to agile development processes
    """
    
    try:
        # Initialize ATS service
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ GEMINI_API_KEY environment variable not set")
            return
        
        ats_service = StandardATSService(api_key=api_key)
        
        # Run analysis
        print("📊 Running Standard ATS analysis...")
        results = ats_service.analyze_resume(sample_resume)
        
        print("✅ Standard ATS analysis completed successfully!")
        print(f"📈 Overall Score: {results.get('overall_score', 'N/A')}")
        
        # Print category scores
        if 'categories' in results:
            print("\n📋 Category Scores:")
            for category, data in results['categories'].items():
                score = data.get('score', 'N/A')
                feedback = data.get('feedback', 'No feedback')
                print(f"  • {category.replace('_', ' ').title()}: {score}/10")
                print(f"    Feedback: {feedback[:100]}...")
        
        # Print top fixes
        if 'top_fixes' in results:
            print(f"\n🔧 Top Fixes ({len(results['top_fixes'])}):")
            for i, fix in enumerate(results['top_fixes'], 1):
                print(f"  {i}. {fix}")
        
        return results
        
    except Exception as e:
        print(f"❌ Standard ATS test failed: {str(e)}")
        return None

def test_jd_specific_ats():
    """Test JD-Specific ATS analysis"""
    print("\n🧪 Testing JD-Specific ATS Analysis...")
    
    # Sample resume text
    sample_resume = """
    Jane Smith
    Full Stack Developer
    jane.smith@email.com
    +1-555-0124
    
    SUMMARY
    Full-stack developer with 3+ years experience in React, Node.js, and cloud technologies. Passionate about building scalable web applications.
    
    SKILLS
    Frontend: React, JavaScript, HTML, CSS, Bootstrap
    Backend: Node.js, Express.js, Python, Django
    Database: MongoDB, PostgreSQL
    DevOps: Git, Docker, AWS
    
    EXPERIENCE
    Full Stack Developer at WebTech
    2021-Present
    - Built responsive web applications using React and Node.js
    - Developed RESTful APIs with Express.js
    - Implemented user authentication and authorization
    - Deployed applications to AWS cloud infrastructure
    
    Junior Developer at CodeStart
    2019-2021
    - Developed frontend components using React
    - Collaborated with backend team on API integration
    - Participated in code reviews and testing
    """
    
    # Sample job description
    sample_job_description = """
    Senior Full Stack Developer
    
    We are looking for a Senior Full Stack Developer to join our growing team. The ideal candidate will have:
    
    Required Skills:
    - 3+ years experience with React and Node.js
    - Strong knowledge of JavaScript/TypeScript
    - Experience with MongoDB or similar NoSQL databases
    - Knowledge of RESTful API development
    - Experience with Git and version control
    
    Preferred Skills:
    - Experience with AWS cloud services
    - Knowledge of Docker and containerization
    - Experience with CI/CD pipelines
    - Understanding of microservices architecture
    - Experience with testing frameworks (Jest, Mocha)
    
    Responsibilities:
    - Develop and maintain web applications
    - Design and implement RESTful APIs
    - Collaborate with cross-functional teams
    - Mentor junior developers
    - Participate in code reviews and testing
    """
    
    try:
        # Initialize ATS service
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ GEMINI_API_KEY environment variable not set")
            return
        
        ats_service = JDSpecificATSService(api_key=api_key)
        
        # Run analysis
        print("📊 Running JD-Specific ATS analysis...")
        results = ats_service.analyze_resume_for_jd(sample_resume, sample_job_description)
        
        print("✅ JD-Specific ATS analysis completed successfully!")
        print(f"📈 Overall Fit Score: {results.get('overall_fit_score', 'N/A')}")
        
        # Print category scores
        if 'categories' in results:
            print("\n📋 Category Scores:")
            for category, data in results['categories'].items():
                score = data.get('score', 'N/A')
                feedback = data.get('feedback', 'No feedback')
                print(f"  • {category.replace('_', ' ').title()}: {score}/10")
                print(f"    Feedback: {feedback[:100]}...")
        
        # Print top improvements
        if 'top_improvements' in results:
            print(f"\n🔧 Top Improvements ({len(results['top_improvements'])}):")
            for i, improvement in enumerate(results['top_improvements'], 1):
                print(f"  {i}. {improvement}")
        
        # Print resume highlights
        if 'resume_highlights' in results:
            print("\n💡 Resume Highlights:")
            if 'strengths' in results['resume_highlights']:
                print("  Strengths:")
                for strength in results['resume_highlights']['strengths']:
                    print(f"    • {strength}")
            
            if 'weaknesses' in results['resume_highlights']:
                print("  Areas for Improvement:")
                for weakness in results['resume_highlights']['weaknesses']:
                    print(f"    • {weakness}")
        
        return results
        
    except Exception as e:
        print(f"❌ JD-Specific ATS test failed: {str(e)}")
        return None

def main():
    """Main test function"""
    print("🚀 Starting ATS Service Tests...")
    print("=" * 50)
    
    # Test Standard ATS
    standard_results = test_standard_ats()
    
    # Test JD-Specific ATS
    jd_results = test_jd_specific_ats()
    
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    
    if standard_results:
        print("✅ Standard ATS: PASSED")
    else:
        print("❌ Standard ATS: FAILED")
    
    if jd_results:
        print("✅ JD-Specific ATS: PASSED")
    else:
        print("❌ JD-Specific ATS: FAILED")
    
    if standard_results and jd_results:
        print("\n🎉 All tests passed! ATS services are working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the error messages above.")
    
    print("\n💡 To run the web UI, use: python web_ui.py")
    print("🌐 Then open: http://localhost:5000")

if __name__ == '__main__':
    main()

