#!/usr/bin/env python3
"""
AI Resume Suggestions
Standalone script for comparing resume with job description and generating suggestions
"""

import json
import sys
import logging
from services.ai_suggestion_service import AISuggestionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    try:
        # Read input from command line argument
        if len(sys.argv) < 2:
            raise ValueError("Parameters required: JSON string with resumeData and jobDescription")
        
        input_data = json.loads(sys.argv[1])
        resume_data = input_data.get('resumeData')
        job_description = input_data.get('jobDescription')
        
        if not resume_data or not job_description:
            raise ValueError("Both resumeData and jobDescription are required")
        
        # Initialize AI service
        ai_service = AISuggestionService()
        
        # Compare resume with job description and get suggestions
        suggestions = ai_service.compare_resume_with_jd(resume_data, job_description)
        
        # Output result as JSON
        print(json.dumps(suggestions, ensure_ascii=False))
        
    except Exception as e:
        logger.error(f"Error generating AI suggestions: {str(e)}")
        error_response = {
            "error": str(e),
            "message": "Failed to generate AI suggestions"
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
