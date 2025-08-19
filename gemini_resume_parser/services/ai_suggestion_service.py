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
    
    def generate_job_description(self, sector: str, country: str, designation: str) -> Dict[str, Any]:
        """
        Generate a job description based on sector, country, and designation
        
        Args:
            sector: Industry sector (e.g., "Technology", "Healthcare", "Finance")
            country: Country for the job (e.g., "USA", "Canada", "UK")
            designation: Job title/role (e.g., "Software Engineer", "Data Analyst")
            
        Returns:
            Generated job description as structured dictionary
        """
        prompt = f"""
        Generate a comprehensive job description for a {designation} position in the {sector} sector in {country}.
        
        Please provide the job description in the following JSON format:
        {{
            "jobTitle": "Exact job title",
            "experienceLevel": "Entry/Mid/Senior level",
            "salaryRange": "Typical salary range for this position in {country}",
            "jobSummary": "Comprehensive job summary (2-3 paragraphs)",
            "keyResponsibilities": [
                "Key responsibility 1",
                "Key responsibility 2",
                "Key responsibility 3",
                "Key responsibility 4",
                "Key responsibility 5"
            ],
            "requiredSkills": {{
                "technical": ["Technical skill 1", "Technical skill 2"],
                "soft": ["Soft skill 1", "Soft skill 2"],
                "programming": ["Programming language 1", "Programming language 2"],
                "tools": ["Tool 1", "Tool 2"]
            }},
            "educationalRequirements": [
                "Bachelor's degree in relevant field",
                "Additional certifications preferred"
            ],
            "benefits": [
                "Competitive salary",
                "Health insurance",
                "Professional development"
            ]
        }}
        
        Make it realistic and detailed, suitable for a professional job posting.
        Focus on the specific sector and consider the country's job market standards.
        
        Return ONLY the JSON output — no explanations.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse the JSON response
            cleaned_response = self.parser._clean_gemini_response(response.text)
            return json.loads(cleaned_response)
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
            "overallScore": int,  // Score from 0-100
            "atsCompatibility": {{
                "score": int,  // Score from 0-100
                "strengths": [
                    "List of resume strengths that match the job requirements"
                ],
                "improvements": [
                    "List of areas where resume falls short of job requirements"
                ]
            }},
            "skillsAnalysis": {{
                "matchingSkills": [
                    "Skills from resume that match job requirements"
                ],
                "missingSkills": [
                    "Skills mentioned in job description but missing from resume"
                ]
            }},
            "experienceAnalysis": {{
                "relevantExperience": "Analysis of how well experience matches job requirements",
                "experienceGaps": "Areas where experience could be enhanced"
            }},
            "suggestions": [
                "Specific actionable suggestions to improve the resume"
            ],
            "keywordAnalysis": {{
                "matchedKeywords": ["keywords from resume that match job description"],
                "missingKeywords": ["important keywords from job description not in resume"]
            }},
            "improvementPriority": [
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
        if 'basic_details' in resume_data:
            basic = resume_data['basic_details']
            formatted_parts.append(f"Name: {basic.get('fullName', basic.get('name', 'N/A'))}")
            formatted_parts.append(f"Professional Title: {basic.get('professionalTitle', basic.get('title', 'N/A'))}")
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
        if 'experience' in resume_data:
            formatted_parts.append("\nWork Experience:")
            for job in resume_data['experience']:
                formatted_parts.append(f"\n{job.get('role', job.get('title', 'N/A'))} at {job.get('company', 'N/A')}")
                formatted_parts.append(f"Duration: {job.get('startDate', 'N/A')} - {job.get('endDate', 'N/A')}")
                formatted_parts.append(f"Location: {job.get('location', 'N/A')}")
                if 'description' in job:
                    formatted_parts.append(f"Description: {job.get('description', 'N/A')}")
        
        # Education
        if 'education' in resume_data:
            formatted_parts.append("\nEducation:")
            for edu in resume_data['education']:
                formatted_parts.append(f"\n{edu.get('degree', 'N/A')} from {edu.get('institution', 'N/A')}")
                formatted_parts.append(f"Duration: {edu.get('startDate', 'N/A')} - {edu.get('endDate', 'N/A')}")
                formatted_parts.append(f"Grade: {edu.get('grade', 'N/A')}")
                if 'description' in edu:
                    formatted_parts.append(f"Description: {edu.get('description', 'N/A')}")
        
        # Certifications
        if 'certifications' in resume_data:
            formatted_parts.append("\nCertifications:")
            for cert in resume_data['certifications']:
                if isinstance(cert, dict):
                    formatted_parts.append(f"• {cert.get('certificateName', 'N/A')} from {cert.get('institueName', 'N/A')}")
                else:
                    formatted_parts.append(f"• {cert}")
        
        # Projects
        if 'projects' in resume_data:
            formatted_parts.append("\nProjects:")
            for project in resume_data['projects']:
                formatted_parts.append(f"\n{project.get('name', project.get('title', 'N/A'))}")
                formatted_parts.append(f"Description: {project.get('description', 'N/A')}")
                if 'techStack' in project:
                    formatted_parts.append(f"Tech Stack: {project.get('techStack', 'N/A')}")
        
        return "\n".join(formatted_parts)
