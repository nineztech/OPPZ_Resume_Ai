#!/usr/bin/env python3
"""
Resume Parser
Standalone script for parsing resume files
"""

import json
import sys
import logging
from services.openai_parser_service import OpenAIResumeParser

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    try:
        # Read file path from command line argument
        if len(sys.argv) < 2:
            raise ValueError("File path required")
        
        file_path = sys.argv[1]
        
        # Initialize parser
        parser = OpenAIResumeParser()
        
        # Parse resume
        parsed_data = parser.parse_resume_from_file(file_path)
        
        # Output result as JSON
        print(json.dumps(parsed_data, ensure_ascii=False))
        
    except Exception as e:
        logger.error(f"Error parsing resume: {str(e)}")
        error_response = {
            "error": str(e),
            "message": "Failed to parse resume"
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
