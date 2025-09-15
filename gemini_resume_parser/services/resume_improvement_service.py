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
        logger.info("Starting resume improvement with ATS suggestions")
        
        # Extract suggestions from ATS analysis
        suggestions = self._extract_suggestions(ats_analysis)
        
        # Generate improved resume
        improved_resume = self._generate_improved_resume(parsed_resume_data, suggestions, ats_analysis)
        
        logger.info("Successfully generated improved resume")
        return improved_resume
    
    def _extract_suggestions(self, ats_analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Extract actionable suggestions from ATS analysis
        
        Args:
            ats_analysis: ATS analysis results
            
        Returns:
            Dictionary of suggestions organized by category
        """
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
            for category, feedback in ats_analysis["detailed_feedback"].items():
                if isinstance(feedback, dict) and "suggestions" in feedback:
                    suggestions[category] = feedback["suggestions"]
        
        # Extract general recommendations
        if "recommendations" in ats_analysis:
            suggestions["general_recommendations"] = ats_analysis["recommendations"]
        
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
        # Detect missing sections
        missing_sections = self._detect_missing_sections(parsed_resume_data)
        
        # Create a comprehensive prompt for resume improvement
        prompt = self._create_improvement_prompt(parsed_resume_data, suggestions, ats_analysis, missing_sections)
        
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
            
            # Parse the improved resume
            improved_resume = json.loads(cleaned_response)
            
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
        You are an expert resume writer and ATS optimization specialist with 15+ years of experience in creating high-impact resumes that pass ATS systems and impress recruiters.

        TASK: Improve the provided resume by applying specific ATS suggestions while maintaining the original structure and content integrity.

        CRITICAL REQUIREMENTS:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations)
        - Maintain the exact same structure as the original parsed resume data
        - Apply suggestions naturally without making the resume sound artificial
        - Preserve all original information while enhancing it
        - Ensure the improved resume is ATS-friendly and professional
        - Keep the same field names and structure as the input
        - For projects: ALWAYS include techStack as a comma-separated string of technologies

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

        IMPROVEMENT GUIDELINES:
        1. ACHIEVEMENTS & IMPACT METRICS:
           - Add specific numbers, percentages, and quantifiable results
           - Use action verbs and measurable outcomes
           - Include timeframes and scale of impact

        2. CLARITY & BREVITY:
           - Make bullet points more concise and impactful
           - Remove redundant words and phrases
           - Use active voice and strong action verbs

        3. FORMATTING & LAYOUT:
           - Ensure ATS-friendly formatting
           - Use standard section headers
           - Maintain consistent spacing and structure

        4. KEYWORD OPTIMIZATION:
           - Integrate relevant industry keywords naturally
           - Use variations of important terms
           - Include both technical and soft skills

        5. REPETITION AVOIDANCE:
           - Vary action verbs and descriptive phrases
           - Use different ways to express similar concepts
           - Avoid repeating the same words or phrases

        6. GRAMMAR & SPELLING:
           - Ensure perfect grammar and spelling
           - Use professional language throughout
           - Maintain consistent tense and formatting

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

        Focus on making specific, measurable improvements while maintaining the professional tone and authenticity of the original resume.
        Ensure all dummy data is realistic and relevant to the person's field and experience level.
        """

        return prompt
    
    def _format_suggestions_for_prompt(self, suggestions: Dict[str, List[str]]) -> str:
        """
        Format suggestions for inclusion in the prompt
        
        Args:
            suggestions: Dictionary of suggestions by category
            
        Returns:
            Formatted suggestions text
        """
        formatted_suggestions = []
        
        for category, suggestion_list in suggestions.items():
            if suggestion_list:
                category_name = category.replace('_', ' ').title()
                formatted_suggestions.append(f"\n{category_name}:")
                for i, suggestion in enumerate(suggestion_list, 1):
                    formatted_suggestions.append(f"  {i}. {suggestion}")
        
        return '\n'.join(formatted_suggestions)
    
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
        
        # Map other fields - preserve original data if available
        frontend_format["summary"] = original_resume.get("summary", improved_resume.get("summary", ""))
        frontend_format["objective"] = original_resume.get("objective", improved_resume.get("objective", ""))
        frontend_format["skills"] = original_resume.get("skills", improved_resume.get("skills", {}))
        
        # Map experience with IDs - preserve original data if available
        if "experience" in original_resume and isinstance(original_resume["experience"], list):
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
        elif "experience" in improved_resume and isinstance(improved_resume["experience"], list):
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
        
        # Map projects with IDs
        if "projects" in improved_resume and isinstance(improved_resume["projects"], list):
            for i, project in enumerate(improved_resume["projects"]):
                if isinstance(project, dict):
                    # Convert tech stack to string if it's an array
                    tech_stack = project.get("tech_stack", project.get("technologies", ""))
                    if isinstance(tech_stack, list):
                        tech_stack = ", ".join(tech_stack)
                    
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
                    frontend_format["certifications"].append({
                        "id": str(uuid.uuid4()),
                        "certificateName": cert.get("certificateName", cert.get("certificate_name", cert.get("name", ""))),
                        "link": cert.get("link", ""),
                        "issueDate": cert.get("issueDate", cert.get("startDate", cert.get("start_date", ""))),
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
        
        logger.info("Successfully converted resume to frontend format")
        return frontend_format
    
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



