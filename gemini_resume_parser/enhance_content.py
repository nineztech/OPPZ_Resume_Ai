#!/usr/bin/env python3
"""
Content Enhancement Script
Enhances experience or project descriptions based on user prompts
"""

import sys
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the services directory to the Python path
current_dir = Path(__file__).parent
services_dir = current_dir / 'services'
sys.path.insert(0, str(services_dir))

from content_enhancement_service import ContentEnhancementService

def main():
    """Main function to enhance content based on command line arguments"""
    try:
        # Get the JSON data from command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({
                "success": False,
                "error": "No data provided"
            }))
            sys.exit(1)
        
        # Parse the input data
        input_data = json.loads(sys.argv[1])
        
        # Validate required fields
        required_fields = ['content_type', 'content_data', 'enhancement_prompt']
        for field in required_fields:
            if field not in input_data:
                print(json.dumps({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }))
                sys.exit(1)
        
        content_type = input_data['content_type']
        content_data = input_data['content_data']
        enhancement_prompt = input_data['enhancement_prompt']
        
        # Validate content type
        if content_type not in ['experience', 'project']:
            print(json.dumps({
                "success": False,
                "error": "content_type must be 'experience' or 'project'"
            }))
            sys.exit(1)
        
        # Extract description from content_data
        description = content_data.get('description', '')
        if not description.strip():
            print(json.dumps({
                "success": False,
                "error": "Description is required in content_data"
            }))
            sys.exit(1)
        
        # Initialize enhancement service
        enhancement_service = ContentEnhancementService()
        
        # Use the simplified enhance_description method
        enhanced_result = enhancement_service.enhance_description(description, enhancement_prompt, content_type)
        
        # Return the enhanced content
        print(json.dumps({
            "success": True,
            "data": enhanced_result,
            "content_type": content_type
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
