"""
Content Enhancement Service for Experience and Project Descriptions
Enhances specific content based on user prompts using AI
"""
import json
import logging
import datetime
import sys
from typing import Dict, Any, Optional
from openai import OpenAI
import os

logger = logging.getLogger(__name__)


class ContentEnhancementService:
    """
    Service for enhancing experience and project descriptions based on user prompts
    
    This service takes existing content and a user prompt to generate
    enhanced versions of experience or project descriptions.
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-4o-mini", temperature: float = 0.3, top_p: float = 0.8):
        """
        Initialize the Content Enhancement Service
        
        Args:
            api_key: OpenAI API key (if not provided, will use environment variable)
            model_name: OpenAI model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model_name = model_name
        self.temperature = temperature
        self.top_p = top_p
        
        logger.info(f"Content Enhancement Service initialized with model: {model_name}")
    
    def enhance_description(self, description: str, enhancement_prompt: str, content_type: str = "experience") -> Dict[str, Any]:
        """
        Enhance a description based on user prompt
        
        Args:
            description: The original description text to enhance
            enhancement_prompt: User's prompt for enhancement
            content_type: Type of content ("experience" or "project")
            
        Returns:
            Dictionary containing original content, enhanced content, and prompt used
        """
        try:
            logger.info(f"Enhancing {content_type} description")
            logger.info(f"Original description length: {len(description)} characters")
            logger.info(f"Enhancement prompt: {enhancement_prompt}")
            
            # Create enhancement prompt based on content type
            if content_type == "experience":
                enhancement_system_prompt = """You are an expert resume writer and career coach. Your task is to enhance work experience descriptions based on user prompts while maintaining professionalism and accuracy.

Guidelines:
1. Keep the enhanced description factual and truthful
2. Use action verbs and quantify achievements where possible
3. Make the description more compelling and ATS-friendly
4. Maintain the original meaning while improving clarity and impact
5. Use industry-standard terminology
6. Keep descriptions concise but impactful
7. Focus on results and achievements rather than just responsibilities
8. Format each statement on a new line - start each new statement with a line break

Return only the enhanced description text with each statement on a new line, nothing else."""
            else:  # project
                enhancement_system_prompt = """You are an expert resume writer and career coach. Your task is to enhance project descriptions based on user prompts while maintaining professionalism and accuracy.

Guidelines:
1. Keep the enhanced description factual and truthful
2. Highlight technical skills, methodologies, and tools used
3. Quantify results and impact where possible
4. Make the description more compelling and ATS-friendly
5. Use industry-standard terminology
6. Keep descriptions concise but impactful
7. Focus on technical achievements and problem-solving
8. Include relevant technologies and frameworks
9. Format each statement on a new line - start each new statement with a line break

Return only the enhanced description text with each statement on a new line, nothing else."""

            user_prompt = f"""
Current Description:
{description}

Enhancement Request:
{enhancement_prompt}

Please enhance the description based on the user's request while following the guidelines above.
"""

            # Generate enhanced description
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": enhancement_system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                top_p=self.top_p,
                max_tokens=1000
            )
            
            enhanced_description = response.choices[0].message.content.strip()
            
            # Return simplified response
            result = {
                "original_content": description,
                "enhanced_content": enhanced_description,
                "prompt_used": enhancement_prompt
            }
            
            logger.info("Successfully enhanced description")
            logger.info(f"Enhanced description length: {len(enhanced_description)} characters")
            return result
            
        except Exception as e:
            logger.error(f"Error enhancing description: {str(e)}")
            raise Exception(f"Failed to enhance description: {str(e)}")

    def enhance_experience_description(self, experience_data: Dict[str, Any], enhancement_prompt: str) -> Dict[str, Any]:
        """
        Enhance an experience description based on user prompt (legacy method)
        
        Args:
            experience_data: Dictionary containing experience information
            enhancement_prompt: User's prompt for enhancement
            
        Returns:
            Dictionary containing enhanced experience data
        """
        description = experience_data.get('description', '')
        result = self.enhance_description(description, enhancement_prompt, "experience")
        
        # Create enhanced experience data for backward compatibility
        enhanced_experience = experience_data.copy()
        enhanced_experience['description'] = result['enhanced_content']
        enhanced_experience['_enhancement_info'] = {
            'original_description': result['original_content'],
            'enhancement_prompt': result['prompt_used'],
            'enhanced_at': datetime.datetime.now().isoformat(),
            'model_used': self.model_name
        }
        
        return enhanced_experience
    
    def enhance_project_description(self, project_data: Dict[str, Any], enhancement_prompt: str) -> Dict[str, Any]:
        """
        Enhance a project description based on user prompt (legacy method)
        
        Args:
            project_data: Dictionary containing project information
            enhancement_prompt: User's prompt for enhancement
            
        Returns:
            Dictionary containing enhanced project data
        """
        description = project_data.get('description', '')
        result = self.enhance_description(description, enhancement_prompt, "project")
        
        # Create enhanced project data for backward compatibility
        enhanced_project = project_data.copy()
        enhanced_project['description'] = result['enhanced_content']
        enhanced_project['_enhancement_info'] = {
            'original_description': result['original_content'],
            'enhancement_prompt': result['prompt_used'],
            'enhanced_at': datetime.datetime.now().isoformat(),
            'model_used': self.model_name
        }
        
        return enhanced_project
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model configuration
        
        Returns:
            Dictionary containing model information
        """
        return {
            'model_name': self.model_name,
            'temperature': self.temperature,
            'top_p': self.top_p,
            'api_key_configured': bool(self.api_key)
        }
