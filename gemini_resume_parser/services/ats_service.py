import json
import logging
import datetime
import re
from typing import Dict, Any, Optional, List
from openai import OpenAI
from .openai_parser_service import OpenAIResumeParser

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
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-4o-mini", temperature: float = 0.1, top_p: float = 0.8):
        """
        Initialize the Standard ATS Service
        
        Args:
            api_key: OpenAI API key (if not provided, will use environment variable)
            model_name: OpenAI model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.parser = OpenAIResumeParser(api_key=api_key, model_name=model_name, temperature=temperature, top_p=top_p)
        self.client = self.parser.client
        self.model_name = model_name
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
            
        # Update the generation parameters (OpenAI handles this in API calls)
        logger.info(f"Updated generation parameters: temperature={self.temperature}, top_p={self.top_p}")
    
    def get_generation_settings(self) -> Dict[str, float]:
        """Get current generation parameter settings"""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "model_name": self.model_name
        }

    def set_consistent_parameters(self):
        """
        Set parameters optimized for consistent ATS analysis results.
        Uses low temperature and focused top_p for deterministic output.
        """
        self.update_generation_parameters(temperature=0.1, top_p=0.8)
        logger.info("🎯 Set consistent parameters for deterministic ATS analysis")

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
        
        KEYWORD_USAGE_PLACEMENT (0-100):
        - 90-100: Perfect keyword presence and natural placement throughout resume, critical ATS ranking terms included
        - 80-89: Excellent keyword usage with minor gaps in placement or density
        - 70-79: Good keyword coverage but some important terms missing or poorly placed
        - 60-69: Fair keyword usage, missing critical ATS ranking terms
        - 50-59: Poor keyword placement, limited ATS optimization
        - 0-49: Very poor keyword usage, minimal ATS ranking potential
        
        SKILLS_MATCH_ALIGNMENT (0-100):
        - 90-100: Perfect alignment of technical and soft skills with industry requirements
        - 80-89: Excellent skills match with minor gaps in required competencies
        - 70-79: Good skills alignment but missing some important technical/soft skills
        - 60-69: Fair skills match, significant gaps in required competencies
        - 50-59: Poor skills alignment, limited relevant competencies
        - 0-49: Very poor skills match, minimal relevant skills
        
        FORMATTING_LAYOUT_ATS (0-100):
        - 90-100: Perfect clean, simple, standardized formatting, fully ATS-compatible
        - 80-89: Excellent formatting with minor ATS compatibility issues
        - 70-79: Good formatting but some ATS parsing concerns (tables, graphics, complex layouts)
        - 60-69: Fair formatting with significant ATS problems
        - 50-59: Poor formatting, major ATS parsing issues
        - 0-49: Critical formatting problems, completely ATS-incompatible
        
        SECTION_ORGANIZATION (0-100):
        - 90-100: All essential sections present with proper labeling (contact, summary, experience, skills, education, projects, certificates)
        - 80-89: Most sections complete with minor organizational issues, may be missing projects or certificates
        - 70-79: Basic sections present but some incomplete or poorly organized, missing important sections like projects
        - 60-69: Missing important sections (projects, certificates) or significant organizational gaps
        - 50-59: Major sections missing (projects, certificates) or severely disorganized
        - 0-49: Critical sections missing, resume structure incomplete, no projects or certificates
        
        ACHIEVEMENTS_IMPACT_METRICS (0-100):
        - 90-100: Quantified achievements throughout with specific metrics and measurable impact
        - 80-89: Good use of metrics with some quantified results and clear impact
        - 70-79: Some achievements quantified but inconsistent impact measurement
        - 60-69: Limited quantified achievements, mostly descriptive without metrics
        - 50-59: Very few quantified results, mostly vague descriptions
        - 0-49: No quantified achievements, all descriptions lack measurable impact
        
        GRAMMAR_SPELLING_QUALITY (0-100):
        - 90-100: Perfect spelling and grammar, professional language throughout
        - 80-89: Minor spelling/grammar issues, mostly professional quality
        - 70-79: Some spelling/grammar errors but generally acceptable quality
        - 60-69: Multiple spelling/grammar issues affecting professional quality
        - 50-59: Significant spelling/grammar problems
        - 0-49: Critical spelling/grammar errors throughout
        
        HEADER_CONSISTENCY (0-100):
        - 90-100: Perfect use of standard section labels, consistent header formatting
        - 80-89: Excellent header consistency with minor variations
        - 70-79: Good header usage but some non-standard labels
        - 60-69: Fair header consistency, some ATS import issues
        - 50-59: Poor header usage, significant ATS parsing problems
        - 0-49: Very poor header consistency, major ATS import failures
        
        CLARITY_BREVITY (0-100):
        - 90-100: Perfect clarity and brevity, concise professional language
        - 80-89: Excellent clarity with minor verbosity issues
        - 70-79: Good clarity but some run-on sentences or unclear points
        - 60-69: Fair clarity, some confusing or overly complex language
        - 50-59: Poor clarity, significant readability issues
        - 0-49: Very poor clarity, major communication problems
        
        REPETITION_AVOIDANCE (0-100):
        - 90-100: Perfect varied language, no unnecessary repetitions, professional diversity
        - 80-89: Excellent language variety with minor repetitive elements
        - 70-79: Good variety but some repetitive action verbs or phrases
        - 60-69: Fair variety, noticeable repetition affecting quality
        - 50-59: Poor variety, significant repetitive language
        - 0-49: Very poor variety, excessive repetition throughout
        
        RESUME TEXT TO ANALYZE:
        {resume_text}
        
        SECTION DETECTION REQUIREMENTS:
        - Check for PROJECTS section: Look for "Projects", "Personal Projects", "Portfolio", "Key Projects", "Project Experience"
        - Check for CERTIFICATES section: Look for "Certifications", "Certificates", "Professional Certifications", "Licenses", "Credentials"
        - If projects section is missing, reduce SECTION_ORGANIZATION score by 15-20 points
        - If certificates section is missing, reduce SECTION_ORGANIZATION score by 10-15 points
        - Include specific feedback about missing sections in weaknesses and recommendations
        
        REQUIRED OUTPUT SCHEMA (MUST INCLUDE ALL SECTIONS):
        {{
            "overall_score": <calculate_weighted_average_of_all_category_scores>,
            "analysis_timestamp": "{datetime.datetime.utcnow().isoformat()}Z",
            "category_scores": {{
                "keyword_usage_placement": <exact_score_based_on_criteria_above>,
                "skills_match_alignment": <exact_score_based_on_criteria_above>,
                "formatting_layout_ats": <exact_score_based_on_criteria_above>,
                "section_organization": <exact_score_based_on_criteria_above>,
                "achievements_impact_metrics": <exact_score_based_on_criteria_above>,
                "grammar_spelling_quality": <exact_score_based_on_criteria_above>,
                "header_consistency": <exact_score_based_on_criteria_above>,
                "clarity_brevity": <exact_score_based_on_criteria_above>,
                "repetition_avoidance": <exact_score_based_on_criteria_above>
            }},
            "detailed_feedback": {{
                "keyword_usage_placement": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Keyword Usage & Placement",
                    "description": "Analysis of keyword presence, placement, and ATS ranking optimization",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "skills_match_alignment": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Skills Match & Alignment",
                    "description": "Analysis of technical and soft skills alignment with industry requirements",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "formatting_layout_ats": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Formatting & Layout ATS",
                    "description": "Analysis of clean, simple formatting and ATS compatibility",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "section_organization": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Section Organization",
                    "description": "Analysis of essential resume sections and proper organization",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "achievements_impact_metrics": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Achievements & Impact Metrics",
                    "description": "Analysis of quantified achievements and measurable results",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "grammar_spelling_quality": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Grammar & Spelling Quality",
                    "description": "Analysis of error-free professional language and quality",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "header_consistency": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Header Consistency",
                    "description": "Analysis of standard section labels and header formatting",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "clarity_brevity": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Clarity & Brevity",
                    "description": "Analysis of clear, concise sentences and professional brevity",
                    "positives": ["Specific positive aspect 1", "Specific positive aspect 2"],
                    "negatives": ["Specific issue 1", "Specific issue 2"],
                    "suggestions": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"]
                }},
                "repetition_avoidance": {{
                    "score": <exact_score_based_on_criteria_above>,
                    "title": "Repetition Avoidance",
                    "description": "Analysis of varied language and minimal unnecessary repetitions",
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
        - Apply the same rigorous standards for each parameter from the CSV criteria!
        - Ensure consistent evaluation of keyword usage, skills match, formatting, and all other parameters!
        - Use the exact scoring ranges provided for each category - no deviations!
        - Provide consistent, professional feedback that matches the scoring criteria exactly!
        """

        try:
            logger.info(f"Generating ATS analysis with temperature={self.temperature}, top_p={self.top_p}")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert ATS (Applicant Tracking System) analyst with 10+ years of experience in resume optimization and HR technology."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                top_p=self.top_p,
                max_tokens=4000
            )
            cleaned_response = self._clean_openai_response(response.choices[0].message.content)
            
            # Parse the JSON response
            ats_response = json.loads(cleaned_response)
            
            # Enforce schema compliance
            ats_response = self._enforce_ats_schema_compliance(ats_response)
            
            # Validate CSV parameters
            ats_response = self._validate_csv_parameters(ats_response)
            
            # Final validation
            ats_response = self._final_ats_validation(ats_response)
            
            logger.info(f"✅ Standard ATS analysis completed successfully with overall score: {ats_response.get('overall_score', 'N/A')}")
            return ats_response
            
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse OpenAI JSON response for ATS analysis: {str(json_error)}")
            logger.error(f"Raw response: {cleaned_response}")
            raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
        except Exception as e:
            logger.error(f"Failed to analyze resume for ATS: {str(e)}")
            raise

    def _clean_openai_response(self, response_text: str) -> str:
        """Clean OpenAI API response to extract valid JSON"""
        import re
        import json
        
        logger.info(f"🧹 Cleaning OpenAI ATS response of {len(response_text)} characters")
        
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
                "keyword_usage_placement": 0,
                "skills_match_alignment": 0,
                "formatting_layout_ats": 0,
                "section_organization": 0,
                "achievements_impact_metrics": 0,
                "grammar_spelling_quality": 0,
                "header_consistency": 0,
                "clarity_brevity": 0,
                "repetition_avoidance": 0
            },
            "detailed_feedback": {
                "keyword_usage_placement": {"score": 0, "title": "Keyword Usage & Placement", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "skills_match_alignment": {"score": 0, "title": "Skills Match & Alignment", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "formatting_layout_ats": {"score": 0, "title": "Formatting & Layout ATS", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "section_organization": {"score": 0, "title": "Section Organization", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "achievements_impact_metrics": {"score": 0, "title": "Achievements & Impact Metrics", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "grammar_spelling_quality": {"score": 0, "title": "Grammar & Spelling Quality", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "header_consistency": {"score": 0, "title": "Header Consistency", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "clarity_brevity": {"score": 0, "title": "Clarity & Brevity", "description": "", "positives": [], "negatives": [], "suggestions": []},
                "repetition_avoidance": {"score": 0, "title": "Repetition Avoidance", "description": "", "positives": [], "negatives": [], "suggestions": []}
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

    def _validate_csv_parameters(self, ats_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates that all CSV parameters are properly evaluated in the ATS response.
        Ensures consistency with the CSV criteria provided.
        """
        logger.info("🔍 Validating CSV parameters compliance")
        
        # Define CSV parameters and their corresponding category scores
        csv_parameters = {
            "keyword_usage_placement": "Keyword Usage & Placement",
            "skills_match_alignment": "Skills Match & Alignment", 
            "formatting_layout_ats": "Formatting & Layout ATS",
            "section_organization": "Section Organization",
            "achievements_impact_metrics": "Achievements & Impact Metrics",
            "grammar_spelling_quality": "Grammar & Spelling Quality",
            "header_consistency": "Header Consistency",
            "clarity_brevity": "Clarity & Brevity",
            "repetition_avoidance": "Repetition Avoidance"
        }
        
        # Validate that all CSV parameters are present and properly scored
        for param_key, param_name in csv_parameters.items():
            if param_key not in ats_response.get("category_scores", {}):
                logger.warning(f"⚠️ Missing CSV parameter: {param_name} ({param_key})")
                ats_response["category_scores"][param_key] = 0
            
            if param_key not in ats_response.get("detailed_feedback", {}):
                logger.warning(f"⚠️ Missing CSV parameter feedback: {param_name} ({param_key})")
                ats_response["detailed_feedback"][param_key] = {
                    "score": 0,
                    "title": param_name,
                    "description": f"Analysis of {param_name.lower()}",
                    "positives": [],
                    "negatives": [],
                    "suggestions": []
                }
        
        logger.info("✅ CSV parameters validation completed")
        return ats_response


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
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-4o-mini", temperature: float = 0.1, top_p: float = 0.8):
        """
        Initialize the JD-Specific ATS Service
        
        Args:
            api_key: OpenAI API key (if not provided, will use environment variable)
            model_name: OpenAI model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.parser = OpenAIResumeParser(api_key=api_key, model_name=model_name, temperature=temperature, top_p=top_p)
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
            
        # Update the generation parameters (OpenAI handles this in API calls)
        logger.info(f"Updated generation parameters: temperature={self.temperature}, top_p={self.top_p}")
    
    def get_generation_settings(self) -> Dict[str, float]:
        """Get current generation parameter settings"""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "model_name": self.model_name
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
        
        SECTION DETECTION REQUIREMENTS:
        - Check for PROJECTS section: Look for "Projects", "Personal Projects", "Portfolio", "Key Projects", "Project Experience"
        - Check for CERTIFICATES section: Look for "Certifications", "Certificates", "Professional Certifications", "Licenses", "Credentials"
        - If projects section is missing, reduce FORMATTING_STRUCTURE score by 15-20 points
        - If certificates section is missing, reduce FORMATTING_STRUCTURE score by 10-15 points
        - Include specific feedback about missing sections in weaknesses and recommendations
        
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
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert ATS (Applicant Tracking System) analyst and job matching specialist with 10+ years of experience in recruitment technology and resume optimization."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                top_p=self.top_p,
                max_tokens=4000
            )
            cleaned_response = self._clean_openai_response(response.choices[0].message.content)
            
            # Parse the JSON response
            jd_ats_response = json.loads(cleaned_response)
            
            # Enforce schema compliance
            jd_ats_response = self._enforce_jd_ats_schema_compliance(jd_ats_response)
            
            # Final validation
            jd_ats_response = self._final_ats_validation(jd_ats_response)
            
            logger.info(f"✅ JD-Specific ATS analysis completed successfully with overall score: {jd_ats_response.get('overall_score', 'N/A')}")
            return jd_ats_response
            
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse OpenAI JSON response for JD-Specific ATS analysis: {str(json_error)}")
            logger.error(f"Raw response: {cleaned_response}")
            raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
        except Exception as e:
            logger.error(f"Failed to analyze resume for JD-Specific ATS: {str(e)}")
            raise

    def _clean_openai_response(self, response_text: str) -> str:
        """Clean OpenAI API response to extract valid JSON"""
        import re
        import json
        
        logger.info(f"🧹 Cleaning OpenAI JD-ATS response of {len(response_text)} characters")
        
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