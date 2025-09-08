#!/usr/bin/env python3
"""
Test script for Resume Improvement Service
Tests the integration between ATS analysis and resume improvement
"""

import json
import logging
from services.resume_improvement_service import ResumeImprovementService
from services.ats_service import StandardATSService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_resume_improvement():
    """Test the resume improvement service with sample data"""
    
    # Sample parsed resume data
    sample_parsed_resume = {
        "personal_info": {
            "name": "John Doe",
            "email": "john.doe@email.com",
            "phone": "+1-555-0123",
            "location": "San Francisco, CA"
        },
        "summary": "Experienced software engineer with 5+ years in web development.",
        "experience": [
            {
                "company": "TechCorp",
                "position": "Senior Developer",
                "duration": "2020-Present",
                "description": "Developed web applications using modern technologies."
            }
        ],
        "skills": ["Python", "JavaScript", "React", "Node.js"],
        "education": [
            {
                "degree": "Bachelor of Science in Computer Science",
                "school": "University of Technology",
                "year": "2018-2022"
            }
        ]
    }
    
    # Sample ATS analysis results
    sample_ats_analysis = {
        "overall_score": 75,
        "category_scores": {
            "achievements_impact_metrics": 70,
            "clarity_brevity": 80,
            "formatting_layout_ats": 85,
            "grammar_spelling_quality": 90,
            "header_consistency": 85,
            "keyword_usage_placement": 65,
            "repetition_avoidance": 70,
            "section_organization": 80,
            "skills_match_alignment": 75
        },
        "detailed_feedback": {
            "achievements_impact_metrics": {
                "score": 70,
                "title": "Achievements & Impact Metrics",
                "description": "Analysis of quantified achievements and measurable results",
                "positives": ["Good use of action verbs"],
                "negatives": ["Lack of specific metrics and quantifiable results"],
                "suggestions": ["Add specific numbers and percentages to achievements", "Include measurable outcomes"]
            },
            "keyword_usage_placement": {
                "score": 65,
                "title": "Keyword Usage & Placement",
                "description": "Analysis of keyword presence and placement",
                "positives": ["Good technical keywords present"],
                "negatives": ["Missing some important industry keywords"],
                "suggestions": ["Add more relevant keywords", "Include soft skills keywords"]
            }
        },
        "strengths": ["Strong technical background", "Good experience progression"],
        "weaknesses": ["Lack of quantified achievements", "Missing some keywords"],
        "recommendations": [
            "Add specific metrics to achievements",
            "Include more relevant keywords",
            "Quantify your impact and results"
        ],
        "extracted_text": "John Doe\nSoftware Engineer\njohn.doe@email.com\n+1-555-0123\n\nSUMMARY\nExperienced software engineer with 5+ years in web development.\n\nSKILLS\nPython, JavaScript, React, Node.js\n\nEDUCATION\nBachelor of Science in Computer Science\nUniversity of Technology, 2018-2022\n\nEXPERIENCE\nSenior Developer at TechCorp\n2020-Present\nDeveloped web applications using modern technologies."
    }
    
    try:
        # Initialize services
        logger.info("Initializing Resume Improvement Service...")
        improvement_service = ResumeImprovementService()
        
        # Apply ATS suggestions
        logger.info("Applying ATS suggestions to improve resume...")
        improved_resume = improvement_service.apply_ats_suggestions(
            sample_parsed_resume, 
            sample_ats_analysis
        )
        
        # Generate improvement summary
        improvement_summary = improvement_service.get_improvement_summary(
            sample_parsed_resume, 
            improved_resume
        )
        
        # Display results
        logger.info("✅ Resume improvement completed successfully!")
        logger.info(f"📊 Improvement Summary:")
        logger.info(f"   - Total Changes: {improvement_summary['total_changes']}")
        logger.info(f"   - Fields Improved: {', '.join(improvement_summary['fields_improved'])}")
        logger.info(f"   - Areas Enhanced: {', '.join(improvement_summary['improvement_areas'])}")
        
        # Save results to file
        output_data = {
            "original_resume": sample_parsed_resume,
            "ats_analysis": sample_ats_analysis,
            "improved_resume": improved_resume,
            "improvement_summary": improvement_summary
        }
        
        with open("test_improvement_results.json", "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        logger.info("📁 Results saved to test_improvement_results.json")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Resume Improvement Service...")
    print("=" * 50)
    
    success = test_resume_improvement()
    
    if success:
        print("\n✅ All tests passed! Resume improvement service is working correctly.")
    else:
        print("\n❌ Tests failed. Please check the error messages above.")
