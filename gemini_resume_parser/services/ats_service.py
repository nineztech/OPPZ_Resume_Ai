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
You are an **Applicant Tracking System (ATS) evaluation engine**.  
Your task is to **strictly evaluate resumes against ATS best practices (USA/global standards)**.  
Do NOT evaluate against any specific job description.  

---
### **Critical ATS Requirements to Check**
1. **Name Completeness**: Resume MUST have both first name AND last name clearly visible
   - If only first name is present → Flag as critical issue
   - If only last name is present → Flag as critical issue  
   - If neither is clearly identifiable → Flag as critical issue
   - Check for common name patterns: "John Smith", "J. Smith", "John S.", etc.

2. **Contact Information**: Must have at least email OR phone number
   - If both missing → Flag as critical issue
   - If only one present → Flag as medium issue

---
### **Scoring Rules**
- Provide a **score between 0–100**.  
- Use the following **weight distribution** (must total 100):  
  1. Formatting & Readability – 20  
  2. Keyword Coverage (General) – 20  
  3. Section Completeness – 25  
  4. Achievements & Metrics – 15  
  5. Spelling, Grammar & Consistency – 10  
  6. Parse Accuracy – 10  
- **Deduct 15-20 points** if name completeness issues are found
- **Deduct 10-15 points** if contact information is incomplete
- Ensure **category scores add up proportionally** to the overall score.

---
### **Output Rules**
- Respond in **valid JSON only**.  
- No text outside JSON.  
- Always include `"overall_score"`, `"category_scores"`, `"detailed_feedback"`, `"extracted_text"`, `"strengths"`, `"weaknesses"`, and `"recommendations"`.  
- Each section must have **positives**, **negatives**, and **suggestions** (non-empty arrays).  
- Be concise but detailed in feedback (no vague answers).  
- **SPECIFICALLY check and mention name completeness issues** in weaknesses and recommendations.

---
### **Output JSON Format**
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
      "positives": ["string"],
      "negatives": ["string"],
      "suggestions": ["string"]
    }},
    "keyword_coverage_general": {{
      "score": int,
      "title": "Keywords & ATS",
      "description": "Include relevant keywords for Applicant Tracking Systems",
      "positives": ["string"],
      "negatives": ["string"],
      "suggestions": ["string"]
    }},
    "section_completeness": {{
      "score": int,
      "title": "Section Completeness",
      "description": "Ensure all essential resume sections are present and well-structured",
      "positives": ["string"],
      "negatives": ["string"],
      "suggestions": ["string"]
    }},
    "achievements_metrics": {{
      "score": int,
      "title": "Quantify Impact",
      "description": "Use numbers and metrics to demonstrate your achievements",
      "positives": ["string"],
      "negatives": ["string"],
      "suggestions": ["string"]
    }},
    "spelling_grammar": {{
      "score": int,
      "title": "Language Quality",
      "description": "Maintain professional language standards throughout your resume",
      "positives": ["string"],
      "negatives": ["string"],
      "suggestions": ["string"]
    }},
    "parse_accuracy": {{
      "score": int,
      "title": "ATS Parsing",
      "description": "Ensure your resume can be accurately parsed by ATS systems",
      "positives": ["string"],
      "negatives": ["string"],
      "suggestions": ["string"]
    }}
  }},
  "extracted_text": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"]
}}

---
### Resume Text:
{resume_text}

**CRITICAL NAME VALIDATION CHECKLIST**:
1. **First Name Detection**: Look for common first names (John, Jane, Michael, Sarah, David, Emma, James, Olivia, Robert, Ava, William, Isabella, etc.)
2. **Last Name Detection**: Look for common last names (Smith, Johnson, Williams, Brown, Jones, Garcia, Miller, Davis, etc.)
3. **Name Pattern Analysis**: Check for formats like "John Smith", "J. Smith", "John S.", "Smith, John", "JOHN SMITH"
4. **Contact Validation**: Verify email (contains @ symbol) and phone (contains digits)

**MANDATORY WEAKNESSES TO ADD** (if found):
- If NO first name found: "Critical: First name is missing from resume - ATS systems require complete identification for candidate tracking and database management"
- If NO last name found: "Critical: Last name is missing from resume - ATS systems need full name for proper candidate identification and search functionality"  
- If NO complete name found: "Critical: Complete name (first and last) is missing from resume - ATS systems cannot properly categorize or search for candidates without full names"
- If NO email found: "Critical: Email address is missing from resume - Recruiters need email for direct communication and interview scheduling"
- If NO phone found: "Critical: Phone number is missing from resume - Phone contact is essential for urgent communication and interview coordination"

**MANDATORY RECOMMENDATIONS TO ADD** (if issues found):
- For missing first name: "Add your first name prominently at the top of your resume header, ensuring it's clearly visible and matches your official documents"
- For missing last name: "Include your last name alongside your first name in the resume header, using standard formatting like 'John Smith' or 'SMITH, John'"
- For missing complete name: "Place your complete name (first and last) at the very top of your resume in a large, bold font (16-18pt) to ensure ATS systems can easily identify you"
- For missing contact: "Add your professional email address and phone number in the header section below your name, using standard formats like 'john.smith@email.com' and '(555) 123-4567'"

**DETAILED IMPROVEMENT REQUIREMENTS**:
For each weakness identified, provide specific, actionable improvement steps that candidates can immediately implement. Focus on:
1. **What exactly needs to be changed** (be specific about content, placement, formatting)
2. **Where to make the change** (specific section, position on page)
3. **How to implement it** (formatting suggestions, examples)
4. **Why it matters** (ATS impact, recruiter perspective)

Return ONLY valid JSON. Do not include explanations, notes, or extra text.
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

        ### **Critical ATS Requirements to Check FIRST**
        1. **Name Completeness**: Resume MUST have both first name AND last name clearly visible
           - If only first name is present → Flag as critical issue and deduct 15-20 points
           - If only last name is present → Flag as critical issue and deduct 15-20 points  
           - If neither is clearly identifiable → Flag as critical issue and deduct 20-25 points
           - Check for common name patterns: "John Smith", "J. Smith", "John S.", etc.

        2. **Contact Information**: Must have at least email OR phone number
           - If both missing → Flag as critical issue and deduct 10-15 points
           - If only one present → Flag as medium issue and deduct 5-10 points

        ### **Evaluation Criteria & Scoring**
        Provide a **score from 0–100** based on the following weighted criteria:

        1. **Keyword Match & Skills Alignment (35%)**
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

        7. **Basic ATS Compliance (5%)**
           - Name completeness and contact information

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
        
        **CRITICAL NAME VALIDATION CHECKLIST**:
        1. **First Name Detection**: Look for common first names (John, Jane, Michael, Sarah, David, Emma, James, Olivia, Robert, Ava, William, Isabella, etc.)
        2. **Last Name Detection**: Look for common last names (Smith, Johnson, Williams, Brown, Jones, Garcia, Miller, Davis, etc.)
        3. **Name Pattern Analysis**: Check for formats like "John Smith", "J. Smith", "John S.", "Smith, John", "JOHN SMITH"
        4. **Contact Validation**: Verify email (contains @ symbol) and phone (contains digits)

        **MANDATORY WEAKNESSES TO ADD** (if issues found):
        - If NO first name found: "Critical: First name is missing from resume - ATS systems require complete identification for candidate tracking and database management"
        - If NO last name found: "Critical: Last name is missing from resume - ATS systems need full name for proper candidate identification and search functionality"  
        - If NO complete name found: "Critical: Complete name (first and last) is missing from resume - ATS systems cannot properly categorize or search for candidates without full names"
        - If NO email found: "Critical: Email address is missing from resume - Recruiters need email for direct communication and interview scheduling"
        - If NO phone found: "Critical: Phone number is missing from resume - Phone contact is essential for urgent communication and interview coordination"

        **MANDATORY RECOMMENDATIONS TO ADD** (if issues found):
        - For missing first name: "Add your first name prominently at the top of your resume header, ensuring it's clearly visible and matches your official documents"
        - For missing last name: "Include your last name alongside your first name in the resume header, using standard formatting like 'John Smith' or 'SMITH, John'"
        - For missing complete name: "Place your complete name (first and last) at the very top of your resume in a large, bold font (16-18pt) to ensure ATS systems can easily identify you"
        - For missing contact: "Add your professional email address and phone number in the header section below your name, using standard formats like 'john.smith@email.com' and '(555) 123-4567'"
        
        **DETAILED IMPROVEMENT REQUIREMENTS**:
        For each weakness identified, provide specific, actionable improvement steps that candidates can immediately implement. Focus on:
        1. **What exactly needs to be changed** (be specific about content, placement, formatting)
        2. **Where to make the change** (specific section, position on page)
        3. **How to implement it** (formatting suggestions, examples)
        4. **Why it matters** (ATS impact, recruiter perspective, job match relevance)
        
        **JOB-SPECIFIC IMPROVEMENT GUIDANCE**:
        When providing recommendations, always consider the specific job requirements and suggest:
        - How to incorporate missing keywords from the job description
        - Which experiences to highlight or rephrase to better match the role
        - What skills to emphasize based on the job requirements
        - How to quantify achievements in ways relevant to the target position
        
        Return ONLY the JSON output — no explanations.
        """
