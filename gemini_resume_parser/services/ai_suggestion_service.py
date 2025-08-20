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
        You are an expert job market analyst and talent acquisition specialist.
        Create the best featured combination Job Description (JD) for a "{designation}" role in the {sector} sector for {country}.

        Requirements for market realism and consistency:
        - Synthesize common demands from leading job portals in {country}, including LinkedIn Jobs, Indeed, Glassdoor, and Naukri.
        - Reflect expectations typical of Fortune 500 and Fortune 3000 companies operating in {country}.
        - Keep the language professional, ATS-friendly, and specific to the {sector} domain and {country} market norms.
        - Use concise, clear phrasing and avoid marketing fluff.
        - If {country} is USA, prefer US spelling and typical compensation phrasing.

        Output rules:
        - Return ONLY valid JSON matching EXACTLY the schema below. No markdown, no code fences, no explanations, no trailing commas.
        - Use double quotes for all keys and string values.
        - Ensure each array is non-empty and specific to the role and sector.
        - "salaryRange" should be realistic for {country} and the expected experience level.

        JSON schema to produce:
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
                "analysisTimestamp": datetime.datetime.now().isoformat() + "Z",
                "jobMatchAnalysis": {
                    "alignmentScore": min(base_score - 5, 80),
                    "matchingSectors": ["General"],
                    "roleCompatibility": "Medium",
                    "experienceLevelMatch": "Experience level appears appropriate for the role"
                },
                "atsCompatibility": {
                    "score": min(base_score - 5, 80),
                    "passRate": "Medium",
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
                    ],
                    "keywordDensity": {
                        "matchedKeywords": len(skill_list[:10]) if skill_list else 3,
                        "totalRequiredKeywords": 20,
                        "matchPercentage": min(int(len(skill_list[:10]) / 20 * 100), 60) if skill_list else 15,
                        "criticalMissing": 5
                    },
                    "formatOptimization": {
                        "score": 75,
                        "issues": ["Standard formatting recommendations apply"],
                        "recommendations": ["Use standard section headings", "Maintain consistent formatting"]
                    }
                },
                "sectionAnalysis": {
                    "contactInformation": {
                        "score": 90,
                        "status": "Good",
                        "completeness": 85,
                        "strengths": ["Basic contact information present"],
                        "improvements": ["Consider adding portfolio or professional website"],
                        "recommendations": ["Ensure all contact information is current and professional"],
                        "missingElements": ["Portfolio URL", "Professional website"]
                    },
                    "professionalSummary": {
                        "score": 60,
                        "status": "Needs Enhancement",
                        "completeness": 50,
                        "strengths": ["Professional summary section identified"],
                        "improvements": ["Add quantifiable achievements", "Align with job requirements"],
                        "recommendations": ["Create compelling summary with specific metrics", "Include relevant keywords"],
                        "suggestedRewrite": "Consider rewriting to highlight key achievements and align with target role",
                        "keywordGaps": ["Industry-specific terms", "Technical skills"],
                        "impactScore": 45
                    },
                    "skillsSection": {
                        "score": 70 if has_skills else 40,
                        "status": "Basic Coverage" if has_skills else "Needs Development",
                        "completeness": 60 if has_skills else 30,
                        "strengths": ["Skills section present"] if has_skills else ["Potential for skills section"],
                        "improvements": ["Add missing job-relevant skills", "Organize by relevance"],
                        "recommendations": ["Include both technical and soft skills", "Add proficiency levels"],
                        "missingCriticalSkills": ["Industry-specific technical skills", "Leadership skills"],
                        "skillGapAnalysis": {
                            "technical": {
                                "score": 55 if has_skills else 30,
                                "gaps": ["Modern technical skills", "Industry-specific tools"],
                                "recommendations": "Focus on adding relevant technical competencies"
                            },
                            "soft": {
                                "score": 45,
                                "gaps": ["Leadership", "Communication", "Problem-solving"],
                                "recommendations": "Emphasize soft skills relevant to the role"
                            },
                            "leadership": {
                                "score": 35,
                                "gaps": ["Team management", "Project leadership"],
                                "recommendations": "Highlight any leadership experience or potential"
                            }
                        },
                        "skillPrioritization": {
                            "critical": skill_list[:3] if skill_list else ["Communication", "Problem-solving"],
                            "important": skill_list[3:6] if len(skill_list) > 3 else ["Teamwork", "Adaptability"],
                            "niceToHave": skill_list[6:] if len(skill_list) > 6 else ["Additional technical skills"]
                        }
                    },
                    "workExperience": {
                        "score": 75 if has_experience else 30,
                        "status": "Good Foundation" if has_experience else "Needs Development",
                        "completeness": 70 if has_experience else 20,
                        "strengths": ["Work experience present"] if has_experience else ["Opportunity to add experience"],
                        "improvements": ["Add quantifiable achievements", "Include specific technologies used"],
                        "recommendations": ["Use action verbs", "Focus on results and impact"],
                        "experienceRelevance": {
                            "highlyRelevant": len(experience) if has_experience else 0,
                            "moderatelyRelevant": 0,
                            "lessRelevant": 0,
                            "totalPositions": len(experience) if has_experience else 0
                        },
                        "achievementAnalysis": {
                            "quantified": 1 if has_experience else 0,
                            "qualitative": len(experience) * 2 if has_experience else 0,
                            "recommendation": "Add specific metrics and quantifiable results",
                            "impactScore": 50 if has_experience else 20
                        },
                        "careerProgression": {
                            "score": 70 if has_experience else 40,
                            "trend": "Positive" if has_experience else "Neutral",
                            "gaps": "None identified" if has_experience else "Consider adding relevant experience",
                            "recommendations": "Continue building relevant experience"
                        }
                    },
                    "educationSection": {
                        "score": 80,
                        "status": "Good",
                        "completeness": 85,
                        "strengths": ["Educational background present"],
                        "improvements": ["Consider adding relevant coursework"],
                        "recommendations": ["Highlight relevant academic achievements"],
                        "relevanceScore": 75,
                        "additionalSuggestions": ["Add certifications if applicable"]
                    },
                    "certifications": {
                        "score": 50,
                        "status": "Basic",
                        "completeness": 40,
                        "strengths": ["Opportunity for professional development"],
                        "improvements": ["Add relevant industry certifications"],
                        "recommendations": ["Pursue certifications aligned with career goals"],
                        "suggestedCertifications": ["Industry-standard certifications", "Professional development courses"],
                        "priorityLevel": "Medium"
                    },
                    "projects": {
                        "score": 60,
                        "status": "Moderate",
                        "completeness": 50,
                        "strengths": ["Potential for project showcase"],
                        "improvements": ["Add relevant project examples"],
                        "recommendations": ["Include technical projects with outcomes"],
                        "technicalDepth": 45,
                        "businessImpact": 40
                    }
                },
                "keywordAnalysis": {
                    "overallDensity": 60,
                    "matchedKeywords": skill_list[:8] if skill_list else ["Professional", "Experience"],
                    "missingKeywords": [
                        "Industry-specific terms",
                        "Technical competencies",
                        "Soft skills mentioned in job description",
                        "Company-specific requirements"
                    ],
                    "keywordImportance": {
                        "critical": skill_list[:3] if skill_list else ["Communication", "Problem-solving"],
                        "important": skill_list[3:6] if len(skill_list) > 3 else ["Teamwork", "Leadership"],
                        "niceToHave": skill_list[6:] if len(skill_list) > 6 else ["Additional skills"]
                    },
                    "keywordPlacement": {
                        "summary": {
                            "count": 2,
                            "density": "Low",
                            "recommendations": "Add more keywords to professional summary"
                        },
                        "skills": {
                            "count": len(skill_list) if skill_list else 3,
                            "density": "Medium" if skill_list else "Low",
                            "recommendations": "Well distributed" if skill_list else "Add more relevant skills"
                        },
                        "experience": {
                            "count": 4 if has_experience else 1,
                            "density": "Medium" if has_experience else "Low",
                            "recommendations": "Integrate more technical terms naturally"
                        }
                    },
                    "semanticAnalysis": {
                        "contextualRelevance": 65,
                        "naturalIntegration": 60,
                        "recommendations": "Improve natural keyword integration throughout resume"
                    }
                },
                "improvementPriority": [
                    {
                        "priority": 1,
                        "section": "Professional Summary",
                        "action": "Create compelling summary with quantifiable achievements",
                        "estimatedImpact": "High",
                        "timeToComplete": "30 minutes",
                        "difficultyLevel": "Medium",
                        "expectedScoreIncrease": 15
                    },
                    {
                        "priority": 2,
                        "section": "Skills Section",
                        "action": "Add job-relevant skills and organize by importance",
                        "estimatedImpact": "High",
                        "timeToComplete": "20 minutes",
                        "difficultyLevel": "Easy",
                        "expectedScoreIncrease": 12
                    },
                    {
                        "priority": 3,
                        "section": "Work Experience",
                        "action": "Add quantifiable metrics to job descriptions",
                        "estimatedImpact": "Medium",
                        "timeToComplete": "45 minutes",
                        "difficultyLevel": "Medium",
                        "expectedScoreIncrease": 10
                    }
                ],
                "competitiveAnalysis": {
                    "marketPosition": "Average",
                    "percentileRanking": 50,
                    "strengthsVsCompetition": [
                        "Basic professional structure",
                        "Relevant background" if has_experience else "Educational foundation"
                    ],
                    "areasToOutperform": [
                        "Quantifiable achievements",
                        "Industry-specific skills",
                        "Professional presentation"
                    ],
                    "competitiveAdvantage": ["Potential for growth and development"],
                    "marketDemandAlignment": 60
                },
                "resumeStrengths": {
                    "topStrengths": [
                        "Professional structure and format",
                        "Basic information clearly presented",
                        "Educational background" if not has_experience else "Work experience present"
                    ],
                    "uniqueSellingPoints": ["Opportunity for targeted customization"],
                    "standoutQualities": ["Professional presentation"]
                },
                "resumeWeaknesses": {
                    "criticalIssues": [
                        "Lack of quantifiable achievements",
                        "Missing job-specific keywords",
                        "Generic professional summary"
                    ],
                    "minorIssues": [
                        "Could improve section organization",
                        "Missing some modern formatting elements"
                    ],
                    "riskFactors": [
                        "May not stand out among other candidates",
                        "Limited keyword optimization for ATS systems"
                    ]
                },
                "actionPlan": {
                    "immediateActions": [
                        "Review job description and incorporate relevant keywords",
                        "Quantify at least 3 major achievements",
                        "Create compelling professional summary",
                        "Organize skills by relevance to job"
                    ],
                    "shortTermGoals": [
                        "Gather metrics from current/previous roles",
                        "Research industry-specific keywords",
                        "Optimize resume format for ATS systems",
                        "Add relevant certifications or training"
                    ],
                    "longTermGoals": [
                        "Build portfolio of relevant projects",
                        "Pursue industry certifications",
                        "Develop leadership experience",
                        "Create strong online professional presence"
                    ]
                },
                "industryBenchmarks": {
                    "averageScore": 65,
                    "topPerformerScore": 90,
                    "yourPosition": "Below Average",
                    "improvementPotential": "High",
                    "targetScore": 80
                },
                "recommendedResources": {
                    "skillDevelopment": [
                        "Industry-specific online courses",
                        "Professional certification programs",
                        "Skill assessment and development platforms"
                    ],
                    "resumeTools": [
                        "ATS-friendly resume templates",
                        "Keyword optimization tools",
                        "Achievement quantification frameworks"
                    ],
                    "careerAdvancement": [
                        "Professional networking events",
                        "Industry mentorship programs",
                        "Career development workshops"
                    ]
                }
            }
        except Exception as fallback_error:
            logger.error(f"Error creating fallback response: {str(fallback_error)}")
            # Return minimal response if even fallback fails
            return {
                "overallScore": 50,
                "analysisTimestamp": datetime.datetime.now().isoformat() + "Z",
                "atsCompatibility": {
                    "score": 45,
                    "passRate": "Low",
                    "strengths": ["Resume file successfully processed"],
                    "improvements": ["Review and optimize resume content for the specific job role"]
                },
                "sectionAnalysis": {
                    "contactInformation": {
                        "score": 70,
                        "status": "Basic",
                        "completeness": 60,
                        "strengths": ["Contact information available"],
                        "improvements": ["Optimize contact presentation"],
                        "recommendations": ["Ensure professional contact details"]
                    }
                },
                "keywordAnalysis": {
                    "overallDensity": 30,
                    "matchedKeywords": ["General professional skills"],
                    "missingKeywords": ["Job-specific skills and technologies"]
                },
                "improvementPriority": [
                    {
                        "priority": 1,
                        "section": "Overall Resume",
                        "action": "Review and optimize resume content for the specific job role",
                        "estimatedImpact": "High",
                        "timeToComplete": "2 hours",
                        "difficultyLevel": "Medium",
                        "expectedScoreIncrease": 20
                    }
                ],
                "actionPlan": {
                    "immediateActions": [
                        "Review the job description and tailor resume accordingly",
                        "Add specific achievements and quantifiable results",
                        "Include relevant technical skills and certifications"
                    ],
                    "shortTermGoals": [
                        "Optimize resume for applicant tracking systems",
                        "Enhance professional presentation"
                    ],
                    "longTermGoals": [
                        "Build relevant experience and skills portfolio"
                    ]
                }
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