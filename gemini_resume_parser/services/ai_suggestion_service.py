import json
import logging
import datetime
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
    
    def generate_job_description(self, sector: str, country: str, designation: str, experience_level: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a job description based on sector, country, designation, and experience level
        
        Args:
            sector: Industry sector (e.g., "Technology", "Healthcare", "Finance")
            country: Country for the job (e.g., "USA", "Canada", "UK")
            designation: Job title/role (e.g., "Software Engineer", "Data Analyst")
            experience_level: Experience level (e.g., "Entry level", "Mid level", "Senior level")
            
        Returns:
            Generated job description as structured dictionary
        """
        # Use provided experience level or default to Mid level
        target_experience = experience_level or "Mid level"
        
        prompt = f"""
        You are an expert job market analyst and talent acquisition specialist.
        Create the best featured combination Job Description (JD) for a "{designation}" role in the {sector} sector for {country}.
        
        IMPORTANT: This job description should be specifically tailored for {target_experience} candidates.

        Requirements for market realism and consistency:
        - Synthesize common demands from leading job portals in {country}, including LinkedIn Jobs, Indeed, Glassdoor, and Naukri.
        - Reflect expectations typical of Fortune 500 and Fortune 3000 companies operating in {country}.
        - Keep the language professional, ATS-friendly, and specific to the {sector} domain and {country} market norms.
        - Use concise, clear phrasing and avoid marketing fluff.
        - If {country} is USA, prefer US spelling and typical compensation phrasing.
        - Tailor the responsibilities, skills, and requirements to match {target_experience} expectations.

        Output rules:
        - Return ONLY valid JSON matching EXACTLY the schema below. No markdown, no code fences, no explanations, no trailing commas.
        - Use double quotes for all keys and string values.
        - Ensure each array is non-empty and specific to the role and sector.
        - "salaryRange" should be realistic for {country} and {target_experience} level.
        - "experienceLevel" must be exactly "{target_experience}".

        JSON schema to produce:
        {{
            "jobTitle": "Exact job title",
            "experienceLevel": "{target_experience}",
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
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse the JSON response
            cleaned_response = self._clean_gemini_response(response.text)
            
            # Try to parse the JSON response
            try:
                parsed_result = json.loads(cleaned_response)
                return parsed_result
            except json.JSONDecodeError as json_error:
                logger.error(f"Failed to parse Gemini JSON response for job description: {str(json_error)}")
                logger.error(f"Raw response: {cleaned_response}")
                raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
                
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
        Compare the following resume with the job description and provide comprehensive, detailed, and actionable analysis and suggestions.

        Rules:
        - Return ONLY valid JSON. No markdown, no code fences, no explanations, no comments, no trailing commas.
        - Follow the schema exactly. Use integers where numbers are expected. Use ISO 8601 UTC for timestamps.
        - Keep recommendations specific to the job description and resume content.

        RESUME DATA:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        Produce JSON matching EXACTLY this structure:
        {{
            "overallScore": 0,
            "analysisTimestamp": "2024-01-15T10:30:00Z",
            "jobMatchAnalysis": {{
                "alignmentScore": 0,
                "matchingSectors": [""],
                "roleCompatibility": "",
                "experienceLevelMatch": ""
            }},
            "atsCompatibility": {{
                "score": 0,
                "passRate": "",
                "strengths": [""],
                "improvements": [""],
                "keywordDensity": {{
                    "matchedKeywords": 0,
                    "totalRequiredKeywords": 0,
                    "matchPercentage": 0,
                    "criticalMissing": 0
                }},
                "formatOptimization": {{
                    "score": 0,
                    "issues": [""],
                    "recommendations": [""]
                }}
            }},
            "sectionAnalysis": {{
                "contactInformation": {{
                    "score": 0,
                    "status": "",
                    "completeness": 0,
                    "strengths": [""],
                    "improvements": [""],
                    "recommendations": [""],
                    "missingElements": [""]
                }},
                "professionalSummary": {{
                    "score": 0,
                    "status": "",
                    "completeness": 0,
                    "strengths": [""],
                    "improvements": [""],
                    "recommendations": [""],
                    "suggestedRewrite": "",
                    "keywordGaps": [""],
                    "impactScore": 0
                }},
                "skillsSection": {{
                    "score": 0,
                    "status": "",
                    "completeness": 0,
                    "strengths": [""],
                    "improvements": [""],
                    "recommendations": [""],
                    "missingCriticalSkills": [""],
                    "skillGapAnalysis": {{
                        "technical": {{
                            "score": 0,
                            "gaps": [""],
                            "recommendations": ""
                        }},
                        "soft": {{
                            "score": 0,
                            "gaps": [""],
                            "recommendations": ""
                        }},
                        "leadership": {{
                            "score": 0,
                            "gaps": [""],
                            "recommendations": ""
                        }}
                    }},
                    "skillPrioritization": {{
                        "critical": [""],
                        "important": [""],
                        "niceToHave": [""]
                    }}
                }},
                "workExperience": {{
                    "score": 0,
                    "status": "",
                    "completeness": 0,
                    "strengths": [""],
                    "improvements": [""],
                    "recommendations": [""],
                    "experienceRelevance": {{
                        "highlyRelevant": 0,
                        "moderatelyRelevant": 0,
                        "lessRelevant": 0,
                        "totalPositions": 0
                    }},
                    "achievementAnalysis": {{
                        "quantified": 0,
                        "qualitative": 0,
                        "recommendation": "",
                        "impactScore": 0
                    }},
                    "careerProgression": {{
                        "score": 0,
                        "trend": "",
                        "gaps": "",
                        "recommendations": ""
                    }}
                }},
                "educationSection": {{
                    "score": 0,
                    "status": "",
                    "completeness": 0,
                    "strengths": [""],
                    "improvements": [""],
                    "recommendations": [""],
                    "relevanceScore": 0,
                    "additionalSuggestions": [""]
                }},
                "certifications": {{
                    "score": 0,
                    "status": "",
                    "completeness": 0,
                    "strengths": [""],
                    "improvements": [""],
                    "recommendations": [""],
                    "suggestedCertifications": [""],
                    "priorityLevel": ""
                }},
                "projects": {{
                    "score": 0,
                    "status": "",
                    "completeness": 0,
                    "strengths": [""],
                    "improvements": [""],
                    "recommendations": [""],
                    "technicalDepth": 0,
                    "businessImpact": 0
                }}
            }},
            "keywordAnalysis": {{
                "overallDensity": 0,
                "matchedKeywords": [""],
                "missingKeywords": [""],
                "keywordImportance": {{
                    "critical": [""],
                    "important": [""],
                    "niceToHave": [""]
                }},
                "keywordPlacement": {{
                    "summary": {{
                        "count": 0,
                        "density": "",
                        "recommendations": ""
                    }},
                    "skills": {{
                        "count": 0,
                        "density": "",
                        "recommendations": ""
                    }},
                    "experience": {{
                        "count": 0,
                        "density": "",
                        "recommendations": ""
                    }}
                }},
                "semanticAnalysis": {{
                    "contextualRelevance": 0,
                    "naturalIntegration": 0,
                    "recommendations": ""
                }}
            }},
            "improvementPriority": [
                {{
                    "priority": 0,
                    "section": "",
                    "action": "",
                    "estimatedImpact": "",
                    "timeToComplete": "",
                    "difficultyLevel": "",
                    "expectedScoreIncrease": 0
                }}
            ],
            "competitiveAnalysis": {{
                "marketPosition": "",
                "percentileRanking": 0,
                "strengthsVsCompetition": [""],
                "areasToOutperform": [""],
                "competitiveAdvantage": [""],
                "marketDemandAlignment": 0
            }},
            "resumeStrengths": {{
                "topStrengths": [""],
                "uniqueSellingPoints": [""],
                "standoutQualities": [""]
            }},
            "resumeWeaknesses": {{
                "criticalIssues": [""],
                "minorIssues": [""],
                "riskFactors": [""]
            }},
            "actionPlan": {{
                "immediateActions": [""],
                "shortTermGoals": [""],
                "longTermGoals": [""]
            }},
            "industryBenchmarks": {{
                "averageScore": 0,
                "topPerformerScore": 0,
                "yourPosition": "",
                "improvementPotential": "",
                "targetScore": 0
            }},
            "recommendedResources": {{
                "skillDevelopment": [""],
                "resumeTools": [""],
                "careerAdvancement": [""]
            }}
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse the JSON response
            cleaned_response = self._clean_gemini_response(response.text)
            
            # Try to parse the JSON response
            try:
                parsed_result = json.loads(cleaned_response)
                return parsed_result
            except json.JSONDecodeError as json_error:
                logger.error(f"Failed to parse Gemini JSON response: {str(json_error)}")
                logger.error(f"Raw response: {cleaned_response}")
                raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
                
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
    
    def _analyze_experience_level(self, resume_data: Dict[str, Any]) -> str:
        """
        Analyze resume data to determine experience level
        
        Args:
            resume_data: Parsed resume data
            
        Returns:
            Experience level string: "Entry level", "Mid level", or "Senior level"
        """
        try:
            experience = resume_data.get('experience', [])
            
            if not experience:
                return "Entry level"
            
            # Calculate total years of experience
            total_years = 0
            current_year = datetime.datetime.now().year
            
            for exp in experience:
                start_date = exp.get('startDate', '')
                end_date = exp.get('endDate', '')
                
                # Try to extract years from date strings
                start_year = None
                end_year = current_year  # Default to current year if end date is missing or "Present"
                
                # Extract start year
                if start_date:
                    # Handle various date formats
                    import re
                    year_match = re.search(r'(\d{4})', str(start_date))
                    if year_match:
                        start_year = int(year_match.group(1))
                
                # Extract end year
                if end_date and end_date.lower() not in ['present', 'current', '']:
                    year_match = re.search(r'(\d{4})', str(end_date))
                    if year_match:
                        end_year = int(year_match.group(1))
                
                # Calculate years for this experience
                if start_year:
                    years_in_role = max(0, end_year - start_year)
                    # Cap individual role years at 10 to handle data inconsistencies
                    years_in_role = min(years_in_role, 10)
                    total_years += years_in_role
            
            # Determine experience level based on total years
            if total_years <= 2:
                return "Entry level"
            elif total_years <= 4:
                return "Mid level" 
            else:
                return "Senior level"
                
        except Exception as e:
            logger.warning(f"Error analyzing experience level: {str(e)}")
            # Default to Mid level if analysis fails
            return "Mid level"
    
    def _clean_gemini_response(self, response_text: str) -> str:
        """
        Clean the response text from Gemini API and extract JSON
        
        Args:
            response_text: Raw response text
            
        Returns:
            Cleaned JSON string
        """
        import re
        
        # Remove markdown formatting if present
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "")
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "")
        
        # Clean up the text
        response_text = response_text.strip()
        
        # Try to extract JSON using regex patterns
        # Pattern 1: Look for JSON content between code blocks
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, response_text, re.DOTALL)
        
        if match:
            return match.group(1).strip()
        
        # Pattern 2: Look for JSON object starting with { and ending with }
        json_pattern = r'(\{.*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        
        if match:
            return match.group(1).strip()
        
        # Pattern 3: If response starts and ends with braces, it's likely JSON
        if response_text.startswith('{') and response_text.endswith('}'):
            return response_text
            
        # If no JSON patterns found, return the cleaned text as-is
        return response_text
    
