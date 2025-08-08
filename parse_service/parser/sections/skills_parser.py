import re

def parse_skills_section(text):
    """Parse skills section into skills and languages"""
    skills = []
    languages = []
    
    if not text:
        return skills, languages
    
    lines = text.split('\n')
    in_skills_section = False
    current_category = None
    
    # Proficiency keywords for language detection
    proficiency_keywords = {
        'native': ['native', 'mother tongue', 'first language', 'fluent', 'excellent'],
        'advanced': ['advanced', 'proficient', 'very good', 'expert', 'professional'],
        'intermediate': ['intermediate', 'good', 'moderate', 'conversational', 'working'],
        'basic': ['basic', 'beginner', 'elementary', 'limited', 'fair']
    }
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        
        line_lower = line_stripped.lower()
        
        # Check if we've reached the end of skills section
        # Look for section headers that indicate we're moving to a different section
        section_end_keywords = ['project', 'education', 'experience', 'certificates', 'activities']
        if any(keyword in line_lower for keyword in section_end_keywords):
            # Check if this is actually a section header (not just content containing these words)
            if (line_stripped.isupper() or 
                (line_stripped.istitle() and len(line_stripped) < 30) or 
                (line_stripped.endswith(':') and len(line_stripped) < 30) or
                (len(line_stripped) < 25 and any(keyword in line_lower for keyword in section_end_keywords))):
                print(f"DEBUG: Stopping skills parsing at line: '{line_stripped}'")
                break  # Stop parsing skills when we hit another section
        
        # Check if line contains language keywords
        language_keywords = [
            'english', 'spanish', 'french', 'german', 'hindi', 'gujarati', 
            'marathi', 'tamil', 'telugu', 'kannada', 'malayalam', 'punjabi',
            'bengali', 'urdu', 'arabic', 'chinese', 'japanese', 'korean',
            'russian', 'portuguese', 'italian', 'dutch', 'swedish', 'norwegian',
            'danish', 'finnish', 'polish', 'czech', 'hungarian', 'romanian',
            'bulgarian', 'croatian', 'serbian', 'slovak', 'slovenian', 'estonian',
            'latvian', 'lithuanian', 'maltese', 'greek', 'turkish', 'hebrew',
            'thai', 'vietnamese', 'indonesian', 'malay', 'filipino', 'tagalog',
            'swahili', 'zulu', 'afrikaans', 'amharic', 'yoruba', 'igbo', 'hausa'
        ]
        
        # Check if this line is a category header (ends with colon)
        if line_stripped.endswith(':') and len(line_stripped) < 50:
            current_category = line_stripped[:-1].strip()  # Remove the colon
            continue
        
        # Check if line contains language keywords
        if any(lang in line_lower for lang in language_keywords):
            # Try to parse individual language-proficiency pairs
            # Look for patterns like "Language (Proficiency)" or "Language: Proficiency"
            language_pattern = r'(\b\w+)\s*[\(:]\s*(fluent|native|advanced|intermediate|basic|excellent|proficient|good|moderate|conversational|working|beginner|elementary|limited|fair|mother tongue|first language|very good|expert|professional)\s*[\):]'
            
            matches = re.findall(language_pattern, line_lower)
            if matches:
                for language, proficiency in matches:
                    # Check if the detected language is in our language keywords
                    if language in [lang.lower() for lang in language_keywords]:
                        # Map proficiency to standard levels
                        if proficiency in ['native', 'mother tongue', 'first language']:
                            mapped_proficiency = 'native'
                        elif proficiency in ['fluent', 'excellent']:
                            mapped_proficiency = 'fluent'
                        elif proficiency in ['advanced', 'proficient', 'expert', 'professional', 'very good']:
                            mapped_proficiency = 'advanced'
                        elif proficiency in ['intermediate', 'good', 'moderate', 'conversational', 'working']:
                            mapped_proficiency = 'intermediate'
                        elif proficiency in ['basic', 'beginner', 'elementary', 'limited', 'fair']:
                            mapped_proficiency = 'basic'
                        else:
                            mapped_proficiency = 'intermediate'
                        
                        language_obj = {
                            'language': language.title(),
                            'proficiency': mapped_proficiency
                        }
                        languages.append(language_obj)
            else:
                # Fallback to the old method if no specific patterns found
                detected_languages = []
                for lang in language_keywords:
                    if lang in line_lower:
                        detected_languages.append(lang.title())
                
                # Detect proficiency level for the entire line
                detected_proficiency = 'intermediate'  # default proficiency
                for level, keywords in proficiency_keywords.items():
                    if any(keyword in line_lower for keyword in keywords):
                        detected_proficiency = level
                        break
                
                # Create language objects for each detected language
                for detected_language in detected_languages:
                    language_obj = {
                        'language': detected_language,
                        'proficiency': detected_proficiency
                    }
                    languages.append(language_obj)
        else:
            # Split by common delimiters
            skill_parts = re.split(r'[,;|]', line_stripped)
            for skill in skill_parts:
                skill_clean = skill.strip()
                if skill_clean and len(skill_clean) < 50:
                    # Skip if it looks like a category header or section title
                    if not (skill_clean.endswith(':') or 
                           skill_clean.isupper() or 
                           (skill_clean.istitle() and len(skill_clean) < 30) or
                           skill_clean.lower() in ['project', 'education', 'experience', 'certificates', 'activities']):
                        skills.append(skill_clean)
    
    return skills, languages 