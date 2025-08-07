from .basic_details_parser import extract_contact_info
from .summary_parser import parse_summary_section
from .skills_parser import parse_skills_section
from .education_parser import parse_education_section
from .experience_parser import parse_experience_section
from .activities_parser import parse_activities_section, is_project_content
from .projects_parser import parse_projects_section
from .volunteering_parser import parse_volunteering_section
from .certificates_parser import parse_certificates_section
from .section_detection import is_section_header_flexible

def is_section_header(line: str) -> tuple[bool, str]:
    """
    Improved section header detection that distinguishes between actual headers and content.
    Returns (is_header, section_name)
    """
    line_stripped = line.strip()
    if not line_stripped:
        return False, ""
    
    line_lower = line_stripped.lower()
    
    # Section header patterns - must be standalone and formatted as headers
    section_patterns = {
        # Summary/Profile sections
        "summary": [
            "summary", "about me", "profile", "objective", "about",
            "professional summary", "career summary", "personal summary"
        ],
        # Experience sections  
        "experience": [
            "experience", "work experience", "employment", "work history",
            "professional experience", "career experience"
        ],
        # Skills sections
        "skills": [
            "skills", "technical skills", "competencies", "proficiencies",
            "technical competencies", "core skills"
        ],
        # Education sections
        "education": [
            "education", "academic", "academic background", "qualifications"
        ],
        # Projects/Activities sections
        "activities": [
            "projects", "key projects", "portfolio", "activities",
            "personal projects", "academic projects"
        ],
        # Volunteering sections
        "volunteering": [
            "volunteering", "volunteer", "volunteer work"
        ],
        # Certificates/Awards sections
        "certificates": [
            "achievements", "awards", "certificates", "certifications",
            "honors", "recognition"
        ]
    }
    
    # Check for exact matches in section patterns (most reliable)
    for section_name, patterns in section_patterns.items():
        for pattern in patterns:
            if line_lower == pattern:
                return True, section_name
    
    # Check for ALL CAPS short lines (common resume format) - but be more restrictive
    if (line_stripped.isupper() and len(line_stripped) < 25 and len(line_stripped) > 2):
        for section_name, patterns in section_patterns.items():
            for pattern in patterns:
                if pattern in line_lower:
                    return True, section_name
    
    # Check for Title Case short lines (common resume format) - but be more restrictive
    if (line_stripped.istitle() and len(line_stripped) < 35 and len(line_stripped) > 3):
        for section_name, patterns in section_patterns.items():
            for pattern in patterns:
                if pattern in line_lower:
                    return True, section_name
    
    # Check for lines with section keywords followed by colons or dashes - but be more restrictive
    if any(char in line_stripped for char in [':', '-', '–']):
        # Only consider it a header if it's a short line with a section keyword
        if len(line_stripped) < 30:
            for section_name, patterns in section_patterns.items():
                for pattern in patterns:
                    if pattern in line_lower:
                        return True, section_name
    
    return False, ""

def split_into_sections(text: str) -> dict:
    """Main function to split text into structured sections"""
    # First, split into main sections
    main_sections = {}
    current_section = None
    buffer = []
    
    # Add a default section for content before first section (basic details)
    main_sections["basic_details"] = ""
    basic_details_buffer = []

    lines = text.splitlines()
    
    # Debug: Print first few lines to see what we're working with
    print("DEBUG: First 10 lines of text:")
    for i, line in enumerate(lines[:10]):
        print(f"Line {i}: '{line}'")

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:  # Skip empty lines
            continue
            
        # Use improved section header detection
        is_header, detected_section = is_section_header(line_stripped)
        
        # Debug: Print potential headers
        if is_header:
            print(f"DEBUG: Section header detected: '{line_stripped}' -> {detected_section}")
        
        if is_header and detected_section:
            # Save previous section
            if current_section and buffer:
                main_sections[current_section] = "\n".join(buffer).strip()
                print(f"DEBUG: Saved section '{current_section}' with {len(buffer)} lines")
                buffer = []
            elif not current_section and basic_details_buffer:
                main_sections["basic_details"] = "\n".join(basic_details_buffer).strip()
                print(f"DEBUG: Saved basic_details with {len(basic_details_buffer)} lines")
                basic_details_buffer = []

            # Set new section
            current_section = detected_section
            print(f"DEBUG: Set current section to: {current_section}")
        else:
            # This line is content, not a header
            if current_section:
                buffer.append(line_stripped)
            else:
                basic_details_buffer.append(line_stripped)

    # Save last section
    if current_section and buffer:
        main_sections[current_section] = "\n".join(buffer).strip()
        print(f"DEBUG: Saved final section '{current_section}' with {len(buffer)} lines")
    elif not current_section and basic_details_buffer:
        main_sections["basic_details"] = "\n".join(basic_details_buffer).strip()
        print(f"DEBUG: Saved final basic_details with {len(basic_details_buffer)} lines")

    # Debug: Print all detected sections
    print("DEBUG: All detected sections:")
    for section_name, content in main_sections.items():
        print(f"  {section_name}: {len(content)} characters")

    # Now parse each section into structured data
    structured_sections = {
        "basicDetails": extract_contact_info(main_sections.get("basic_details", "")),
        "summary": parse_summary_section(main_sections.get("summary", "")),
        "objective": "",  # Will be empty if not found
        "experience": parse_experience_section(main_sections.get("experience", "")),
        "education": parse_education_section(main_sections.get("education", "")),
        "skills": [],
        "languages": [],
        "activities": parse_activities_section(main_sections.get("activities", "")),
        "projects": parse_projects_section(main_sections.get("activities", "")),  # Parse same content as projects
        "volunteering": parse_volunteering_section(main_sections.get("volunteering", "")),
        "certificates": parse_certificates_section(main_sections.get("certificates", ""))
    }
    
    # Post-process: Check if summary content is actually project content
    summary_content = structured_sections["summary"]
    if summary_content and is_project_content(summary_content):
        print("DEBUG: Summary content detected as project content, moving to activities")
        # Move project content from summary to activities
        structured_sections["activities"] = parse_activities_section(summary_content)
        structured_sections["summary"] = ""  # Clear summary if it was actually projects
    
    # Also check if basic_details contains project content (common when no section headers are used)
    basic_details_content = main_sections.get("basic_details", "")
    if basic_details_content and is_project_content(basic_details_content):
        print("DEBUG: Basic details content detected as project content, moving to activities")
        # Extract contact info first
        contact_info = extract_contact_info(basic_details_content)
        structured_sections["basicDetails"] = contact_info
        
        # Parse remaining content as activities
        remaining_content = basic_details_content
        # Remove contact info lines from remaining content
        lines = basic_details_content.split('\n')
        contact_lines = []
        for line in lines:
            if any(keyword in line.lower() for keyword in ['@', '+', 'phone', 'email', 'address', 'location']):
                contact_lines.append(line)
        
        # Remove contact lines from remaining content
        for line in contact_lines:
            remaining_content = remaining_content.replace(line, '')
        
        if remaining_content.strip():
            structured_sections["activities"] = parse_activities_section(remaining_content.strip())
    
    # Parse skills section
    skills_text = main_sections.get("skills", "")
    if skills_text:
        skills, languages = parse_skills_section(skills_text)
        structured_sections["skills"] = skills
        structured_sections["languages"] = languages

    return structured_sections 