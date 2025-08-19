#!/usr/bin/env python3
"""
AI Job Description Generator
Standalone script for generating job descriptions based on sector, country, and designation
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
            raise ValueError("Parameters required: JSON string with sector, country, designation")
        
        input_data = json.loads(sys.argv[1])
        sector = input_data.get('sector')
        country = input_data.get('country')
        designation = input_data.get('designation')
        
        if not all([sector, country, designation]):
            raise ValueError("All parameters (sector, country, designation) are required")
        
        # Initialize AI service
        ai_service = AISuggestionService()
        
        # Generate job description
        job_description = ai_service.generate_job_description(sector, country, designation)
        
        # Output result as JSON
        print(json.dumps(job_description, ensure_ascii=False))
        
    except Exception as e:
        logger.error(f"Error generating job description: {str(e)}")
        error_response = {
            "error": str(e),
            "message": "Failed to generate job description"
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
