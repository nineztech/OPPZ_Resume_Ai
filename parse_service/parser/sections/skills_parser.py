import re

def parse_skills_section(text):
    """Parse skills section into skills and languages"""
    skills = []
    languages = []
    
    if not text:
        return skills, languages
    
    lines = text.split('\n')
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        
        line_lower = line_stripped.lower()
        
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
        
        if any(lang in line_lower for lang in language_keywords):
            languages.append(line_stripped)
        else:
            # Split by common delimiters
            skill_parts = re.split(r'[,;|]', line_stripped)
            for skill in skill_parts:
                skill_clean = skill.strip()
                if skill_clean and len(skill_clean) < 50:
                    skills.append(skill_clean)
    
    return skills, languages 