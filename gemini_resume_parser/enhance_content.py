#!/usr/bin/env python3
"""
AI Content Enhancement Service
Enhances specific resume content based on user prompts
"""

import json
import sys
import logging
from services.ai_suggestion_service_optimized import AISuggestionServiceOptimized

logger = logging.getLogger(__name__)

def enhance_content(content, prompt, content_type):
    """
    Enhance resume content using AI based on user prompt
    
    Args:
        content: The original content to enhance
        prompt: User's enhancement prompt
        content_type: Type of content ('experience' or 'project')
        
    Returns:
        Enhanced content
    """
    try:
        # Initialize AI service
        ai_service = AISuggestionServiceOptimized()
        
        # Create enhancement prompt based on content type
        if content_type == 'experience':
            enhancement_prompt = f"""
You are a professional resume writer. Please enhance the following work experience description based on the user's request.

Original work experience description:
{content}

User's enhancement request:
{prompt}

Please provide an improved version that:
1. Maintains the original meaning and context
2. Incorporates the user's specific requests
3. Uses professional, action-oriented language with strong action verbs
4. Includes relevant keywords and quantifiable metrics where appropriate
5. Is concise but impactful
6. Follows best practices for resume writing
7. Highlights achievements and impact
8. **CRITICAL REQUIREMENT**: The enhanced description MUST have exactly 6-7 bullet points. Each point should be a separate sentence ending with a newline character (\\n). If the original has fewer than 6 points, add relevant points to reach 6-7. If it has more than 7 points, consolidate and make it more precise to reach 6-7 points.

Return only the enhanced description without any additional commentary or formatting markers. Each bullet point should be on a separate line ending with \\n.
"""
        else:  # project
            enhancement_prompt = f"""
You are a professional resume writer. Please enhance the following project description based on the user's request.

Original project description:
{content}

User's enhancement request:
{prompt}

Please provide an improved version that:
1. Maintains the original meaning and context
2. Incorporates the user's specific requests
3. Uses professional, technical language appropriate for projects
4. Includes relevant technologies, methodologies, and outcomes
5. Highlights technical skills and problem-solving abilities
6. Is concise but comprehensive
7. Demonstrates impact and results
8. **CRITICAL REQUIREMENT**: The enhanced description MUST have exactly 6-7 bullet points. Each point should be a separate sentence ending with a newline character (\\n). If the original has fewer than 6 points, add relevant points to reach 6-7. If it has more than 7 points, consolidate and make it more precise to reach 6-7 points.

Return only the enhanced description without any additional commentary or formatting markers. Each bullet point should be on a separate line ending with \\n.
"""
        
        # Get enhanced content using the retry mechanism
        enhanced_content = ai_service._generate_with_retry(enhancement_prompt, max_tokens=800)
        
        return enhanced_content.strip()
        
    except Exception as e:
        logger.error(f"Failed to enhance content: {str(e)}")
        raise Exception(f"Failed to enhance content: {str(e)}")

def main():
    try:
        if len(sys.argv) < 2:
            error_result = {"success": False, "error": "Missing arguments"}
            print(json.dumps(error_result))
            sys.exit(1)
        
        # Parse input arguments
        input_data = json.loads(sys.argv[1])
        content = input_data.get('content', '').strip()
        prompt = input_data.get('prompt', '').strip()
        content_type = input_data.get('type', 'experience')
        
        # Validate input
        if not content:
            raise ValueError("Content cannot be empty")
        
        if not prompt:
            raise ValueError("Enhancement prompt cannot be empty")
        
        if content_type not in ['experience', 'project']:
            raise ValueError("Content type must be 'experience' or 'project'")
        
        # Enhance content
        enhanced_content = enhance_content(content, prompt, content_type)
        
        # Return result
        result = {
            "success": True,
            "enhanced_content": enhanced_content,
            "original_content": content,
            "type": content_type,
            "prompt_used": prompt
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "type": "enhancement_error"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
