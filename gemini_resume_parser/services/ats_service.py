import json
import logging
import datetime
import re
from typing import Dict, Any, Optional, List
from google.generativeai import GenerativeModel
from .gemini_parser_service import GeminiResumeParser

logger = logging.getLogger(__name__)

class StandardATSService:
    """
    Standard ATS (Applicant Tracking System) analysis service
    
    Provides comprehensive resume analysis with:
    - Consistent scoring methodology
    - Grammar and spelling validation
    - Repetition detection
    - ATS optimization recommendations
    - Error-free output generation
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash", temperature: float = 0.1, top_p: float = 0.8):
        """
        Initialize the Standard ATS Service
        
        Args:
            api_key: Gemini API key (if not provided, will use environment variable)
            model_name: Gemini model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.parser = GeminiResumeParser(api_key=api_key, model_name=model_name, temperature=temperature, top_p=top_p)
        self.model = self.parser.model
        self.temperature = temperature
        self.top_p = top_p
    
    def update_generation_parameters(self, temperature: float = None, top_p: float = None):
        """
        Update generation parameters for more consistent results
        
        Args:
            temperature: New temperature value (0.0 = deterministic, 1.0 = creative)
            top_p: New top_p value (0.0 = focused, 1.0 = diverse)
        """
        if temperature is not None:
            self.temperature = temperature
        if top_p is not None:
            self.top_p = top_p
            
        # Update the model's generation config
        self.model.generation_config.temperature = self.temperature
        self.model.generation_config.top_p = self.top_p
        logger.info(f"Updated generation parameters: temperature={self.temperature}, top_p={self.top_p}")
    
    def get_generation_settings(self) -> Dict[str, float]:
        """Get current generation parameter settings"""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "model_name": self.parser.model_name
        }

    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Analyze resume for ATS optimization and provide comprehensive feedback
        
        Args:
            resume_text: Raw resume text to analyze
            
        Returns:
            Dictionary containing ATS analysis results with scores and recommendations
        """
        logger.info(f"Starting Standard ATS analysis with temperature={self.temperature}, top_p={self.top_p}")
        
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) analyst with 10+ years of experience in resume optimization and HR technology.
        
        TASK: Perform a comprehensive ATS analysis of the provided resume with precise, consistent scoring and actionable feedback.
        
        CRITICAL REQUIREMENTS - MANDATORY COMPLIANCE:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations, no additional text)
        - NEVER omit any section - if no issues exist, return empty arrays/strings but keep the section structure
        - ALWAYS include ALL required sections: overall_score, category_scores, detailed_feedback, extracted_text, strengths, weaknesses, recommendations
        - Ensure all scores are integers between 0-100 (never "NA", "N/A", "None", "Null", "Unknown", or text)
        - NEVER use placeholder values - provide specific, actionable content
        - NO REPETITIONS: Use unique, varied language across all sections
        - PERFECT GRAMMAR: All content must have flawless spelling, grammar, and professional language
        - CONSISTENT SCORING: Apply the same rigorous standards across all categories
        
        PRECISE SCORING CRITERIA - APPLY CONSISTENTLY:
        
        FORMATTING_READABILITY (0-100):
        - 90-100: Perfect ATS format, clear sections, consistent formatting, no tables/graphics
        - 80-89: Good format with minor inconsistencies, mostly ATS-friendly
        - 70-79: Acceptable format but some ATS issues (tables, graphics, complex layouts)
        - 60-69: Poor formatting with significant ATS problems
        - 50-59: Major formatting issues that will cause ATS parsing errors
        - 0-49: Critical formatting problems, completely ATS-incompatible
        
        KEYWORD_COVERAGE_GENERAL (0-100):
        - 90-100: Excellent keyword density, industry-relevant terms, skills alignment
        - 80-89: Good keyword coverage with minor gaps
        - 70-79: Adequate keywords but missing some important terms
        - 60-69: Poor keyword coverage, missing critical industry terms
        - 50-59: Very limited keywords, significant gaps
        - 0-49: Minimal or no relevant keywords
        
        SECTION_COMPLETENESS (0-100):
        - 90-100: All essential sections present and complete (contact, summary, experience, education, skills)
        - 80-89: Most sections complete with minor gaps
        - 70-79: Basic sections present but some incomplete
        - 60-69: Missing important sections or significant gaps
        - 50-59: Major sections missing or severely incomplete
        - 0-49: Critical sections missing, resume incomplete
        
        ACHIEVEMENTS_METRICS (0-100):
        - 90-100: Quantified achievements throughout, specific metrics, measurable impact
        - 80-89: Good use of metrics with some quantified results
        - 70-79: Some achievements quantified but inconsistent
        - 60-69: Limited quantified achievements, mostly descriptive
        - 50-59: Very few quantified results, mostly vague descriptions
        - 0-49: No quantified achievements, all descriptions are vague
        
        SPELLING_GRAMMAR (0-100):
        - 90-100: Perfect spelling and grammar, professional language throughout
        - 80-89: Minor spelling/grammar issues, mostly professional
        - 70-79: Some spelling/grammar errors but generally acceptable
        - 60-69: Multiple spelling/grammar issues affecting readability
        - 50-59: Significant spelling/grammar problems
        - 0-49: Critical spelling/grammar errors throughout
        
        PARSE_ACCURACY (0-100):
        - 90-100: Perfect ATS parsing, clear structure, standard section headers
        - 80-89: Good ATS compatibility with minor parsing issues
        - 70-79: Generally ATS-friendly but some parsing challenges
        - 60-69: Some ATS parsing issues, non-standard formatting
        - 50-59: Significant ATS parsing problems
        - 0-49: Major ATS parsing failures, incompatible format
        
        RESUME TEXT TO ANALYZE:
        {resume_text}
        
        REQUIRED OUTPUT SCHEMA (MUST INCLUDE ALL SECTIONS):
        {{
            "overall_score": <calculate_weighted_average_of_all_category_scores>,
            "analysis_timestamp": "{datetime.datetime.utcnow().isoformat()}Z",
            "category_scores": {{
                "formatting_readability": <exact_score_based_on_criteria_above>,
                "keyword_coverage_general": <exact_score_based_on_criteria_above>,
                "section_completeness": <exact_score_based_on_criteria_above>,
                "achievements_metrics": <exact_score_based_on_criteria_above>,
                "spelling_grammar": <exact_score_based_on_criteria_above>,
                "parse_accuracy": <exact_score_based_on_criteria_above>
            }},
            "detailed_feedback": {{
                "formatting_readability": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Formatting & Readability",
                    "description": "Specific analysis of resume formatting, structure, and ATS compatibility",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "keyword_coverage_general": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Keyword Coverage",
                    "description": "Detailed analysis of keyword optimization and industry-relevant terms",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "section_completeness": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Section Completeness",
                    "description": "Analysis of resume section completeness and organization",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "achievements_metrics": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Achievements & Metrics",
                    "description": "Analysis of quantified achievements and measurable impact",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "spelling_grammar": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Spelling & Grammar",
                    "description": "Analysis of spelling, grammar, and language quality",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "parse_accuracy": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Parse Accuracy",
                    "description": "Analysis of ATS parsing accuracy and compatibility",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }}
            }},
            "extracted_text": "Complete text content extracted from the resume",
            "strengths": [
                "Specific strength 1 with details",
                "Specific strength 2 with details",
                "Specific strength 3 with details"
            ],
            "weaknesses": [
                "Specific weakness 1 with details",
                "Specific weakness 2 with details",
                "Specific weakness 3 with details"
            ],
            "recommendations": [
                "Priority recommendation 1 with specific action",
                "Priority recommendation 2 with specific action", 
                "Priority recommendation 3 with specific action",
                "Priority recommendation 4 with specific action",
                "Priority recommendation 5 with specific action"
            ]
        }}
        
        FINAL INSTRUCTIONS - CRITICAL FOR CONSISTENCY:
        - NEVER omit sections - return empty values instead of missing sections!
        - overall_score MUST be a weighted average of all category scores (integer 0-100)
        - All category scores MUST be integers between 0-100 based on precise criteria above!
        - Provide specific, actionable recommendations with clear next steps!
        - Focus on ATS compatibility, professional presentation, and measurable improvements!
        - Use varied, professional language - avoid repetition across sections!
        - Ensure all feedback is specific to the actual resume content analyzed!
        - Calculate scores based on objective criteria, not subjective opinions!
        - Maintain consistency in scoring methodology across all categories!
        """

        try:
            logger.info(f"Generating ATS analysis with temperature={self.temperature}, top_p={self.top_p}")
            response = self.model.generate_content(prompt)
            cleaned_response = self._clean_gemini_response(response.text)
            
            # Parse the JSON response
            ats_response = json.loads(cleaned_response)
            
            # Enforce schema compliance
            ats_response = self._enforce_ats_schema_compliance(ats_response)
            
            # Final validation
            ats_response = self._final_ats_validation(ats_response)
            
            logger.info(f"✅ Standard ATS analysis completed successfully with overall score: {ats_response.get('overall_score', 'N/A')}")
            return ats_response
            
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse Gemini JSON response for ATS analysis: {str(json_error)}")
            logger.error(f"Raw response: {cleaned_response}")
            raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
        except Exception as e:
            logger.error(f"Failed to analyze resume for ATS: {str(e)}")
            raise

    def _clean_gemini_response(self, response_text: str) -> str:
        """Clean Gemini API response to extract valid JSON"""
        import re
        import json
        
        logger.info(f"🧹 Cleaning Gemini ATS response of {len(response_text)} characters")
        
        # Remove markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "")
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "")

        response_text = response_text.strip()
        
        # Try to find JSON content within markdown blocks first
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                parsed = json.loads(json_content)
                logger.info(f"✅ Successfully extracted JSON from markdown block: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("❌ Extracted JSON from markdown block is invalid")
        
        # Try to find the complete JSON response
        if response_text.startswith('{') and response_text.endswith('}'):
            try:
                parsed = json.loads(response_text)
                logger.info(f"✅ Successfully parsed complete JSON: {len(response_text)} characters")
                return response_text
            except json.JSONDecodeError:
                logger.warning("❌ Complete JSON parsing failed")
        
        # Try to find JSON object in the text
        json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                parsed = json.loads(json_content)
                logger.info(f"✅ Successfully extracted JSON object: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("❌ Extracted JSON object is invalid")
        
        logger.warning("Could not extract valid JSON from AI response")
        return '{"error": "Invalid JSON response", "message": "Could not parse AI response"}'

    def _enforce_ats_schema_compliance(self, ats_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforces schema compliance for the ATS response.
        Ensures all required sections are present, even if the AI skips them.
        """
        logger.info("🔒 Enforcing ATS schema compliance")
        
        # Define the complete required schema structure
        required_sections = {
            "overall_score": 0,
            "analysis_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "category_scores": {
                "formatting_readability": 0,
                "keyword_coverage_general": 0,
                "section_completeness": 0,
                "achievements_metrics": 0,
                "spelling_grammar": 0,
                "parse_accuracy": 0
            },
            "detailed_feedback": {
                "formatting_readability": {"score": 0, "title": "Formatting & Readability", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "keyword_coverage_general": {"score": 0, "title": "Keyword Coverage", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "section_completeness": {"score": 0, "title": "Section Completeness", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "achievements_metrics": {"score": 0, "title": "Achievements & Metrics", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "spelling_grammar": {"score": 0, "title": "Spelling & Grammar", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "parse_accuracy": {"score": 0, "title": "Parse Accuracy", "description": "", "positives": [], "negatives": [], "suggestions": []}
            },
            "extracted_text": "",
            "strengths": [],
            "weaknesses": [],
            "recommendations": []
        }
        
        # Ensure top-level structure exists
        for key, default_value in required_sections.items():
            if key not in ats_response:
                ats_response[key] = default_value
                logger.warning(f"🔒 Enforced missing top-level section: {key}")
        
        # Validate and fix the overall score
        original_score = ats_response.get("overall_score", 0)
        validated_score = self._validate_score(original_score)
        ats_response["overall_score"] = validated_score
        
        # Validate and fix the analysis timestamp
        ats_response["analysis_timestamp"] = self._validate_timestamp(ats_response.get("analysis_timestamp", ""))
        
        # Ensure category_scores structure exists
        if "category_scores" not in ats_response:
            ats_response["category_scores"] = required_sections["category_scores"]
        
        # Ensure each category score exists
        for category_name, default_score in required_sections["category_scores"].items():
            if category_name not in ats_response["category_scores"]:
                ats_response["category_scores"][category_name] = default_score
                logger.warning(f"🔒 Enforced missing category score: {category_name}")
        
        # Ensure detailed_feedback structure exists
        if "detailed_feedback" not in ats_response:
            ats_response["detailed_feedback"] = required_sections["detailed_feedback"]
        
        # Ensure each detailed feedback section has the required structure
        for feedback_name, default_structure in required_sections["detailed_feedback"].items():
            if feedback_name not in ats_response["detailed_feedback"]:
                ats_response["detailed_feedback"][feedback_name] = default_structure
                logger.warning(f"🔒 Enforced missing detailed feedback: {feedback_name}")
            else:
                # Ensure each feedback section has required keys
                for key, default_value in default_structure.items():
                    if key not in ats_response["detailed_feedback"][feedback_name]:
                        ats_response["detailed_feedback"][feedback_name][key] = default_value
                        logger.warning(f"🔒 Enforced missing key in {feedback_name}: {key}")
        
        # Ensure extracted_text exists
        if "extracted_text" not in ats_response:
            ats_response["extracted_text"] = ""
        
        # Ensure strengths exists
        if "strengths" not in ats_response:
            ats_response["strengths"] = []
        
        # Ensure weaknesses exists
        if "weaknesses" not in ats_response:
            ats_response["weaknesses"] = []
        
        # Ensure recommendations exists
        if "recommendations" not in ats_response:
            ats_response["recommendations"] = []
        
        logger.info("✅ ATS schema compliance enforcement completed")
        return ats_response

    def _final_ats_validation(self, ats_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Final validation to ensure absolutely no "NA" values exist anywhere in the response.
        This is the last line of defense against "NA" values.
        """
        na_variations = [
            'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
            'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
            'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
            'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
        ]
        
        def validate_and_fix(value, path=""):
            if isinstance(value, str):
                value_str = value.strip().upper()
                if value_str in na_variations:
                    logger.error(f"🚨 FINAL ATS VALIDATION: Found 'NA' value at {path}: '{value}' -> ''")
                    return ""
                return value
            elif isinstance(value, list):
                return [validate_and_fix(item, f"{path}[{i}]") for i, item in enumerate(value) if item is not None]
            elif isinstance(value, dict):
                return {k: validate_and_fix(v, f"{path}.{k}") for k, v in value.items()}
            elif isinstance(value, (int, float)):
                return value
            else:
                logger.warning(f"🚨 FINAL ATS VALIDATION: Unexpected value type at {path}: {type(value)} - {value}")
                return value
        
        # Perform final validation and fix any remaining "NA" values
        validated_response = validate_and_fix(ats_response, "root")
        logger.info("🔒 Completed final ATS validation - response is guaranteed to be NA-free")
        return validated_response

    def _validate_score(self, score: Any) -> int:
        """
        Validates and ensures the score is a number between 0 and 100.
        If it's "NA", "N/A", or an invalid type, it defaults to 0.
        """
        if isinstance(score, str):
            score_str = score.strip().upper()
            na_variations = [
                'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
                'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
                'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
                'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
            ]
            if score_str in na_variations:
                logger.warning(f"⚠️ 'NA' score detected: '{score}', defaulting to 0.")
                return 0
        
        if score is None:
            logger.warning(f"⚠️ None score detected, defaulting to 0.")
            return 0
        
        try:
            score_int = int(score)
            return max(0, min(100, score_int))
        except (ValueError, TypeError):
            logger.warning(f"⚠️ Invalid score '{score}' detected, defaulting to 0.")
            return 0

    def _validate_timestamp(self, timestamp: str) -> str:
        """
        Validates and ensures the timestamp is in a valid ISO format.
        If it's not, it defaults to the current UTC timestamp.
        """
        try:
            datetime.datetime.fromisoformat(timestamp)
            return timestamp
        except (ValueError, TypeError):
            logger.warning(f"⚠️ Invalid timestamp '{timestamp}' detected, defaulting to current UTC timestamp.")
            return datetime.datetime.utcnow().isoformat() + "Z"


class JDSpecificATSService:
    """
    Job Description Specific ATS analysis service
    
    Provides comprehensive resume analysis tailored to specific job descriptions with:
    - Job-specific keyword matching
    - Experience level alignment
    - Skills gap analysis
    - ATS optimization for specific roles
    - Consistent scoring methodology
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash", temperature: float = 0.1, top_p: float = 0.8):
        """
        Initialize the JD-Specific ATS Service
        
        Args:
            api_key: Gemini API key (if not provided, will use environment variable)
            model_name: Gemini model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.parser = GeminiResumeParser(api_key=api_key, model_name=model_name, temperature=temperature, top_p=top_p)
        self.model = self.parser.model
        self.temperature = temperature
        self.top_p = top_p
    
    def update_generation_parameters(self, temperature: float = None, top_p: float = None):
        """
        Update generation parameters for more consistent results
        
        Args:
            temperature: New temperature value (0.0 = deterministic, 1.0 = creative)
            top_p: New top_p value (0.0 = focused, 1.0 = diverse)
        """
        if temperature is not None:
            self.temperature = temperature
        if top_p is not None:
            self.top_p = top_p
            
        # Update the model's generation config
        self.model.generation_config.temperature = self.temperature
        self.model.generation_config.top_p = self.top_p
        logger.info(f"Updated generation parameters: temperature={self.temperature}, top_p={self.top_p}")
    
    def get_generation_settings(self) -> Dict[str, float]:
        """Get current generation parameter settings"""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "model_name": self.parser.model_name
        }

    def analyze_resume_for_jd(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Analyze resume for specific job description and provide comprehensive feedback
        
        Args:
            resume_text: Raw resume text to analyze
            job_description: Job description text to match against
            
        Returns:
            Dictionary containing JD-specific ATS analysis results with scores and recommendations
        """
        logger.info(f"Starting JD-Specific ATS analysis with temperature={self.temperature}, top_p={self.top_p}")
        
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) analyst and job matching specialist with 10+ years of experience in recruitment technology and resume optimization.
        
        TASK: Perform a comprehensive job-specific ATS analysis comparing the resume against the provided job description with precise, consistent scoring and actionable feedback.
        
        CRITICAL REQUIREMENTS - MANDATORY COMPLIANCE:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations, no additional text)
        - NEVER omit any section - if no issues exist, return empty arrays/strings but keep the section structure
        - ALWAYS include ALL required sections: overall_score, match_percentage, missing_keywords, category_scores, detailed_feedback, extracted_text, strengths, weaknesses, recommendations
        - Ensure all scores are integers between 0-100 (never "NA", "N/A", "None", "Null", "Unknown", or text)
        - NEVER use placeholder values - provide specific, actionable content
        - NO REPETITIONS: Use unique, varied language across all sections
        - PERFECT GRAMMAR: All content must have flawless spelling, grammar, and professional language
        - CONSISTENT SCORING: Apply the same rigorous standards across all categories
        
        PRECISE SCORING CRITERIA - APPLY CONSISTENTLY:
        
        KEYWORD_MATCH_SKILLS (0-100):
        - 90-100: Perfect keyword alignment, all required skills present, industry terms matched
        - 80-89: Excellent keyword match with minor gaps in skill alignment
        - 70-79: Good keyword coverage but missing some important job-specific terms
        - 60-69: Fair keyword match, missing several critical skills/terms
        - 50-59: Poor keyword alignment, significant gaps in required skills
        - 0-49: Very poor keyword match, minimal alignment with job requirements
        
        EXPERIENCE_RELEVANCE (0-100):
        - 90-100: Perfect experience alignment, exact role match, relevant industry background
        - 80-89: Excellent experience match with minor gaps in role relevance
        - 70-79: Good experience alignment but some gaps in role-specific experience
        - 60-69: Fair experience match, missing some relevant experience areas
        - 50-59: Poor experience alignment, significant gaps in relevant experience
        - 0-49: Very poor experience match, minimal relevant experience
        
        EDUCATION_CERTIFICATIONS (0-100):
        - 90-100: Perfect education match, all required qualifications present
        - 80-89: Excellent education alignment with minor gaps
        - 70-79: Good education match but missing some preferred qualifications
        - 60-69: Fair education alignment, missing important qualifications
        - 50-59: Poor education match, significant gaps in required qualifications
        - 0-49: Very poor education alignment, minimal required qualifications
        
        ACHIEVEMENTS_IMPACT (0-100):
        - 90-100: Quantified achievements directly relevant to job requirements
        - 80-89: Good achievement alignment with some relevant metrics
        - 70-79: Fair achievement relevance but missing some job-specific impact
        - 60-69: Limited achievement alignment with job requirements
        - 50-59: Poor achievement relevance, minimal job-specific impact
        - 0-49: Very poor achievement alignment, no relevant impact shown
        
        FORMATTING_STRUCTURE (0-100):
        - 90-100: Perfect ATS format, clear structure, job-relevant organization
        - 80-89: Excellent formatting with minor ATS optimization issues
        - 70-79: Good formatting but some ATS compatibility concerns
        - 60-69: Fair formatting with significant ATS issues
        - 50-59: Poor formatting, major ATS compatibility problems
        - 0-49: Very poor formatting, completely ATS-incompatible
        
        SOFT_SKILLS_MATCH (0-100):
        - 90-100: Perfect soft skills alignment with job requirements
        - 80-89: Excellent soft skills match with minor gaps
        - 70-79: Good soft skills alignment but missing some required traits
        - 60-69: Fair soft skills match, missing important job-relevant skills
        - 50-59: Poor soft skills alignment, significant gaps
        - 0-49: Very poor soft skills match, minimal alignment
        
        RESUME TEXT TO ANALYZE:
        {resume_text}
        
        JOB DESCRIPTION TO MATCH AGAINST:
        {job_description}
        
        REQUIRED OUTPUT SCHEMA (MUST INCLUDE ALL SECTIONS):
        {{
            "overall_score": <calculate_weighted_average_of_all_category_scores>,
            "match_percentage": <percentage_of_job_requirements_met>,
            "missing_keywords": ["Specific missing keyword 1", "Specific missing keyword 2"],
            "analysis_timestamp": "{datetime.datetime.utcnow().isoformat()}Z",
            "category_scores": {{
                "keyword_match_skills": <exact_score_based_on_criteria_above>,
                "experience_relevance": <exact_score_based_on_criteria_above>,
                "education_certifications": <exact_score_based_on_criteria_above>,
                "achievements_impact": <exact_score_based_on_criteria_above>,
                "formatting_structure": <exact_score_based_on_criteria_above>,
                "soft_skills_match": <exact_score_based_on_criteria_above>
            }},
            "detailed_feedback": {{
                "keyword_match_skills": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Keyword Match & Skills",
                    "description": "Specific analysis of keyword alignment with job requirements",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "experience_relevance": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Experience Relevance",
                    "description": "Specific analysis of experience alignment with job requirements",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "education_certifications": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Education & Certifications",
                    "description": "Specific analysis of educational background match with job requirements",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "achievements_impact": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Achievements & Impact",
                    "description": "Specific analysis of quantified achievements and job-relevant impact",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "formatting_structure": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Formatting & Structure",
                    "description": "Specific analysis of resume format and ATS compatibility for job application",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "soft_skills_match": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Soft Skills Match",
                    "description": "Specific analysis of soft skills alignment with job requirements",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }}
            }},
            "extracted_text": "Complete text content extracted from the resume",
            "strengths": [
                "Specific strength 1 with job relevance details",
                "Specific strength 2 with job relevance details",
                "Specific strength 3 with job relevance details"
            ],
            "weaknesses": [
                "Specific weakness 1 with job impact details",
                "Specific weakness 2 with job impact details",
                "Specific weakness 3 with job impact details"
            ],
            "recommendations": [
                "Priority recommendation 1 with specific job-focused action",
                "Priority recommendation 2 with specific job-focused action", 
                "Priority recommendation 3 with specific job-focused action",
                "Priority recommendation 4 with specific job-focused action",
                "Priority recommendation 5 with specific job-focused action"
            ]
        }}
        
        FINAL INSTRUCTIONS - CRITICAL FOR CONSISTENCY:
        - NEVER omit sections - return empty values instead of missing sections!
        - overall_score MUST be a weighted average of all category scores (integer 0-100)
        - match_percentage MUST be calculated based on job requirements met (integer 0-100)
        - All category scores MUST be integers between 0-100 based on precise criteria above!
        - Provide specific, actionable recommendations with clear job-focused next steps!
        - Focus on job-specific optimization, ATS compatibility, and measurable improvements!
        - Use varied, professional language - avoid repetition across sections!
        - Ensure all feedback is specific to the actual resume and job description analyzed!
        - Calculate scores based on objective job matching criteria, not subjective opinions!
        - Maintain consistency in scoring methodology across all categories!
        - Analyze how well the resume matches the specific job requirements with precision!
        """

        try:
            logger.info(f"Generating JD-Specific ATS analysis with temperature={self.temperature}, top_p={self.top_p}")
            response = self.model.generate_content(prompt)
            cleaned_response = self._clean_gemini_response(response.text)
            
            # Parse the JSON response
            jd_ats_response = json.loads(cleaned_response)
            
            # Enforce schema compliance
            jd_ats_response = self._enforce_jd_ats_schema_compliance(jd_ats_response)
            
            # Final validation
            jd_ats_response = self._final_ats_validation(jd_ats_response)
            
            logger.info(f"✅ JD-Specific ATS analysis completed successfully with overall score: {jd_ats_response.get('overall_score', 'N/A')}")
            return jd_ats_response
            
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse Gemini JSON response for JD-Specific ATS analysis: {str(json_error)}")
            logger.error(f"Raw response: {cleaned_response}")
            raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
        except Exception as e:
            logger.error(f"Failed to analyze resume for JD-Specific ATS: {str(e)}")
            raise

    def _clean_gemini_response(self, response_text: str) -> str:
        """Clean Gemini API response to extract valid JSON"""
        import re
        import json
        
        logger.info(f"🧹 Cleaning Gemini JD-ATS response of {len(response_text)} characters")
        
        # Remove markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "")
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "")

        response_text = response_text.strip()
        
        # Try to find JSON content within markdown blocks first
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                parsed = json.loads(json_content)
                logger.info(f"✅ Successfully extracted JSON from markdown block: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("❌ Extracted JSON from markdown block is invalid")
        
        # Try to find the complete JSON response
        if response_text.startswith('{') and response_text.endswith('}'):
            try:
                parsed = json.loads(response_text)
                logger.info(f"✅ Successfully parsed complete JSON: {len(response_text)} characters")
                return response_text
            except json.JSONDecodeError:
                logger.warning("❌ Complete JSON parsing failed")
        
        # Try to find JSON object in the text
        json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                parsed = json.loads(json_content)
                logger.info(f"✅ Successfully extracted JSON object: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("❌ Extracted JSON object is invalid")
        
        logger.warning("Could not extract valid JSON from AI response")
        return '{"error": "Invalid JSON response", "message": "Could not parse AI response"}'

    def _enforce_jd_ats_schema_compliance(self, jd_ats_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforces schema compliance for the JD-Specific ATS response.
        Ensures all required sections are present, even if the AI skips them.
        """
        logger.info("🔒 Enforcing JD-ATS schema compliance")
        
        # Define the complete required schema structure
        required_sections = {
            "overall_score": 0,
            "match_percentage": 0,
            "missing_keywords": [],
            "analysis_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "category_scores": {
                "keyword_match_skills": 0,
                "experience_relevance": 0,
                "education_certifications": 0,
                "achievements_impact": 0,
                "formatting_structure": 0,
                "soft_skills_match": 0
            },
            "detailed_feedback": {
                "keyword_match_skills": {"score": 0, "title": "Keyword Match & Skills", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "experience_relevance": {"score": 0, "title": "Experience Relevance", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "education_certifications": {"score": 0, "title": "Education & Certifications", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "achievements_impact": {"score": 0, "title": "Achievements & Impact", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "formatting_structure": {"score": 0, "title": "Formatting & Structure", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "soft_skills_match": {"score": 0, "title": "Soft Skills Match", "description": "", "positives": [], "negatives": [], "suggestions": []}
            },
            "extracted_text": "",
            "strengths": [],
            "weaknesses": [],
            "recommendations": []
        }
        
        # Ensure top-level structure exists
        for key, default_value in required_sections.items():
            if key not in jd_ats_response:
                jd_ats_response[key] = default_value
                logger.warning(f"🔒 Enforced missing top-level section: {key}")
        
        # Validate and fix the overall score
        original_score = jd_ats_response.get("overall_score", 0)
        validated_score = self._validate_score(original_score)
        jd_ats_response["overall_score"] = validated_score
        
        # Validate and fix the match percentage
        original_match = jd_ats_response.get("match_percentage", 0)
        validated_match = self._validate_score(original_match)
        jd_ats_response["match_percentage"] = validated_match
        
        # Validate and fix the analysis timestamp
        jd_ats_response["analysis_timestamp"] = self._validate_timestamp(jd_ats_response.get("analysis_timestamp", ""))
        
        # Ensure category_scores structure exists
        if "category_scores" not in jd_ats_response:
            jd_ats_response["category_scores"] = required_sections["category_scores"]
        
        # Ensure each category score exists
        for category_name, default_score in required_sections["category_scores"].items():
            if category_name not in jd_ats_response["category_scores"]:
                jd_ats_response["category_scores"][category_name] = default_score
                logger.warning(f"🔒 Enforced missing category score: {category_name}")
        
        # Ensure detailed_feedback structure exists
        if "detailed_feedback" not in jd_ats_response:
            jd_ats_response["detailed_feedback"] = required_sections["detailed_feedback"]
        
        # Ensure each detailed feedback section has the required structure
        for feedback_name, default_structure in required_sections["detailed_feedback"].items():
            if feedback_name not in jd_ats_response["detailed_feedback"]:
                jd_ats_response["detailed_feedback"][feedback_name] = default_structure
                logger.warning(f"🔒 Enforced missing detailed feedback: {feedback_name}")
            else:
                # Ensure each feedback section has required keys
                for key, default_value in default_structure.items():
                    if key not in jd_ats_response["detailed_feedback"][feedback_name]:
                        jd_ats_response["detailed_feedback"][feedback_name][key] = default_value
                        logger.warning(f"🔒 Enforced missing key in {feedback_name}: {key}")
        
        # Ensure extracted_text exists
        if "extracted_text" not in jd_ats_response:
            jd_ats_response["extracted_text"] = ""
        
        # Ensure strengths exists
        if "strengths" not in jd_ats_response:
            jd_ats_response["strengths"] = []
        
        # Ensure weaknesses exists
        if "weaknesses" not in jd_ats_response:
            jd_ats_response["weaknesses"] = []
        
        # Ensure recommendations exists
        if "recommendations" not in jd_ats_response:
            jd_ats_response["recommendations"] = []
        
        # Ensure missing_keywords exists
        if "missing_keywords" not in jd_ats_response:
            jd_ats_response["missing_keywords"] = []
        
        logger.info("✅ JD-ATS schema compliance enforcement completed")
        return jd_ats_response

    def _final_ats_validation(self, jd_ats_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Final validation to ensure absolutely no "NA" values exist anywhere in the response.
        This is the last line of defense against "NA" values.
        """
        na_variations = [
            'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
            'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
            'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
            'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
        ]
        
        def validate_and_fix(value, path=""):
            if isinstance(value, str):
                value_str = value.strip().upper()
                if value_str in na_variations:
                    logger.error(f"🚨 FINAL JD-ATS VALIDATION: Found 'NA' value at {path}: '{value}' -> ''")
                    return ""
                return value
            elif isinstance(value, list):
                return [validate_and_fix(item, f"{path}[{i}]") for i, item in enumerate(value) if item is not None]
            elif isinstance(value, dict):
                return {k: validate_and_fix(v, f"{path}.{k}") for k, v in value.items()}
            elif isinstance(value, (int, float)):
                return value
            else:
                logger.warning(f"🚨 FINAL JD-ATS VALIDATION: Unexpected value type at {path}: {type(value)} - {value}")
                return value
        
        # Perform final validation and fix any remaining "NA" values
        validated_response = validate_and_fix(jd_ats_response, "root")
        logger.info("🔒 Completed final JD-ATS validation - response is guaranteed to be NA-free")
        return validated_response

    def _validate_score(self, score: Any) -> int:
        """
        Validates and ensures the score is a number between 0 and 100.
        If it's "NA", "N/A", or an invalid type, it defaults to 0.
        """
        if isinstance(score, str):
            score_str = score.strip().upper()
            na_variations = [
                'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
                'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
                'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
                'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
            ]
            if score_str in na_variations:
                logger.warning(f"⚠️ 'NA' score detected: '{score}', defaulting to 0.")
                return 0
        
        if score is None:
            logger.warning(f"⚠️ None score detected, defaulting to 0.")
            return 0
        
        try:
            score_int = int(score)
            return max(0, min(100, score_int))
        except (ValueError, TypeError):
            logger.warning(f"⚠️ Invalid score '{score}' detected, defaulting to 0.")
            return 0

    def _validate_timestamp(self, timestamp: str) -> str:
        """
        Validates and ensures the timestamp is in a valid ISO format.
        If it's not, it defaults to the current UTC timestamp.
        """
        try:
            datetime.datetime.fromisoformat(timestamp)
            return timestamp
        except (ValueError, TypeError):
            logger.warning(f"⚠️ Invalid timestamp '{timestamp}' detected, defaulting to current UTC timestamp.")
            return datetime.datetime.utcnow().isoformat() + "Z"