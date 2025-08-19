import json
import logging
from typing import Dict, Any, Optional
from google.generativeai import GenerativeModel
from .gemini_parser_service import GeminiResumeParser

logger = logging.getLogger(__name__)

class AISuggestionService:
    """AI service for generating job descriptions and resume suggestions"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        """
        Initialize the AI Suggestion Service
        
        Args:
            api_key: Gemini API key (if not provided, will use environment variable)
            model_name: Gemini model name (if not provided, will use default)
        """
        self.parser = GeminiResumeParser(api_key=api_key, model_name=model_name)
        self.model = self.parser.model
    
    def generate_job_description(self, sector: str, country: str, designation: str) -> str:
        """
        Generate a job description based on sector, country, and designation
        
        Args:
            sector: Industry sector (e.g., "Technology", "Healthcare", "Finance")
            country: Country for the job (e.g., "USA", "Canada", "UK")
            designation: Job title/role (e.g., "Software Engineer", "Data Analyst")
            
        Returns:
            Generated job description as string
        """
        prompt = f"""
        Generate a comprehensive job description for a {designation} position in the {sector} sector in {country}.
        
        The job description should include:
        1. Job title and company overview
        2. Key responsibilities and duties
        3. Required qualifications and skills
        4. Preferred qualifications
        5. Experience requirements
        6. Education requirements
        7. Key competencies and soft skills
        8. Benefits and work environment (if applicable)
        
        Make it realistic and detailed, suitable for a professional job posting.
        Focus on the specific sector and consider the country's job market standards.
        
        Format the response as a well-structured job description with clear sections.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Failed to generate job description: {str(e)}")
            raise
    
    def compare_resume_with_jd(self, resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        """
        Compare resume with job description and generate improvement suggestions
        
        Args:
            resume_data: Parsed resume data from GeminiResumeParser
            job_description: Job description text
            
        Returns:
            Dictionary containing analysis and suggestions
        """
        # Convert resume data to text format for comparison
        resume_text = self._format_resume_for_comparison(resume_data)
        
        prompt = f"""
        You are an expert resume consultant and career advisor. 
        Compare the following resume with the job description and provide detailed analysis and suggestions.
        
        RESUME DATA:
        {resume_text}
        
        JOB DESCRIPTION:
        {job_description}
        
        Please provide a comprehensive analysis in the following JSON format:
        {{
            "overall_match_score": int,  // Score from 0-100
            "strengths": [
                "List of resume strengths that match the job requirements"
            ],
            "weaknesses": [
                "List of areas where resume falls short of job requirements"
            ],
            "missing_skills": [
                "Skills mentioned in job description but missing from resume"
            ],
            "suggestions": [
                "Specific actionable suggestions to improve the resume"
            ],
            "keyword_analysis": {{
                "matched_keywords": ["keywords from resume that match job description"],
                "missing_keywords": ["important keywords from job description not in resume"]
            }},
            "experience_gap_analysis": {{
                "relevant_experience": "Analysis of how well experience matches job requirements",
                "experience_gaps": "Areas where experience could be enhanced"
            }},
            "improvement_priority": [
                "Ordered list of most important improvements to make"
            ]
        }}
        
        Be specific, actionable, and constructive in your feedback.
        Focus on helping the candidate improve their chances of getting the job.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse the JSON response
            cleaned_response = self.parser._clean_gemini_response(response.text)
            return json.loads(cleaned_response)
        except Exception as e:
            logger.error(f"Failed to compare resume with job description: {str(e)}")
            raise
    
    def _format_resume_for_comparison(self, resume_data: Dict[str, Any]) -> str:
        """
        Format resume data into a readable text format for comparison
        
        Args:
            resume_data: Parsed resume data
            
        Returns:
            Formatted resume text
        """
        formatted_parts = []
        
        # Basic information
        if 'basic_info' in resume_data:
            basic = resume_data['basic_info']
            formatted_parts.append(f"Name: {basic.get('name', 'N/A')}")
            formatted_parts.append(f"Email: {basic.get('email', 'N/A')}")
            formatted_parts.append(f"Phone: {basic.get('phone', 'N/A')}")
            formatted_parts.append(f"Location: {basic.get('location', 'N/A')}")
            formatted_parts.append(f"LinkedIn: {basic.get('linkedin', 'N/A')}")
        
        # Summary
        if 'summary' in resume_data:
            formatted_parts.append(f"\nSummary:\n{resume_data['summary']}")
        
        # Skills
        if 'skills' in resume_data:
            skills = resume_data['skills']
            if isinstance(skills, list):
                formatted_parts.append(f"\nSkills:\n{', '.join(skills)}")
            elif isinstance(skills, dict):
                skill_text = []
                for category, skill_list in skills.items():
                    if isinstance(skill_list, list):
                        skill_text.append(f"{category}: {', '.join(skill_list)}")
                formatted_parts.append(f"\nSkills:\n{'; '.join(skill_text)}")
        
        # Work experience
        if 'work_experience' in resume_data:
            formatted_parts.append("\nWork Experience:")
            for job in resume_data['work_experience']:
                formatted_parts.append(f"\n{job.get('title', 'N/A')} at {job.get('company', 'N/A')}")
                formatted_parts.append(f"Duration: {job.get('duration', 'N/A')}")
                formatted_parts.append(f"Location: {job.get('location', 'N/A')}")
                if 'responsibilities' in job:
                    for resp in job['responsibilities']:
                        formatted_parts.append(f"• {resp}")
        
        # Education
        if 'education' in resume_data:
            formatted_parts.append("\nEducation:")
            for edu in resume_data['education']:
                formatted_parts.append(f"\n{edu.get('degree', 'N/A')} from {edu.get('institution', 'N/A')}")
                formatted_parts.append(f"Duration: {edu.get('duration', 'N/A')}")
                formatted_parts.append(f"GPA: {edu.get('gpa', 'N/A')}")
        
        # Certifications
        if 'certifications' in resume_data:
            formatted_parts.append("\nCertifications:")
            for cert in resume_data['certifications']:
                formatted_parts.append(f"• {cert}")
        
        # Projects
        if 'projects' in resume_data:
            formatted_parts.append("\nProjects:")
            for project in resume_data['projects']:
                formatted_parts.append(f"\n{project.get('title', 'N/A')}")
                formatted_parts.append(f"Description: {project.get('description', 'N/A')}")
                if 'technologies' in project:
                    formatted_parts.append(f"Technologies: {', '.join(project['technologies'])}")
        
        return "\n".join(formatted_parts)
