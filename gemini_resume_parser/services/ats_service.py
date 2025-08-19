import json
import logging
from typing import Dict, Any, Optional, List
from google.generativeai import GenerativeModel
from .gemini_parser_service import GeminiResumeParser

logger = logging.getLogger(__name__)

class ATSService:
    """Base ATS service class"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.parser = GeminiResumeParser(api_key=api_key, model_name=model_name)
        self.model = self.parser.model
    
    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Base method for resume analysis"""
        raise NotImplementedError
    
    def _parse_ats_response(self, response_text: str) -> Dict[str, Any]:
        """Parse ATS response from Gemini"""
        try:
            # Clean response and parse JSON
            cleaned_response = self.parser._clean_gemini_response(response_text)
            return json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse ATS response: {str(e)}")
            raise ValueError("Invalid ATS response format")

class StandardATSService(ATSService):
    """Standard ATS analysis service - general resume optimization"""
    
    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Analyze resume using standard ATS criteria:
        - Quantify impact (numbers/metrics)
        - Summary quality
        - Length & depth
        - Repetition
        - Buzzwords
        - Overall score
        """
        prompt = self._get_standard_ats_prompt(resume_text)
        
        try:
            response = self.model.generate_content(prompt)
            return self._parse_ats_response(response.text)
        except Exception as e:
            logger.error(f"Standard ATS analysis failed: {str(e)}")
            raise
    
    def _get_standard_ats_prompt(self, resume_text: str) -> str:
        return f"""
        You are an expert Applicant Tracking System (ATS) analyzer.  
        Evaluate the following resume against **global ATS best practices** (USA standards) without using any specific job description.  
        Your goal is to score the resume for **ATS compatibility** and provide detailed feedback for each category.

        ### **Evaluation Criteria & Scoring**
        Provide a **score from 0–100** based on the following weighted criteria:

        1. **Formatting & Readability (25%)**
           - Uses ATS-friendly fonts (Arial, Calibri, Times New Roman, etc.)
           - Avoids tables, images, graphics, columns, and text boxes
           - Standard headings (e.g., "Work Experience", "Education", "Skills")
           - PDF or DOCX file support for ATS parsing

        2. **Keyword Coverage (General) (25%)**
           - Includes common professional action verbs (*managed, developed, analyzed, implemented*)
           - Covers both hard skills and soft skills relevant to most industries
           - Balanced keyword usage without keyword stuffing

        3. **Section Completeness (20%)**
           - Contact Information present and ATS-readable (name, email, phone, LinkedIn)
           - Profile/Summary section included
           - Skills section with bullet points
           - Work Experience in reverse chronological order
           - Education section
           - Certifications/Achievements (optional but boosts score)

        4. **Achievements & Metrics (15%)**
           - Uses quantified results (percentages, numbers, revenue, savings, etc.)
           - Action-oriented bullet points

        5. **Spelling, Grammar & Consistency (10%)**
           - No typos, consistent tense, proper punctuation

        6. **Parse Accuracy (5%)**
           - Can be converted to plain text without losing structure

        ---

        ### **Output Format (JSON only)**
        Respond **only** in this JSON format:
        {{
          "overall_score": int,
          "category_scores": {{
            "formatting_readability": int,
            "keyword_coverage_general": int,
            "section_completeness": int,
            "achievements_metrics": int,
            "spelling_grammar": int,
            "parse_accuracy": int
          }},
          "detailed_feedback": {{
            "formatting_readability": {{
              "score": int,
              "title": "Readability",
              "description": "Ensure resume screeners can read key sections of your resume",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "keyword_coverage_general": {{
              "score": int,
              "title": "Keywords & ATS",
              "description": "Include relevant keywords for Applicant Tracking Systems",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "section_completeness": {{
              "score": int,
              "title": "Section Completeness",
              "description": "Ensure all essential resume sections are present and well-structured",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "achievements_metrics": {{
              "score": int,
              "title": "Quantify Impact",
              "description": "Use numbers and metrics to demonstrate your achievements",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "spelling_grammar": {{
              "score": int,
              "title": "Language Quality",
              "description": "Maintain professional language standards throughout your resume",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "parse_accuracy": {{
              "score": int,
              "title": "ATS Parsing",
              "description": "Ensure your resume can be accurately parsed by ATS systems",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }}
          }},
          "extracted_text": "string",
          "strengths": [ "string", "string", ... ],
          "weaknesses": [ "string", "string", ... ],
          "recommendations": [ "string", "string", ... ]
        }}

        Resume text to analyze:
        {resume_text}
        
        Return ONLY the JSON output — no explanations.
        """

class JDSpecificATSService(ATSService):
    """Job Description specific ATS analysis service"""
    
    def analyze_resume_for_jd(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Analyze resume against specific job description for:
        - Keyword match score
        - Skills alignment
        - Experience relevance
        - Overall fit score
        """
        prompt = self._get_jd_specific_prompt(resume_text, job_description)
        
        try:
            response = self.model.generate_content(prompt)
            return self._parse_ats_response(response.text)
        except Exception as e:
            logger.error(f"JD-specific ATS analysis failed: {str(e)}")
            raise
    
    def _get_jd_specific_prompt(self, resume_text: str, job_description: str) -> str:
        return f"""
        You are an expert ATS (Applicant Tracking System) and recruitment AI.  
        Evaluate the following resume **against a specific job description** to determine **job-fit compatibility** and ATS readiness.

        ### **Evaluation Criteria & Scoring**
        Provide a **score from 0–100** based on the following weighted criteria:

        1. **Keyword Match & Skills Alignment (40%)**
           - Match between resume skills and required skills in JD
           - Relevant certifications and tools from JD appear in resume
           - Synonyms and variations of JD keywords are also considered

        2. **Experience Relevance (25%)**
           - Years of experience match JD requirements
           - Industry/domain alignment
           - Role-specific accomplishments

        3. **Education & Certifications (10%)**
           - Matches educational requirements
           - Relevant certifications present

        4. **Achievements & Impact (10%)**
           - Resume shows measurable outcomes related to JD tasks

        5. **ATS-Friendly Formatting & Structure (10%)**
           - Resume is parseable
           - Standard headings used

        6. **Soft Skills Match (5%)**
           - Presence of leadership, communication, teamwork, problem-solving if mentioned in JD

        ---

        ### **Output Format (JSON only)**
        Respond **only** in this JSON format:
        {{
          "overall_score": int,
          "match_percentage": int,
          "missing_keywords": [ "string", "string", ... ],
          "category_scores": {{
            "keyword_match_skills": int,
            "experience_relevance": int,
            "education_certifications": int,
            "achievements_impact": int,
            "formatting_structure": int,
            "soft_skills_match": int
          }},
          "detailed_feedback": {{
            "keyword_match_skills": {{
              "score": int,
              "title": "Keywords & Skills Match",
              "description": "How well your resume matches the required keywords and skills from the job description",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "experience_relevance": {{
              "score": int,
              "title": "Work Experience",
              "description": "Relevance of your work experience to the target role",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "education_certifications": {{
              "score": int,
              "title": "Education",
              "description": "Educational background alignment with job requirements",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "achievements_impact": {{
              "score": int,
              "title": "Quantify Impact",
              "description": "Measurable achievements relevant to the target role",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "formatting_structure": {{
              "score": int,
              "title": "Readability",
              "description": "Resume format and structure for ATS compatibility",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }},
            "soft_skills_match": {{
              "score": int,
              "title": "Soft Skills Alignment",
              "description": "Soft skills alignment with job requirements",
              "positives": [ "string", ... ],
              "negatives": [ "string", ... ],
              "suggestions": [ "string", ... ]
            }}
          }},
          "extracted_text": "string",
          "strengths": [ "string", "string", ... ],
          "weaknesses": [ "string", "string", ... ],
          "recommendations": [ "string", "string", ... ]
        }}

        **Resume Text:**
        {resume_text}
        
        **Job Description:**
        {job_description}
        
        Return ONLY the JSON output — no explanations.
        """
