import json
import logging
import datetime
import re
from typing import Dict, Any, Optional, List
from google.generativeai import GenerativeModel
from .openai_parser_service import OpenAIResumeParser

logger = logging.getLogger(__name__)

class ResumeImprovementService:
    """
    Service for applying ATS suggestions to improve resume content
    
    This service takes parsed resume data and ATS analysis results,
    then generates an improved version of the resume by applying
    the suggestions from the ATS analysis.
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-4o-mini", temperature: float = 0.3, top_p: float = 0.8):
        """
        Initialize the Resume Improvement Service
        
        Args:
            api_key: OpenAI API key (if not provided, will use environment variable)
            model_name: OpenAI model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.parser = OpenAIResumeParser(api_key=api_key, model_name=model_name, temperature=temperature, top_p=top_p)
        self.model = self.parser.client
        self.model_name = model_name
        self.temperature = temperature
        self.top_p = top_p
    
    def apply_ats_suggestions(self, parsed_resume_data: Dict[str, Any], ats_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply ATS suggestions to improve the resume
        
        Args:
            parsed_resume_data: The structured resume data from parsing
            ats_analysis: The ATS analysis results with suggestions
            
        Returns:
            Dictionary containing the improved resume data
        """
        logger.info("🔍 DEBUG: Starting resume improvement with ATS suggestions")
        logger.info(f"🔍 DEBUG: ATS analysis keys: {list(ats_analysis.keys())}")
        
        # Debug the ATS analysis structure
        if "detailed_feedback" in ats_analysis:
            logger.info(f"🔍 DEBUG: Detailed feedback categories: {list(ats_analysis['detailed_feedback'].keys())}")
            if "repetition_avoidance" in ats_analysis["detailed_feedback"]:
                repetition_feedback = ats_analysis["detailed_feedback"]["repetition_avoidance"]
                logger.info(f"🔍 DEBUG: Repetition avoidance feedback structure: {list(repetition_feedback.keys())}")
                if "suggestions" in repetition_feedback:
                    logger.info(f"🔍 DEBUG: Raw repetition suggestions from ATS: {repetition_feedback['suggestions']}")
        
        # Extract suggestions from ATS analysis
        suggestions = self._extract_suggestions(ats_analysis)
        
        # Generate improved resume based ONLY on ATS suggestions
        improved_resume = self._generate_improved_resume(parsed_resume_data, suggestions, ats_analysis)
        
        logger.info("🔍 DEBUG: Successfully generated improved resume")
        return improved_resume
    
    def _extract_suggestions(self, ats_analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Extract actionable suggestions from ATS analysis
        
        Args:
            ats_analysis: ATS analysis results
            
        Returns:
            Dictionary of suggestions organized by category
        """
        logger.info("🔍 DEBUG: Starting suggestion extraction from ATS analysis")
        
        suggestions = {
            "achievements_impact_metrics": [],
            "clarity_brevity": [],
            "formatting_layout_ats": [],
            "grammar_spelling_quality": [],
            "header_consistency": [],
            "keyword_usage_placement": [],
            "repetition_avoidance": [],
            "section_organization": [],
            "skills_match_alignment": [],
            "general_recommendations": []
        }
        
        # Extract suggestions from detailed feedback
        if "detailed_feedback" in ats_analysis:
            logger.info("🔍 DEBUG: Found detailed_feedback section in ATS analysis")
            for category, feedback in ats_analysis["detailed_feedback"].items():
                logger.info(f"🔍 DEBUG: Processing category: {category}")
                if isinstance(feedback, dict) and "suggestions" in feedback:
                    category_suggestions = feedback["suggestions"]
                    suggestions[category] = category_suggestions
                    logger.info(f"🔍 DEBUG: Extracted {len(category_suggestions)} suggestions for {category}")
                    
                    # Special debug for repetition_avoidance
                    if category == "repetition_avoidance":
                        logger.info("🔍 DEBUG: REPETITION_AVOIDANCE suggestions found:")
                        for i, suggestion in enumerate(category_suggestions, 1):
                            logger.info(f"🔍 DEBUG:   Suggestion {i}: {suggestion}")
                    
                    # Debug all other categories too
                    else:
                        logger.info(f"🔍 DEBUG: {category.upper()} suggestions found:")
                        for i, suggestion in enumerate(category_suggestions, 1):
                            logger.info(f"🔍 DEBUG:   Suggestion {i}: {suggestion}")
                else:
                    logger.info(f"🔍 DEBUG: No suggestions found for category {category}")
        else:
            logger.warning("🔍 DEBUG: No detailed_feedback section found in ATS analysis")
        
        # Extract general recommendations
        if "recommendations" in ats_analysis:
            suggestions["general_recommendations"] = ats_analysis["recommendations"]
            logger.info(f"🔍 DEBUG: Extracted {len(ats_analysis['recommendations'])} general recommendations")
            for i, rec in enumerate(ats_analysis["recommendations"], 1):
                logger.info(f"🔍 DEBUG:   General recommendation {i}: {rec}")
        
        # Debug summary
        total_suggestions = sum(len(suggestions[cat]) for cat in suggestions)
        logger.info(f"🔍 DEBUG: Total suggestions extracted: {total_suggestions}")
        logger.info(f"🔍 DEBUG: Repetition avoidance suggestions: {len(suggestions['repetition_avoidance'])}")
        
        return suggestions
    
    def _detect_missing_sections(self, parsed_resume_data: Dict[str, Any]) -> Dict[str, bool]:
        """
        Detect which important sections are missing from the resume
        
        Args:
            parsed_resume_data: Parsed resume data
            
        Returns:
            Dictionary indicating which sections are missing
        """
        missing_sections = {
            "projects": True,
            "certificates": True
        }
        
        # Check for projects section
        projects_keywords = ["projects", "project", "portfolio", "personal_projects", "key_projects"]
        for key in projects_keywords:
            if key in parsed_resume_data and parsed_resume_data[key]:
                missing_sections["projects"] = False
                break
        
        # Check for certificates section
        cert_keywords = ["certificates", "certifications", "certificate", "certification", "licenses", "credentials"]
        for key in cert_keywords:
            if key in parsed_resume_data and parsed_resume_data[key]:
                missing_sections["certificates"] = False
                break
        
        return missing_sections
    
    def _process_skills_suggestions(self, parsed_resume_data: Dict[str, Any], suggestions: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Process ADD_SKILLS suggestions and enhance the skills section using AI
        No fallback logic - relies on robust AI prompting for skills enhancement
        
        Args:
            parsed_resume_data: Original parsed resume data
            suggestions: Extracted suggestions from ATS analysis
            
        Returns:
            Enhanced resume data with improved skills section
        """
        enhanced_data = parsed_resume_data.copy()
        
        # Get skills suggestions from skills_match_alignment category
        skills_suggestions = suggestions.get("skills_match_alignment", [])
        
        if not skills_suggestions:
            return enhanced_data
        
        # Use AI to intelligently enhance skills section
        try:
            enhanced_skills = self._ai_enhance_skills_section(parsed_resume_data, skills_suggestions)
            if enhanced_skills:
                enhanced_data["skills"] = enhanced_skills
        except Exception as e:
            logger.warning(f"AI skills enhancement failed: {e}. Using original skills.")
        
        return enhanced_data
    
    def _ai_enhance_skills_section(self, parsed_resume_data: Dict[str, Any], skills_suggestions: List[str]) -> Dict[str, Any]:
        """
        Use AI to intelligently enhance the skills section based on ATS suggestions
        Follows the same approach as AI suggestion service - no fallback logic
        
        Args:
            parsed_resume_data: Original parsed resume data
            skills_suggestions: List of ADD_SKILLS suggestions from ATS analysis
            
        Returns:
            Enhanced skills section in frontend format
        """
        try:
            # Format skills suggestions for AI processing
            suggestions_text = "\n".join([f"- {suggestion}" for suggestion in skills_suggestions])
            
            # Get current skills for context
            current_skills = parsed_resume_data.get("skills", {})
            
            prompt = f"""
            You are an expert resume skills specialist. Enhance the skills section based on ATS suggestions.
            
            CRITICAL RULES:
            - Return ONLY valid JSON (no markdown, no code fences, no explanations)
            - Start your response with {{ and end with }}
            - ONLY suggest skills that can be added to EXISTING categories shown in the resume
            - Do NOT create new category objects or suggest new skill categories
            - Only add missing skills to existing categories
            - If a skill doesn't fit any existing category, do NOT suggest it
            - Focus on enhancing existing skill categories with relevant missing skills
            - In the response: Return skills as a DIRECT object with category names as keys
            - CRITICAL: ONLY include the NEW skills being added, NOT the existing skills
            - Format: If existing has "Languages: JavaScript" and you need to add "Java", response should be {{"Languages": "Java"}} NOT {{"Languages": "JavaScript, Java"}}
            - NEVER include existing skills in the response - only show the new skills being added
            - NEVER use "General" wrapper - return skills directly as category: skills pairs
            - If a category has no new skills to add, do NOT include that category in the response at all
            - Do NOT suggest "New Category: skills" - only use existing categories
            - NEVER suggest "General" as a skill category - avoid generic categories
            
            CURRENT SKILLS STRUCTURE:
            {json.dumps(current_skills, indent=2)}
            
            ATS SKILLS SUGGESTIONS TO APPLY:
            {suggestions_text}
            
            REQUIRED OUTPUT FORMAT:
            Return ONLY the new skills to be added in this exact format:
            {{
                "Languages": "Java, Python",
                "Database": "PostgreSQL",
                "Cloud": "AWS"
            }}
            
            IMPORTANT: 
            - Only include categories that have NEW skills to add
            - Each category value should be a comma-separated string of NEW skills only
            - Do NOT include existing skills
            - If no new skills can be added to any category, return {{}}
            """
            
            response = self.model.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert resume skills specialist. Generate enhanced skills based on ATS suggestions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                top_p=0.8,
                max_tokens=1000
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Clean and parse the response
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()
            
            # Parse the JSON response
            new_skills = json.loads(response_text)
            
            # Log the response for debugging
            logger.info(f"AI returned new skills: {new_skills}")
            logger.info(f"Current skills before merge: {current_skills}")
            
            # Merge new skills with existing skills
            if new_skills and isinstance(new_skills, dict) and new_skills:
                enhanced_skills = self._merge_new_skills_with_existing(current_skills, new_skills)
                logger.info(f"Enhanced skills after merge: {enhanced_skills}")
                return enhanced_skills
            
            # If no new skills to add, return existing skills
            logger.info("No new skills to add, returning existing skills")
            return current_skills
            
        except Exception as e:
            logger.error(f"AI skills enhancement failed: {e}")
            return parsed_resume_data.get("skills", {})
    
    def _merge_new_skills_with_existing(self, existing_skills: Dict[str, Any], new_skills: Dict[str, str]) -> Dict[str, Any]:
        """
        Merge new skills with existing skills, avoiding duplicates
        
        Args:
            existing_skills: Current skills structure
            new_skills: New skills to add (category: comma-separated string format)
            
        Returns:
            Merged skills structure
        """
        logger.info(f"Merging skills - Existing: {existing_skills}, New: {new_skills}")
        
        # Start with a deep copy of existing skills
        merged_skills = {}
        if existing_skills:
            for category, skills_list in existing_skills.items():
                if isinstance(skills_list, list):
                    merged_skills[category] = skills_list.copy()
                else:
                    merged_skills[category] = []
        else:
            merged_skills = {}
        
        logger.info(f"Initial merged skills: {merged_skills}")
        
        for category, skills_string in new_skills.items():
            if not skills_string or not isinstance(skills_string, str):
                logger.info(f"Skipping empty or invalid skills string for category {category}")
                continue
                
            # Parse comma-separated skills
            new_skills_list = [skill.strip() for skill in skills_string.split(",") if skill.strip()]
            logger.info(f"Parsed new skills for {category}: {new_skills_list}")
            
            if not new_skills_list:
                logger.info(f"No valid skills found for category {category}")
                continue
                
            # Initialize category if it doesn't exist
            if category not in merged_skills:
                merged_skills[category] = []
                logger.info(f"Created new category {category}")
            
            # Ensure category is a list
            if not isinstance(merged_skills[category], list):
                merged_skills[category] = []
                logger.info(f"Converted category {category} to list")
            
            # Add new skills that don't already exist
            existing_skills_lower = [s.lower() for s in merged_skills[category]]
            added_skills = []
            for skill in new_skills_list:
                if skill.lower() not in existing_skills_lower:
                    merged_skills[category].append(skill)
                    added_skills.append(skill)
                else:
                    logger.info(f"Skill '{skill}' already exists in category {category}")
            
            if added_skills:
                logger.info(f"Added skills to {category}: {added_skills}")
        
        logger.info(f"Final merged skills: {merged_skills}")
        return merged_skills
    
    
    def _generate_improved_resume(self, parsed_resume_data: Dict[str, Any], suggestions: Dict[str, List[str]], ats_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an improved resume by applying ATS suggestions
        
        Args:
            parsed_resume_data: Original parsed resume data
            suggestions: Extracted suggestions from ATS analysis
            ats_analysis: Full ATS analysis results
            
        Returns:
            Improved resume data
        """
        logger.info("🔍 DEBUG: Starting resume improvement generation")
        logger.info(f"🔍 DEBUG: Total suggestion categories received: {len(suggestions)}")
        
        # Debug repetition suggestions specifically
        repetition_suggestions = suggestions.get("repetition_avoidance", [])
        logger.info(f"🔍 DEBUG: Repetition avoidance suggestions count: {len(repetition_suggestions)}")
        if repetition_suggestions:
            logger.info("🔍 DEBUG: Repetition suggestions details:")
            for i, suggestion in enumerate(repetition_suggestions, 1):
                logger.info(f"🔍 DEBUG:   Repetition suggestion {i}: {suggestion}")
        
        # Debug all other suggestion categories
        for category, category_suggestions in suggestions.items():
            if category != "repetition_avoidance" and category_suggestions:
                logger.info(f"🔍 DEBUG: {category.upper()} suggestions count: {len(category_suggestions)}")
                for i, suggestion in enumerate(category_suggestions, 1):
                    logger.info(f"🔍 DEBUG:   {category} suggestion {i}: {suggestion}")
        
        # Detect missing sections
        missing_sections = self._detect_missing_sections(parsed_resume_data)
        
        # Process ADD_SKILLS suggestions first to enhance skills section
        enhanced_resume_data = self._process_skills_suggestions(parsed_resume_data, suggestions)
        
        # Create a comprehensive prompt for resume improvement
        prompt = self._create_improvement_prompt(enhanced_resume_data, suggestions, ats_analysis, missing_sections)
        
        logger.info(f"🔍 DEBUG: Generated prompt length: {len(prompt)} characters")
        
        try:
            logger.info("Generating improved resume with OpenAI API")
            response = self.model.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert resume improvement specialist. Generate enhanced resume content based on ATS analysis and suggestions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                top_p=self.top_p,
                max_tokens=4000
            )
            cleaned_response = self._clean_openai_response(response.choices[0].message.content)
            
            # Debug: Log the AI response for repetition analysis
            logger.info("🔍 DEBUG: AI Response received for resume improvement")
            logger.info(f"🔍 DEBUG: Response length: {len(cleaned_response)} characters")
            
            # Check if the response contains repetition-related changes
            if "FIX_REPETITION" in cleaned_response:
                logger.info("🔍 DEBUG: AI response contains FIX_REPETITION references")
            else:
                logger.info("🔍 DEBUG: AI response does NOT contain FIX_REPETITION references")
            
            # Parse the improved resume
            improved_resume = json.loads(cleaned_response)
            
            # Debug: Check if repetition changes were made
            logger.info("🔍 DEBUG: Analyzing AI response for repetition changes...")
            self._debug_repetition_changes(parsed_resume_data, improved_resume)
            
            # Validate and enhance the response
            improved_resume = self._validate_improved_resume(improved_resume, parsed_resume_data)
            
            return improved_resume
            
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse improved resume JSON: {str(json_error)}")
            logger.error(f"Raw response: {cleaned_response}")
            raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
        except Exception as e:
            logger.error(f"Failed to generate improved resume: {str(e)}")
            raise
    
    def _create_improvement_prompt(self, parsed_resume_data: Dict[str, Any], suggestions: Dict[str, List[str]], ats_analysis: Dict[str, Any], missing_sections: Dict[str, bool]) -> str:
        """
        Create a comprehensive prompt for resume improvement
        
        Args:
            parsed_resume_data: Original parsed resume data
            suggestions: Extracted suggestions
            ats_analysis: ATS analysis results
            
        Returns:
            Formatted prompt string
        """
        # Convert suggestions to readable format
        suggestions_text = self._format_suggestions_for_prompt(suggestions)
        
        # Get the original resume text for context
        original_text = ats_analysis.get("extracted_text", "")
        
        prompt = f"""
        You are an expert resume writer and ATS optimization specialist with 15+ years of experience in creating high-impact resumes that achieve 90+ ATS scores and impress recruiters.

        TASK: Dramatically improve the provided resume by applying SPECIFIC ATS suggestions to increase the overall score by 10-15 points while maintaining original structure and content integrity.

        CRITICAL REQUIREMENTS FOR SCORE IMPROVEMENT:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations)
        - Maintain the exact same structure as the original parsed resume data
        - Apply EVERY suggestion with precision and industry-specific enhancements
        - Transform generic descriptions into quantified, keyword-rich, achievement-focused content
        - Ensure the improved resume achieves 90+ ATS compatibility
        - Keep the same field names and structure as the input
        - For projects: ALWAYS include techStack as a comma-separated string of technologies
        - MANDATORY: Apply ALL suggestions from the ATS analysis with specific improvements
        - ENHANCE every bullet point with quantified metrics and industry keywords
        - OPTIMIZE every section for maximum ATS score improvement
        - **CRITICAL FORMATTING**: For ALL description fields (experience, projects, education, activities, etc.), format each sentence to end with \\n (newline character). This ensures proper bullet point formatting in the frontend.

        ORIGINAL RESUME DATA:
        {json.dumps(parsed_resume_data, indent=2)}

        ORIGINAL RESUME TEXT:
        {original_text}

        ATS SUGGESTIONS TO APPLY:
        {suggestions_text}

        ATS ANALYSIS SUMMARY:
        - Overall Score: {ats_analysis.get('overall_score', 'N/A')}
        - Strengths: {', '.join(ats_analysis.get('strengths', [])[:3])}
        - Weaknesses: {', '.join(ats_analysis.get('weaknesses', [])[:3])}
        
        MISSING SECTIONS DETECTED:
        - Projects Section Missing: {missing_sections.get('projects', False)}
        - Certificates Section Missing: {missing_sections.get('certificates', False)}

        SCORE-BOOSTING IMPROVEMENT GUIDELINES (Target: 90+ ATS Score):
        1. ACHIEVEMENTS & IMPACT METRICS (High Impact):
           - Transform EVERY bullet point to include specific numbers, percentages, and quantifiable results
           - Add measurable outcomes with industry-standard metrics (ROI, efficiency gains, cost savings)
           - Include timeframes, team sizes, budget amounts, and scale of impact
           - Use power words: "increased", "optimized", "achieved", "delivered", "exceeded"
           - **DESCRIPTION FORMATTING**: Each responsibility/achievement should be a separate sentence ending with \\n

        2. KEYWORD OPTIMIZATION (Critical for ATS):
           - Integrate 15-20 relevant industry keywords naturally throughout all sections
           - Use technical terms, software names, methodologies, and industry-specific language
           - Include variations and synonyms of important terms
           - Add trending industry keywords and certifications
           - Optimize for both technical and soft skills mentioned in job descriptions

        3. SECTION ENHANCEMENT (ATS Structure):
           - Ensure every section has robust, keyword-rich content
           - Add industry-specific terminology to job titles and descriptions
           - Include technical skills with proficiency levels
           - Enhance education with relevant coursework and achievements
           - Add certifications, training, and professional development

        4. CLARITY & PROFESSIONAL LANGUAGE:
           - Rewrite weak descriptions with powerful, action-oriented language
           - Use industry-standard terminology and professional phrasing
           - Eliminate vague terms like "helped", "assisted", "worked on"
           - Replace with specific action verbs and concrete accomplishments

        5. ATS COMPATIBILITY OPTIMIZATION:
           - Use standard section headers recognized by ATS systems
           - Ensure consistent formatting and structure
           - Add location information where missing
           - Include complete contact information
           - Use standard date formats: MUST be in "MMM YYYY" format (e.g., "Jan 2025", "Dec 2024") - convert all other formats like "2025-01", "01/2025", "January 2025", "2025" to this format

        7. MISSING SECTIONS - ADD DUMMY DATA:
           - If PROJECTS section is missing, add 2-3 realistic projects with:
             * Project name and detailed description (8-10 lines)
             * techStack: Comma-separated string of technologies used (e.g., "React, Node.js, MongoDB, AWS")
             * Key achievements or outcomes with specific metrics
             * Start date and end date (format: "Aug 2020 - Sep 2020")
             * Detailed project description including:
               - Project overview and objectives
               - Technical challenges faced and solutions implemented
               - Specific features developed
               - Performance improvements achieved
               - User impact and business value
               - Lessons learned and skills gained
             * Make projects relevant to their field and experience level
           - If CERTIFICATES section is missing, add 2-3 relevant certifications with:
             * Certification name and issuing organization
             * Date obtained or expiration date
             * Brief description of skills gained
             * Choose certifications relevant to their industry and role
           - Generate realistic, professional dummy data that matches the person's field/experience
           - Ensure dummy data is relevant to their industry and skill level
           - Make the dummy data sound authentic and professional
           - Base dummy data on their existing skills, experience, and job titles
           - Use appropriate project types and certification names for their field
           - For project dates: Use realistic timeframes (1-6 months duration)
           - Ensure project dates don't overlap with their work experience dates
           - Make project descriptions comprehensive and detailed (8-10 lines each)
           - Include specific technical details and business impact in descriptions

        REQUIRED OUTPUT FORMAT:
         Return the improved resume data in the EXACT format expected by the frontend ResumeBuilderPage.tsx interface:

         {{
           "basicDetails": {{
             "fullName": "string",
             "professionalTitle": "string", 
             "phone": "string",
             "email": "string",
             "location": "string",
             "website": "string",
             "github": "string",
             "linkedin": "string",
             "profilePicture": "string (optional)"
           }},
           "summary": "string",
           "objective": "string",
           "experience": [
             {{
               "id": "string",
               "company": "string",
               "position": "string", 
               "startDate": "string",
               "endDate": "string",
               "description": "string",
               "location": "string"
             }}
           ],
           "education": [
             {{
               "id": "string",
               "institution": "string",
               "degree": "string",
               "year": "string",
               "description": "string",
               "grade": "string",
               "location": "string"
             }}
           ],
           "skills": "object or array - maintain original format",
           "languages": [
             {{
               "name": "string",
               "proficiency": "string"
             }}
           ],
           "activities": [
             {{
               "id": "string",
               "title": "string",
               "description": "string"
             }}
           ],
           "projects": [
             {{
               "id": "string",
               "name": "string",
               "techStack": "string",
               "startDate": "string",
               "endDate": "string", 
               "description": "string",
               "link": "string"
             }}
           ],
           "certifications": [
             {{
               "id": "string",
               "certificateName": "string",
               "link": "string",
               "issueDate": "string",
               "instituteName": "string"
             }}
           ],
           "references": [
             {{
               "id": "string",
               "name": "string",
               "title": "string",
               "company": "string",
               "phone": "string",
               "email": "string",
               "relationship": "string"
             }}
           ],
           "customSections": [
             {{
               "id": "string",
               "title": "string",
               "type": "text|list|timeline|grid|mixed",
               "position": "number",
               "content": {{
                 "text": "string (optional)",
                 "items": [
                   {{
                     "id": "string",
                     "title": "string (optional)",
                     "subtitle": "string (optional)",
                     "description": "string (optional)",
                     "startDate": "string (optional)",
                     "endDate": "string (optional)",
                     "location": "string (optional)",
                     "link": "string (optional)",
                     "bullets": ["string"],
                     "tags": ["string"]
                   }}
                 ],
                 "columns": [
                   {{
                     "title": "string",
                     "items": ["string"]
                   }}
                 ]
               }},
               "styling": {{
                 "showBullets": "boolean (optional)",
                 "showDates": "boolean (optional)",
                 "showLocation": "boolean (optional)",
                 "showLinks": "boolean (optional)",
                 "showTags": "boolean (optional)",
                 "layout": "vertical|horizontal|grid (optional)"
               }}
             }}
           ]
         }}

         CRITICAL REQUIREMENTS:
         - Use EXACT field names as shown above (e.g., "basicDetails", "fullName", "professionalTitle", etc.)
         - Generate unique IDs for all array items using uuid-like strings
         - Maintain the exact structure and nesting as shown
         - For missing sections, add empty arrays with proper structure
         - Ensure all required fields are present even if empty
         - Use the frontend's expected data types (strings, arrays, objects)

        CRITICAL: APPLY ONLY ATS SUGGESTIONS - NO SELF-ENHANCEMENT:
        - Apply ONLY the specific suggestions provided in the ATS analysis
        - Do NOT add any improvements that are not explicitly mentioned in the suggestions
        - Do NOT enhance sections unless there is a specific suggestion to do so
        - PRESERVE all original content unless explicitly told to change it in the suggestions
        - Follow ATS suggestions exactly as written without adding extra improvements
        - MANDATORY: When "OPTIMIZE_DESCRIPTION" suggestions are provided for projects, experience, or summary - apply them precisely
        - EXPAND short descriptions by adding specific details, technical information, and quantified outcomes
        - COMPRESS long descriptions by focusing on key achievements and removing redundant information
        - **CRITICAL FOR REPETITION FIXES**: When FIX_REPETITION suggestions are provided:
          * Apply EVERY single FIX_REPETITION suggestion without exception
          * If the ATS analysis detected 15 repeated words, apply ALL 15 fixes
          * Replace each repeated word with the exact alternatives provided in the suggestion
          * Do NOT skip any repetition fixes - this is mandatory for ATS score improvement
          * Verify that all repeated words have been replaced before finalizing the response

        COMPREHENSIVE SUGGESTION APPLICATION RULES:
        - For "ADD_SKILLS" suggestions: Add ONLY the specific skills mentioned in the suggestion
        - For "STRUCTURE_SKILLS" suggestions: Reorganize unstructured skills into proper categories (Technical, Soft Skills, Tools, Frameworks)
        - For "ENHANCE_ACHIEVEMENT" suggestions: Replace ONLY with the exact text provided in the suggestion
        - For "ADD_KEYWORDS" suggestions: Add ONLY the keywords explicitly mentioned in the suggestion
        - For "IMPROVE_EXPERIENCE" suggestions: Make ONLY the changes specified in the suggestion
        - For "ENHANCE_PROJECT" suggestions: Apply ONLY the specific enhancements mentioned
        - For "REWRITE_SUMMARY" suggestions: Use ONLY the provided replacement text
        - For "FIX_CONTACT" suggestions: Fix ONLY the issues specifically mentioned
        - For "ADD_DATES" suggestions: Add missing dates to ALL sections mentioned in the suggestion
        - For "ADD_PROJECT_DATES" suggestions: Add dummy start and end dates to projects with realistic 2-4 month durations
        - For "ADD_ORGANIZATION" suggestions: Infer and add organizations for certificates based on certificate names
        - For "OPTIMIZE_DESCRIPTION" suggestions: Enhance descriptions that are too short or too long as specified - expand short descriptions, compress long descriptions
        - For "FIX_REPETITION" suggestions: **CRITICAL - REPLACE ALL INSTANCES OF EVERY REPEATED WORD**:
          * Apply EVERY FIX_REPETITION suggestion provided in the ATS analysis
          * If 15 repeated words are detected, apply ALL 15 fixes - NO EXCEPTIONS
          * Replace each repeated word with the specific alternatives mentioned in the suggestion
          * Ensure NO repeated words remain after applying fixes
          * Use the exact replacement words provided in the FIX_REPETITION suggestions
          * Apply fixes to ALL sections where the repeated words appear
          * **MANDATORY**: Count and verify that ALL repeated words have been replaced
        - For "FIX_FORMATTING" suggestions: Fix ONLY the formatting issues specifically mentioned
        - For "FIX_GRAMMAR" suggestions: Fix ONLY the grammar errors specifically mentioned
        - For "FIX_DATE_FORMAT" suggestions: Convert ALL dates to "MMM YYYY" format (e.g., "Jan 2025", "Dec 2024") - convert dates like "2025-01" to "Jan 2025", "01/2025" to "Jan 2025", "January 2025" to "Jan 2025", "2025" to "Jan 2025"
        - CRITICAL: If no suggestion exists for a section, leave it completely unchanged

        **REPETITION FIXES VERIFICATION CHECKLIST**:
        Before finalizing your response, verify that:
        1. ALL FIX_REPETITION suggestions from the ATS analysis have been applied
        2. Every repeated word mentioned in the suggestions has been replaced
        3. No repeated words remain in the final resume
        4. All replacement words are used exactly as specified in the suggestions
        5. The total number of repetition fixes applied matches the number of FIX_REPETITION suggestions provided

        Focus on making TRANSFORMATIVE improvements that directly address ATS scoring criteria while maintaining professional authenticity.
        Ensure all improvements align with the specific feedback provided in the ATS analysis.
        """

        return prompt
    
    def _format_suggestions_for_prompt(self, suggestions: Dict[str, List[str]]) -> str:
        """
        Format suggestions for inclusion in the prompt with enhanced specificity
        
        Args:
            suggestions: Dictionary of suggestions by category
            
        Returns:
            Formatted suggestions text with action-oriented instructions
        """
        logger.info("🔍 DEBUG: Starting suggestion formatting for prompt")
        
        formatted_suggestions = []
        
        # Priority order for suggestions (most impactful first)
        priority_categories = [
            'keyword_usage_placement',
            'achievements_impact_metrics', 
            'skills_match_alignment',
            'section_organization',
            'clarity_brevity',
            'formatting_layout_ats',
            'grammar_spelling_quality',
            'header_consistency',
            'repetition_avoidance',
            'general_recommendations'
        ]
        
        logger.info("🔍 DEBUG: Processing priority categories for formatting")
        for category in priority_categories:
            if category in suggestions and suggestions[category]:
                category_name = category.replace('_', ' ').title()
                formatted_suggestions.append(f"\n🎯 ATS SUGGESTION - {category_name}:")
                logger.info(f"🔍 DEBUG: Formatting {len(suggestions[category])} suggestions for {category}")
                
                # Special debug for repetition_avoidance
                if category == "repetition_avoidance":
                    logger.info("🔍 DEBUG: REPETITION_AVOIDANCE suggestions being formatted:")
                    for i, suggestion in enumerate(suggestions[category], 1):
                        logger.info(f"🔍 DEBUG:   Formatting repetition suggestion {i}: {suggestion}")
                        formatted_suggestions.append(f"  APPLY EXACTLY: {suggestion}")
                else:
                    logger.info(f"🔍 DEBUG: {category.upper()} suggestions being formatted:")
                    for i, suggestion in enumerate(suggestions[category], 1):
                        logger.info(f"🔍 DEBUG:   Formatting {category} suggestion {i}: {suggestion}")
                        # Pass suggestions exactly as they are from ATS analysis
                        formatted_suggestions.append(f"  APPLY EXACTLY: {suggestion}")
                formatted_suggestions.append("")  # Add spacing
            else:
                logger.info(f"🔍 DEBUG: No suggestions to format for {category}")
        
        # Add any remaining categories not in priority list
        logger.info("🔍 DEBUG: Processing remaining categories")
        for category, suggestion_list in suggestions.items():
            if category not in priority_categories and suggestion_list:
                category_name = category.replace('_', ' ').title()
                formatted_suggestions.append(f"\n📈 ATS SUGGESTION - {category_name}:")
                logger.info(f"🔍 DEBUG: Formatting {len(suggestion_list)} suggestions for remaining category {category}")
                for i, suggestion in enumerate(suggestion_list, 1):
                    logger.info(f"🔍 DEBUG:   Formatting remaining {category} suggestion {i}: {suggestion}")
                    formatted_suggestions.append(f"  APPLY EXACTLY: {suggestion}")
        
        formatted_text = '\n'.join(formatted_suggestions)
        logger.info(f"🔍 DEBUG: Formatted suggestions text length: {len(formatted_text)} characters")
        
        # Debug: Count FIX_REPETITION suggestions in formatted text
        fix_repetition_count = formatted_text.count("FIX_REPETITION")
        logger.info(f"🔍 DEBUG: FIX_REPETITION suggestions found in formatted text: {fix_repetition_count}")
        
        # Debug: Show a sample of the formatted text for repetition
        repetition_section_start = formatted_text.find("🎯 ATS SUGGESTION - Repetition Avoidance:")
        if repetition_section_start != -1:
            repetition_section_end = formatted_text.find("\n🎯 ATS SUGGESTION -", repetition_section_start + 1)
            if repetition_section_end == -1:
                repetition_section_end = formatted_text.find("\n📈 ATS SUGGESTION -", repetition_section_start + 1)
            if repetition_section_end == -1:
                repetition_section_end = len(formatted_text)
            
            repetition_section = formatted_text[repetition_section_start:repetition_section_end]
            logger.info(f"🔍 DEBUG: Repetition section in formatted text:\n{repetition_section}")
        
        return formatted_text
    
    def _clean_openai_response(self, response_text: str) -> str:
        """Clean OpenAI API response to extract valid JSON"""
        logger.info(f"Cleaning OpenAI response of {len(response_text)} characters")
        
        # Remove markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "")
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "")

        response_text = response_text.strip()
        
        # Try to find JSON content within markdown blocks
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                parsed = json.loads(json_content)
                logger.info(f"Successfully extracted JSON from markdown block: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("Extracted JSON from markdown block is invalid")
        
        # Try to find the complete JSON response
        if response_text.startswith('{') and response_text.endswith('}'):
            try:
                parsed = json.loads(response_text)
                logger.info(f"Successfully parsed complete JSON: {len(response_text)} characters")
                return response_text
            except json.JSONDecodeError:
                logger.warning("Complete JSON parsing failed")
        
        # Try to find JSON object in the text
        json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                parsed = json.loads(json_content)
                logger.info(f"Successfully extracted JSON object: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("Extracted JSON object is invalid")
        
        logger.warning("Could not extract valid JSON from AI response")
        return '{"error": "Invalid JSON response", "message": "Could not parse AI response"}'
    
    def _validate_improved_resume(self, improved_resume: Dict[str, Any], original_resume: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and enhance the improved resume to match frontend format exactly
        
        Args:
            improved_resume: The generated improved resume
            original_resume: The original resume for comparison
            
        Returns:
            Validated and enhanced resume in frontend format
        """
        import uuid
        
        # Ensure all required frontend fields are present with correct structure
        frontend_format = {
            "basicDetails": {
                "fullName": "",
                "professionalTitle": "",
                "phone": "",
                "email": "",
                "location": "",
                "website": "",
                "github": "",
                "linkedin": "",
                "profilePicture": ""
            },
            "summary": "",
            "objective": "",
            "experience": [],
            "education": [],
            "skills": {},
            "languages": [],
            "activities": [],
            "projects": [],
            "certifications": [],
            "references": [],
            "customSections": []
        }
        
        # Map basicDetails from original resume data (preserve original data)
        if "basic_details" in original_resume and isinstance(original_resume["basic_details"], dict):
            basic_details = original_resume["basic_details"]
            frontend_format["basicDetails"] = {
                "fullName": basic_details.get("full_name", basic_details.get("name", "")),
                "professionalTitle": basic_details.get("professional_title", ""),
                "phone": basic_details.get("phone", ""),
                "email": basic_details.get("email", ""),
                "location": basic_details.get("location", ""),
                "website": basic_details.get("website", ""),
                "github": basic_details.get("github", ""),
                "linkedin": basic_details.get("linkedin", ""),
                "profilePicture": basic_details.get("profilePicture", "")
            }
        elif "basicDetails" in original_resume and isinstance(original_resume["basicDetails"], dict):
            # If original already has basicDetails format, use it directly
            frontend_format["basicDetails"] = original_resume["basicDetails"]
        
        # Map other fields - prioritize improved data for score enhancement
        frontend_format["summary"] = improved_resume.get("summary") or original_resume.get("summary", "")
        frontend_format["objective"] = improved_resume.get("objective") or original_resume.get("objective", "")
        
        # Skills section - use improved skills if available, otherwise use original
        improved_skills = improved_resume.get("skills")
        original_skills = original_resume.get("skills")
        
        if improved_skills:
            # Use AI-enhanced skills (already merged with existing skills)
            frontend_format["skills"] = improved_skills
        elif original_skills:
            # Use original skills if no improvements
            frontend_format["skills"] = original_skills
        else:
            # No skills section exists, leave empty
            frontend_format["skills"] = {}
        
        # Map experience with IDs - prioritize improved data if available
        if "experience" in improved_resume and isinstance(improved_resume["experience"], list):
            for i, exp in enumerate(improved_resume["experience"]):
                if isinstance(exp, dict):
                    frontend_format["experience"].append({
                        "id": str(uuid.uuid4()),
                        "company": exp.get("company", ""),
                        "position": exp.get("role", exp.get("position", "")),
                        "startDate": exp.get("start_date", exp.get("startDate", "")),
                        "endDate": exp.get("end_date", exp.get("endDate", "")),
                        "description": exp.get("description", ""),
                        "location": exp.get("location", "")
                    })
        elif "experience" in original_resume and isinstance(original_resume["experience"], list):
            for i, exp in enumerate(original_resume["experience"]):
                if isinstance(exp, dict):
                    frontend_format["experience"].append({
                        "id": str(uuid.uuid4()),
                        "company": exp.get("company", ""),
                        "position": exp.get("role", exp.get("position", "")),
                        "startDate": exp.get("start_date", exp.get("startDate", "")),
                        "endDate": exp.get("end_date", exp.get("endDate", "")),
                        "description": exp.get("description", ""),
                        "location": exp.get("location", "")
                    })
        
        # Map education with IDs - preserve original data if available
        if "education" in original_resume and isinstance(original_resume["education"], list):
            for i, edu in enumerate(original_resume["education"]):
                if isinstance(edu, dict):
                    frontend_format["education"].append({
                        "id": str(uuid.uuid4()),
                        "institution": edu.get("institution", edu.get("university", "")),
                        "degree": edu.get("degree", ""),
                        "year": edu.get("end_date", edu.get("year", edu.get("graduation_year", ""))),
                        "description": edu.get("description", ""),
                        "grade": edu.get("grade", ""),
                        "location": edu.get("location", "")
                    })
        elif "education" in improved_resume and isinstance(improved_resume["education"], list):
            for i, edu in enumerate(improved_resume["education"]):
                if isinstance(edu, dict):
                    frontend_format["education"].append({
                        "id": str(uuid.uuid4()),
                        "institution": edu.get("institution", edu.get("university", "")),
                        "degree": edu.get("degree", ""),
                        "year": edu.get("year", edu.get("graduation_year", "")),
                        "description": edu.get("description", ""),
                        "grade": edu.get("grade", ""),
                        "location": edu.get("location", "")
                    })
        
        # Map languages
        if "languages" in improved_resume and isinstance(improved_resume["languages"], list):
            for lang in improved_resume["languages"]:
                if isinstance(lang, dict):
                    frontend_format["languages"].append({
                        "name": lang.get("name", ""),
                        "proficiency": lang.get("proficiency", lang.get("profeciency", ""))
                    })
        
        # Map activities (if any)
        if "activities" in improved_resume and isinstance(improved_resume["activities"], list):
            for i, activity in enumerate(improved_resume["activities"]):
                if isinstance(activity, dict):
                    frontend_format["activities"].append({
                        "id": str(uuid.uuid4()),
                        "title": activity.get("title", ""),
                        "description": activity.get("description", "")
                    })
        
        # Map projects with IDs - prioritize improved data
        if "projects" in improved_resume and isinstance(improved_resume["projects"], list):
            for i, project in enumerate(improved_resume["projects"]):
                if isinstance(project, dict):
                    # Convert tech stack to string if it's an array
                    tech_stack = project.get("tech_stack", project.get("technologies", project.get("techStack", "")))
                    if isinstance(tech_stack, list):
                        tech_stack = ", ".join(tech_stack)
                    
                    # If tech stack is empty, try to extract from description
                    if not tech_stack or tech_stack.strip() == "":
                        description = project.get("description", "")
                        if description:
                            tech_stack = self._extract_tech_stack_from_description(description)
                    
                    # If still empty, generate tech stack based on project name and description
                    if not tech_stack or tech_stack.strip() == "":
                        project_name = project.get("name", "")
                        description = project.get("description", "")
                        if project_name or description:
                            tech_stack = self._generate_tech_stack_for_project(project_name, description, frontend_format.get("skills"))
                    
                    # Ensure project dates are present - add dummy dates if missing
                    start_date = project.get("start_date", project.get("startDate", ""))
                    end_date = project.get("end_date", project.get("endDate", ""))
                    
                    # Keep existing dates or leave empty for AI to generate
                    start_date = start_date or ""
                    end_date = end_date or ""
                    
                    frontend_format["projects"].append({
                        "id": str(uuid.uuid4()),
                        "name": project.get("name", ""),
                        "techStack": tech_stack,
                        "startDate": start_date,
                        "endDate": end_date,
                        "description": project.get("description", ""),
                        "link": project.get("link", "")
                    })
        elif "projects" in original_resume and isinstance(original_resume["projects"], list):
            # Fallback to original projects if no improved projects
            for i, project in enumerate(original_resume["projects"]):
                if isinstance(project, dict):
                    # Convert tech stack to string if it's an array
                    tech_stack = project.get("tech_stack", project.get("technologies", project.get("techStack", "")))
                    if isinstance(tech_stack, list):
                        tech_stack = ", ".join(tech_stack)
                    
                    # If tech stack is empty, try to extract from description
                    if not tech_stack or tech_stack.strip() == "":
                        description = project.get("description", "")
                        if description:
                            tech_stack = self._extract_tech_stack_from_description(description)
                    
                    # If still empty, generate tech stack based on project name and description
                    if not tech_stack or tech_stack.strip() == "":
                        project_name = project.get("name", "")
                        description = project.get("description", "")
                        if project_name or description:
                            tech_stack = self._generate_tech_stack_for_project(project_name, description, frontend_format.get("skills"))
                    
                    frontend_format["projects"].append({
                        "id": str(uuid.uuid4()),
                        "name": project.get("name", ""),
                        "techStack": tech_stack,
                        "startDate": project.get("start_date", project.get("startDate", "")),
                        "endDate": project.get("end_date", project.get("endDate", "")),
                        "description": project.get("description", ""),
                        "link": project.get("link", "")
                    })
        
        # Map certifications with IDs
        if "certifications" in improved_resume and isinstance(improved_resume["certifications"], list):
            for i, cert in enumerate(improved_resume["certifications"]):
                if isinstance(cert, dict):
                    issue_date = cert.get("issueDate", cert.get("startDate", cert.get("start_date", "")))
                    
                    # If issue date is missing, generate a dummy date (6-24 months ago)
                    if not issue_date or issue_date.strip() == "":
                        import random
                        from datetime import datetime, timedelta
                        
                        # Generate a random date between 6-24 months ago
                        months_ago = random.randint(6, 24)
                        dummy_date = datetime.now() - timedelta(days=months_ago * 30)
                        issue_date = dummy_date.strftime("%b %Y")
                    
                    frontend_format["certifications"].append({
                        "id": str(uuid.uuid4()),
                        "certificateName": cert.get("certificateName", cert.get("certificate_name", cert.get("name", ""))),
                        "link": cert.get("link", ""),
                        "issueDate": issue_date,
                        "instituteName": cert.get("instituteName", cert.get("institute_name", cert.get("issuer", "")))
                    })
        elif "certifications" in original_resume and isinstance(original_resume["certifications"], list):
            # Fallback to original certifications if no improved certifications
            for i, cert in enumerate(original_resume["certifications"]):
                if isinstance(cert, dict):
                    issue_date = cert.get("issueDate", cert.get("startDate", cert.get("start_date", "")))
                    
                    # If issue date is missing, generate a dummy date (6-24 months ago)
                    if not issue_date or issue_date.strip() == "":
                        import random
                        from datetime import datetime, timedelta
                        
                        # Generate a random date between 6-24 months ago
                        months_ago = random.randint(6, 24)
                        dummy_date = datetime.now() - timedelta(days=months_ago * 30)
                        issue_date = dummy_date.strftime("%b %Y")
                    
                    frontend_format["certifications"].append({
                        "id": str(uuid.uuid4()),
                        "certificateName": cert.get("certificateName", cert.get("certificate_name", cert.get("name", ""))),
                        "link": cert.get("link", ""),
                        "issueDate": issue_date,
                        "instituteName": cert.get("instituteName", cert.get("institute_name", cert.get("issuer", "")))
                    })
        
        # Map references with IDs
        if "references" in improved_resume and isinstance(improved_resume["references"], list):
            for i, ref in enumerate(improved_resume["references"]):
                if isinstance(ref, dict):
                    frontend_format["references"].append({
                        "id": str(uuid.uuid4()),
                        "name": ref.get("name", ""),
                        "title": ref.get("title", ""),
                        "company": ref.get("company", ""),
                        "phone": ref.get("phone", ""),
                        "email": ref.get("email", ""),
                        "relationship": ref.get("relationship", "")
                    })
        
        # Map custom sections (if any)
        if "customSections" in improved_resume and isinstance(improved_resume["customSections"], list):
            for i, section in enumerate(improved_resume["customSections"]):
                if isinstance(section, dict):
                    frontend_format["customSections"].append({
                        "id": str(uuid.uuid4()),
                        "title": section.get("title", ""),
                        "type": section.get("type", "text"),
                        "position": section.get("position", i),
                        "content": section.get("content", {}),
                        "styling": section.get("styling", {})
                    })
        
        # Apply date format fixes to ensure all dates are in "MMM YYYY" format
        frontend_format = self._fix_date_formats(frontend_format)
        
        logger.info("Successfully converted resume to frontend format")
        return frontend_format
    
    def _fix_date_formats(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fix all date formats to ensure they are in "MMM YYYY" format (e.g., "Jan 2025", "Dec 2024")
        
        Args:
            resume_data: Resume data dictionary
            
        Returns:
            Resume data with corrected date formats
        """
        import re
        from datetime import datetime
        
        # Month mapping for conversion
        month_mapping = {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
            '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr',
            '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug',
            '9': 'Sep'
        }
        
        full_month_mapping = {
            'january': 'Jan', 'february': 'Feb', 'march': 'Mar', 'april': 'Apr',
            'may': 'May', 'june': 'Jun', 'july': 'Jul', 'august': 'Aug',
            'september': 'Sep', 'october': 'Oct', 'november': 'Nov', 'december': 'Dec'
        }
        
        def convert_date_format(date_str: str) -> str:
            """Convert various date formats to MMM YYYY format"""
            if not date_str or not isinstance(date_str, str):
                return date_str
                
            date_str = date_str.strip()
            
            # Already in correct format (MMM YYYY)
            if re.match(r'^[A-Za-z]{3}\s+\d{4}$', date_str):
                return date_str.title()
            
            # Format: YYYY-MM or YYYY/MM or YYYY.MM
            match = re.match(r'^(\d{4})[-/.](\d{1,2})$', date_str)
            if match:
                year, month = match.groups()
                month_abbr = month_mapping.get(month.zfill(2), month)
                return f"{month_abbr} {year}"
            
            # Format: MM/YYYY or MM-YYYY or MM.YYYY
            match = re.match(r'^(\d{1,2})[-/.](\d{4})$', date_str)
            if match:
                month, year = match.groups()
                month_abbr = month_mapping.get(month.zfill(2), month)
                return f"{month_abbr} {year}"
            
            # Format: Full month name YYYY (e.g., "January 2025")
            match = re.match(r'^([A-Za-z]+)\s+(\d{4})$', date_str)
            if match:
                month_name, year = match.groups()
                month_abbr = full_month_mapping.get(month_name.lower(), month_name)
                return f"{month_abbr} {year}"
            
            # Format: Just year (e.g., "2025")
            if re.match(r'^\d{4}$', date_str):
                return f"Jan {date_str}"
            
            # If no pattern matches, return as is
            return date_str
        
        # Fix dates in experience section
        if 'experience' in resume_data and isinstance(resume_data['experience'], list):
            for exp in resume_data['experience']:
                if isinstance(exp, dict):
                    if 'startDate' in exp:
                        exp['startDate'] = convert_date_format(exp['startDate'])
                    if 'endDate' in exp:
                        exp['endDate'] = convert_date_format(exp['endDate'])
        
        # Fix dates in education section
        if 'education' in resume_data and isinstance(resume_data['education'], list):
            for edu in resume_data['education']:
                if isinstance(edu, dict):
                    if 'year' in edu:
                        edu['year'] = convert_date_format(edu['year'])
        
        # Fix dates in projects section
        if 'projects' in resume_data and isinstance(resume_data['projects'], list):
            for project in resume_data['projects']:
                if isinstance(project, dict):
                    if 'startDate' in project:
                        project['startDate'] = convert_date_format(project['startDate'])
                    if 'endDate' in project:
                        project['endDate'] = convert_date_format(project['endDate'])
        
        # Fix dates in certifications section
        if 'certifications' in resume_data and isinstance(resume_data['certifications'], list):
            for cert in resume_data['certifications']:
                if isinstance(cert, dict):
                    if 'issueDate' in cert:
                        cert['issueDate'] = convert_date_format(cert['issueDate'])
        
        # Fix dates in custom sections
        if 'customSections' in resume_data and isinstance(resume_data['customSections'], list):
            for section in resume_data['customSections']:
                if isinstance(section, dict) and 'content' in section:
                    content = section['content']
                    if isinstance(content, dict) and 'items' in content:
                        for item in content['items']:
                            if isinstance(item, dict):
                                if 'startDate' in item:
                                    item['startDate'] = convert_date_format(item['startDate'])
                                if 'endDate' in item:
                                    item['endDate'] = convert_date_format(item['endDate'])
        
        return resume_data

    def _extract_tech_stack_from_description(self, description: str) -> str:
        """
        Extract tech stack from project description using AI analysis
        
        Args:
            description: Project description text
            
        Returns:
            Comma-separated string of technologies found
        """
        if not description or not description.strip():
            return ""
        
        try:
            prompt = f"""
            Analyze the following project description and extract all technologies, frameworks, programming languages, tools, and platforms mentioned.
            
            PROJECT DESCRIPTION:
            {description}
            
            Return ONLY a comma-separated list of technologies found. Do not include explanations or additional text.
            Examples of what to extract:
            - Programming languages: Python, JavaScript, Java, C++, etc.
            - Frameworks: React, Angular, Django, Spring, etc.
            - Databases: MySQL, MongoDB, PostgreSQL, etc.
            - Cloud platforms: AWS, Azure, GCP, etc.
            - Tools: Docker, Kubernetes, Git, Jenkins, etc.
            - Libraries: NumPy, Pandas, Express.js, etc.
            
            If no technologies are found, return an empty string.
            """
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                top_p=0.8,
                max_tokens=200
            )
            
            tech_stack = response.choices[0].message.content.strip()
            
            # Clean up the response
            tech_stack = tech_stack.replace('"', '').replace("'", "").strip()
            
            # Remove any non-technology words and clean up
            tech_terms = []
            for term in tech_stack.split(','):
                term = term.strip()
                if term and len(term) > 1 and not term.lower() in ['and', 'or', 'with', 'using', 'built', 'developed', 'created']:
                    tech_terms.append(term)
            
            return ', '.join(tech_terms) if tech_terms else ""
            
        except Exception as e:
            logger.warning(f"Failed to extract tech stack from description: {e}")
            return ""

    def _generate_tech_stack_for_project(self, project_name: str, description: str, skills: Any = None) -> str:
        """
        Generate appropriate tech stack for a project based on name, description, and existing skills
        
        Args:
            project_name: Name of the project
            description: Project description
            skills: Existing skills from resume (optional)
            
        Returns:
            Comma-separated string of suggested technologies
        """
        try:
            # Extract skills from the skills object if provided
            skill_list = []
            if skills:
                if isinstance(skills, dict):
                    for category, skill_array in skills.items():
                        if isinstance(skill_array, list):
                            skill_list.extend(skill_array)
                elif isinstance(skills, list):
                    skill_list = skills
            
            skills_text = ", ".join(skill_list) if skill_list else "No specific skills mentioned"
            
            prompt = f"""
            Based on the project name, description, and available skills, suggest an appropriate tech stack.
            
            PROJECT NAME: {project_name}
            PROJECT DESCRIPTION: {description}
            AVAILABLE SKILLS: {skills_text}
            
            Return ONLY a comma-separated list of 3-6 relevant technologies that would be appropriate for this project.
            Choose technologies that:
            1. Match the project description and requirements
            2. Are commonly used together
            3. Are relevant to the project type
            4. Include both frontend and backend technologies if applicable
            
            Examples:
            - Web app: "React, Node.js, MongoDB, Express.js, AWS"
            - Data science: "Python, Pandas, NumPy, Jupyter, Scikit-learn"
            - Mobile app: "React Native, JavaScript, Firebase, Redux"
            - Backend API: "Python, Django, PostgreSQL, Docker, AWS"
            
            If no clear technologies can be determined, return an empty string.
            """
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                top_p=0.8,
                max_tokens=150
            )
            
            tech_stack = response.choices[0].message.content.strip()
            
            # Clean up the response
            tech_stack = tech_stack.replace('"', '').replace("'", "").strip()
            
            # Remove any non-technology words and clean up
            tech_terms = []
            for term in tech_stack.split(','):
                term = term.strip()
                if term and len(term) > 1 and not term.lower() in ['and', 'or', 'with', 'using', 'built', 'developed', 'created']:
                    tech_terms.append(term)
            
            return ', '.join(tech_terms) if tech_terms else ""
            
        except Exception as e:
            logger.warning(f"Failed to generate tech stack for project: {e}")
            return ""
    
    def get_improvement_summary(self, original_resume: Dict[str, Any], improved_resume: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a summary of improvements made to the resume
        
        Args:
            original_resume: Original resume data
            improved_resume: Improved resume data
            
        Returns:
            Summary of improvements
        """
        summary = {
            "improvement_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "fields_improved": [],
            "total_changes": 0,
            "improvement_areas": []
        }
        
        # Compare fields and identify improvements
        for key, original_value in original_resume.items():
            if key in improved_resume:
                improved_value = improved_resume[key]
                
                # Simple comparison (can be enhanced with more sophisticated diffing)
                if str(original_value) != str(improved_value):
                    summary["fields_improved"].append(key)
                    summary["total_changes"] += 1
        
        # Identify improvement areas based on common resume sections
        improvement_areas = []
        if "experience" in summary["fields_improved"]:
            improvement_areas.append("Professional Experience")
        if "skills" in summary["fields_improved"]:
            improvement_areas.append("Skills Section")
        if "summary" in summary["fields_improved"]:
            improvement_areas.append("Professional Summary")
        if "education" in summary["fields_improved"]:
            improvement_areas.append("Education")
        
        summary["improvement_areas"] = improvement_areas
        
        return summary
    
    def _debug_repetition_changes(self, original_resume: Dict[str, Any], improved_resume: Dict[str, Any]) -> None:
        """
        Debug method to analyze repetition changes between original and improved resume
        
        Args:
            original_resume: Original resume data
            improved_resume: Improved resume data
        """
        logger.info("🔍 DEBUG: Starting repetition changes analysis")
        
        # Define the repeated words we're looking for (from the debug logs)
        repeated_words = [
            'scalable', 'secure', 'microservices', 'efficient', 'improved', 'created', 
            'deployed', 'automated', 'collaborated', 'optimized', 'integrated', 
            'designed', 'managed', 'resolved', 'achieved'
        ]
        
        # Check experience section
        if 'experience' in original_resume and 'experience' in improved_resume:
            logger.info("🔍 DEBUG: Analyzing experience section for repetition changes")
            original_exp = original_resume['experience']
            improved_exp = improved_resume['experience']
            
            if isinstance(original_exp, list) and isinstance(improved_exp, list):
                for i, (orig_exp, imp_exp) in enumerate(zip(original_exp, improved_exp)):
                    if isinstance(orig_exp, dict) and isinstance(imp_exp, dict):
                        orig_desc = orig_exp.get('description', '')
                        imp_desc = imp_exp.get('description', '')
                        
                        logger.info(f"🔍 DEBUG: Experience {i+1} - Company: {orig_exp.get('company', 'Unknown')}")
                        
                        # Count repeated words in original and improved
                        for word in repeated_words:
                            orig_count = orig_desc.lower().count(word.lower())
                            imp_count = imp_desc.lower().count(word.lower())
                            
                            if orig_count > 0 or imp_count > 0:
                                logger.info(f"🔍 DEBUG:   Word '{word}': Original={orig_count}, Improved={imp_count}")
                                if orig_count > imp_count:
                                    logger.info(f"🔍 DEBUG:     ✅ REPETITION REDUCED for '{word}'")
                                elif orig_count == imp_count:
                                    logger.info(f"🔍 DEBUG:     ⚠️ NO CHANGE for '{word}'")
                                else:
                                    logger.info(f"🔍 DEBUG:     ❌ REPETITION INCREASED for '{word}'")
        
        # Check projects section
        if 'projects' in original_resume and 'projects' in improved_resume:
            logger.info("🔍 DEBUG: Analyzing projects section for repetition changes")
            original_proj = original_resume['projects']
            improved_proj = improved_resume['projects']
            
            if isinstance(original_proj, list) and isinstance(improved_proj, list):
                for i, (orig_proj, imp_proj) in enumerate(zip(original_proj, improved_proj)):
                    if isinstance(orig_proj, dict) and isinstance(imp_proj, dict):
                        orig_desc = orig_proj.get('description', '')
                        imp_desc = imp_proj.get('description', '')
                        
                        logger.info(f"🔍 DEBUG: Project {i+1} - Name: {orig_proj.get('name', 'Unknown')}")
                        
                        # Count repeated words in original and improved
                        for word in repeated_words:
                            orig_count = orig_desc.lower().count(word.lower())
                            imp_count = imp_desc.lower().count(word.lower())
                            
                            if orig_count > 0 or imp_count > 0:
                                logger.info(f"🔍 DEBUG:   Word '{word}': Original={orig_count}, Improved={imp_count}")
                                if orig_count > imp_count:
                                    logger.info(f"🔍 DEBUG:     ✅ REPETITION REDUCED for '{word}'")
                                elif orig_count == imp_count:
                                    logger.info(f"🔍 DEBUG:     ⚠️ NO CHANGE for '{word}'")
                                else:
                                    logger.info(f"🔍 DEBUG:     ❌ REPETITION INCREASED for '{word}'")
        
        # Check summary section
        if 'summary' in original_resume and 'summary' in improved_resume:
            logger.info("🔍 DEBUG: Analyzing summary section for repetition changes")
            orig_summary = original_resume.get('summary', '')
            imp_summary = improved_resume.get('summary', '')
            
            for word in repeated_words:
                orig_count = orig_summary.lower().count(word.lower())
                imp_count = imp_summary.lower().count(word.lower())
                
                if orig_count > 0 or imp_count > 0:
                    logger.info(f"🔍 DEBUG: Summary - Word '{word}': Original={orig_count}, Improved={imp_count}")
                    if orig_count > imp_count:
                        logger.info(f"🔍 DEBUG:   ✅ REPETITION REDUCED for '{word}'")
                    elif orig_count == imp_count:
                        logger.info(f"🔍 DEBUG:   ⚠️ NO CHANGE for '{word}'")
                    else:
                        logger.info(f"🔍 DEBUG:   ❌ REPETITION INCREASED for '{word}'")
        
        logger.info("🔍 DEBUG: Repetition changes analysis completed")



