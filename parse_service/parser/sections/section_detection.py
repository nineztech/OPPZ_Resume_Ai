# Mapping from raw headings to normalized section names
SECTION_HEADERS = {
    "summary": ["about me", "summary", "profile", "objective", "personal statement"],
    "experience": ["experience", "work history", "professional experience", "employment", "work experience"],
    "skills": ["skills", "technical skills", "key skills", "competencies", "expertise"],
    "education": ["education", "academic background", "qualifications", "academic", "degrees"],
    "projects": ["projects", "project", "personal projects", "technical projects", "portfolio", "academic projects"],
    "activities": ["activities", "volunteer work", "community service", "clubs", "organizations"],
    "reference": ["reference", "references", "referees", "professional references", "personal references", "character references"],

    "certificates": ["certificates", "certifications", "achievements", "awards"],
}

# Flatten keywords for fast lookup
ALL_KEYWORDS = [kw for headers in SECTION_HEADERS.values() for kw in headers]

def clean_heading(text):
    return text.strip().lower().replace(":", "")

def match_section(heading):
    heading = clean_heading(heading)
    for section, keywords in SECTION_HEADERS.items():
        if heading in keywords:
            return section
    return None  # Unknown or unsupported heading

def is_section_header(line):
    """Check if a line is likely a section header"""
    line_stripped = line.strip()
    if not line_stripped:
        return False
    
    # Check for all caps (common in resumes)
    if line_stripped.isupper() and len(line_stripped) > 2:
        clean_line = line_stripped.lower().replace(":", "")
        return match_section(clean_line) is not None
    
    # Check for normal case
    clean_line = line_stripped.lower().replace(":", "")
    return match_section(clean_line) is not None

def is_section_header_flexible(line):
    """More flexible section header detection"""
    line_stripped = line.strip()
    if not line_stripped:
        return False
    
    line_lower = line_stripped.lower()
    
    # Check for common section keywords in any case
    section_keywords = [
        'about', 'summary', 'profile', 'objective', 'personal', 'overview',
        'experience', 'work', 'employment', 'professional', 'career',
        'skills', 'technical', 'competencies', 'expertise', 'capabilities',
        'education', 'academic', 'qualifications', 'degrees', 'background',
        'projects', 'project', 'portfolio',
        'activities', 'community', 'service',
        'reference', 'references', 'referees',
        'certificates', 'certifications', 'achievements', 'awards', 'honors'
    ]
    
    # Check if line contains any section keywords
    has_section_keyword = any(keyword in line_lower for keyword in section_keywords)
    
    # Check if line is likely a header (short, starts with capital, not too long)
    is_likely_header = (len(line_stripped) < 40 and 
                       line_stripped[0].isupper() and 
                       not line_stripped.isupper() and
                       not any(char.isdigit() for char in line_stripped))
    
    # Check for common header patterns
    is_header_pattern = (
        # All caps short lines (like "EXPERIENCE")
        (line_stripped.isupper() and len(line_stripped) < 20) or
        # Title case short lines (like "Work Experience")
        (line_stripped.istitle() and len(line_stripped) < 30) or
        # Lines with colons (like "Experience:")
        (':' in line_stripped and len(line_stripped) < 30)
    )
    
    return has_section_keyword or is_likely_header or is_header_pattern 