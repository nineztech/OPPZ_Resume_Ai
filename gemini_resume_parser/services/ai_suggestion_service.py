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
            
            # Try to parse the JSON response
            try:
                parsed_result = json.loads(cleaned_response)
                return parsed_result
            except json.JSONDecodeError as json_error:
                logger.warning(f"Failed to parse Gemini JSON response for job description: {str(json_error)}")
                logger.warning(f"Raw response: {cleaned_response}")
                
                # Return a fallback job description
                return self._create_fallback_job_description(sector, country, designation)
                
        except Exception as e:
            logger.error(f"Failed to generate job description: {str(e)}")
            # Return a fallback job description instead of raising an exception
            return self._create_fallback_job_description(sector, country, designation)
    
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
            
            # Try to parse the JSON response
            try:
                parsed_result = json.loads(cleaned_response)
                return parsed_result
            except json.JSONDecodeError as json_error:
                logger.warning(f"Failed to parse Gemini JSON response: {str(json_error)}")
                logger.warning(f"Raw response: {cleaned_response}")
                
                # Return a fallback response with basic analysis
                return self._create_fallback_response(resume_data, job_description)
                
        except Exception as e:
            logger.error(f"Failed to compare resume with job description: {str(e)}")
            # Return a fallback response instead of raising an exception
            return self._create_fallback_response(resume_data, job_description)
    
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
    
    def _create_fallback_response(self, resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        """
        Create a fallback response when AI processing fails
        
        Args:
            resume_data: Parsed resume data
            job_description: Job description text
            
        Returns:
            Dictionary containing basic analysis and suggestions
        """
        try:
            # Extract basic information from resume
            basic_info = resume_data.get('basic_details', {})
            skills = resume_data.get('skills', [])
            experience = resume_data.get('experience', [])
            
            # Create basic skill list
            skill_list = []
            if isinstance(skills, list):
                skill_list = skills[:10]  # Take first 10 skills
            elif isinstance(skills, dict):
                for category, skill_items in skills.items():
                    if isinstance(skill_items, list):
                        skill_list.extend(skill_items[:5])  # Take first 5 from each category
            
            # Basic analysis based on available data
            has_experience = len(experience) > 0
            has_skills = len(skill_list) > 0
            
            # Calculate a basic score
            base_score = 50  # Start with neutral score
            if has_experience:
                base_score += 20
            if has_skills:
                base_score += 15
            if basic_info.get('professionalTitle') or basic_info.get('title'):
                base_score += 10
                
            return {
                "overallScore": min(base_score, 85),  # Cap at 85 for fallback
                "atsCompatibility": {
                    "score": min(base_score - 5, 80),
                    "strengths": [
                        "Resume contains structured information",
                        "Professional format detected" if has_experience else "Basic information available",
                        "Skills section present" if has_skills else "Contact information available"
                    ],
                    "improvements": [
                        "Consider adding more specific keywords from the job description",
                        "Enhance quantifiable achievements in experience section",
                        "Optimize formatting for ATS compatibility",
                        "Add more relevant technical skills if applicable"
                    ]
                },
                "skillsAnalysis": {
                    "matchingSkills": skill_list[:5] if skill_list else ["General professional skills"],
                    "missingSkills": [
                        "Industry-specific technical skills",
                        "Leadership and management skills",
                        "Communication and collaboration skills",
                        "Problem-solving abilities"
                    ]
                },
                "experienceAnalysis": {
                    "relevantExperience": "Experience section available for review" if has_experience else "Consider adding relevant work experience",
                    "experienceGaps": "Enhance experience descriptions with quantifiable achievements and specific technologies used"
                },
                "suggestions": [
                    "Review the job description carefully and incorporate relevant keywords",
                    "Quantify achievements with specific numbers and percentages",
                    "Highlight technical skills that match the job requirements",
                    "Ensure consistent formatting throughout the resume",
                    "Add a professional summary that aligns with the job role",
                    "Include relevant certifications or training if available"
                ],
                "keywordAnalysis": {
                    "matchedKeywords": skill_list[:3] if skill_list else ["Professional"],
                    "missingKeywords": [
                        "Industry-specific terms",
                        "Technical competencies",
                        "Soft skills mentioned in job description",
                        "Company-specific requirements"
                    ]
                },
                "improvementPriority": [
                    "Incorporate job-specific keywords throughout the resume",
                    "Add quantifiable achievements to work experience",
                    "Enhance technical skills section with relevant technologies",
                    "Optimize resume format for ATS scanning",
                    "Create a compelling professional summary"
                ]
            }
        except Exception as fallback_error:
            logger.error(f"Error creating fallback response: {str(fallback_error)}")
            # Return minimal response if even fallback fails
            return {
                "overallScore": 50,
                "atsCompatibility": {
                    "score": 45,
                    "strengths": ["Resume file successfully processed"],
                    "improvements": ["Review and optimize resume content for the specific job role"]
                },
                "skillsAnalysis": {
                    "matchingSkills": ["General professional skills"],
                    "missingSkills": ["Job-specific skills and technologies"]
                },
                "experienceAnalysis": {
                    "relevantExperience": "Experience information available for review",
                    "experienceGaps": "Consider enhancing experience descriptions"
                },
                "suggestions": [
                    "Review the job description and tailor resume accordingly",
                    "Add specific achievements and quantifiable results",
                    "Include relevant technical skills and certifications"
                ],
                "keywordAnalysis": {
                    "matchedKeywords": ["Professional experience"],
                    "missingKeywords": ["Job-specific keywords and terminology"]
                },
                "improvementPriority": [
                    "Tailor resume content to match job requirements",
                    "Add measurable achievements and results",
                    "Optimize for applicant tracking systems"
                ]
            }
    
    def _create_fallback_job_description(self, sector: str, country: str, designation: str) -> Dict[str, Any]:
        """
        Create a fallback job description when AI generation fails
        
        Args:
            sector: Industry sector
            country: Country for the job
            designation: Job title/role
            
        Returns:
            Dictionary containing basic job description
        """
        try:
            # Create a basic job description structure
            return {
                "jobTitle": f"{designation}",
                "experienceLevel": "Mid level",
                "salaryRange": f"Competitive salary range for {designation} in {country}",
                "jobSummary": f"We are seeking a qualified {designation} to join our {sector} team in {country}. The successful candidate will contribute to our organization's growth and success through their expertise and dedication. This role offers opportunities for professional development and career advancement in a dynamic work environment.",
                "keyResponsibilities": [
                    f"Execute core {designation} responsibilities and tasks",
                    f"Collaborate with team members and stakeholders in {sector} projects",
                    "Contribute to project planning and implementation",
                    "Maintain high standards of quality and professionalism",
                    "Support continuous improvement initiatives and best practices"
                ],
                "requiredSkills": {
                    "technical": [
                        f"Relevant technical skills for {designation}",
                        f"Industry-standard tools and technologies in {sector}"
                    ],
                    "soft": [
                        "Strong communication and interpersonal skills",
                        "Problem-solving and analytical thinking"
                    ],
                    "programming": [
                        "Relevant programming languages for the role",
                        "Software development methodologies"
                    ] if "software" in designation.lower() or "developer" in designation.lower() or "engineer" in designation.lower() else [
                        "Proficiency in relevant software applications",
                        "Technical documentation skills"
                    ],
                    "tools": [
                        f"Industry-standard tools for {designation}",
                        "Project management and collaboration tools"
                    ]
                },
                "educationalRequirements": [
                    f"Bachelor's degree in relevant field for {designation}",
                    "Additional certifications or training preferred"
                ],
                "benefits": [
                    "Competitive salary and benefits package",
                    "Professional development opportunities",
                    "Health insurance and wellness programs",
                    "Flexible work arrangements where applicable"
                ]
            }
        except Exception as fallback_error:
            logger.error(f"Error creating fallback job description: {str(fallback_error)}")
            # Return minimal job description if even fallback fails
            return {
                "jobTitle": designation,
                "experienceLevel": "Entry to Mid level",
                "salaryRange": "Competitive",
                "jobSummary": f"Seeking a {designation} for our {sector} team.",
                "keyResponsibilities": [
                    "Perform assigned duties and responsibilities",
                    "Work collaboratively with team members",
                    "Contribute to organizational goals"
                ],
                "requiredSkills": {
                    "technical": ["Relevant technical skills"],
                    "soft": ["Communication", "Teamwork"],
                    "programming": ["As required for role"],
                    "tools": ["Standard business applications"]
                },
                "educationalRequirements": ["Relevant degree or experience"],
                "benefits": ["Competitive package"]
            }
