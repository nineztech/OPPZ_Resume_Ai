import re

def parse_projects_section(text):
    """Parse projects section into structured data"""
    projects = []
    
    if not text:
        return projects
    
    lines = text.split('\n')
    current_project = {
        "id": "",
        "projectName": "",
        "duration": "",
        "link": "",
        "description": ""
    }
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        
        # Check if this looks like a new project entry
        if is_new_project_entry(line_stripped):
            if current_project["projectName"]:
                current_project["id"] = str(len(projects) + 1)
                projects.append(current_project.copy())
            current_project = {
                "id": "",
                "projectName": "",
                "duration": "",
                "link": "",
                "description": ""
            }
            current_project["projectName"] = line_stripped
        else:
            # Check if line contains a link
            if is_link_line(line_stripped):
                current_project["link"] = extract_link(line_stripped)
            # Check if line contains duration/date patterns
            elif is_duration_line(line_stripped):
                current_project["duration"] = line_stripped
            # Otherwise, treat as description
            else:
                if current_project["description"]:
                    current_project["description"] += " " + line_stripped
                else:
                    current_project["description"] = line_stripped
    
    # Add the last project
    if current_project["projectName"]:
        current_project["id"] = str(len(projects) + 1)
        projects.append(current_project)
    
    # If no projects were found but we have text, try to parse it as projects
    if not projects and text.strip():
        # Split by double newlines (common project separator)
        project_parts = text.split('\n\n')
        for i, part in enumerate(project_parts):
            if part.strip():
                lines = part.strip().split('\n')
                if lines:
                    # First line is usually the project name
                    project_name = lines[0].strip()
                    # Rest is description
                    description = ' '.join(lines[1:]).strip() if len(lines) > 1 else ""
                    
                    # Clean up project name (remove extra spaces, etc.)
                    project_name = ' '.join(project_name.split())
                    
                    # Extract link from description if present
                    link = ""
                    if description:
                        link_match = re.search(r'https?://[^\s]+', description)
                        if link_match:
                            link = link_match.group()
                            # Remove link from description
                            description = re.sub(r'https?://[^\s]+', '', description).strip()
                    
                    projects.append({
                        "id": str(i + 1),
                        "projectName": project_name,
                        "duration": "",
                        "link": link,
                        "description": description
                    })
    
    # If still no projects, try splitting by project names with parentheses
    if not projects and text.strip():
        # Look for project names that start with capital letters and contain parentheses
        project_pattern = r'([A-Z][a-zA-Z\s]+)\s*\([^)]+\)'
        matches = re.findall(project_pattern, text)
        
        if matches:
            for i, project_name in enumerate(matches):
                # Find the text after this project name
                start_idx = text.find(project_name)
                if start_idx != -1:
                    # Find the next project or end of text
                    next_project_match = re.search(project_pattern, text[start_idx + len(project_name):])
                    if next_project_match:
                        end_idx = start_idx + len(project_name) + next_project_match.start()
                    else:
                        end_idx = len(text)
                    
                    description = text[start_idx + len(project_name):end_idx].strip()
                    # Clean up description
                    description = re.sub(r'^\s*\([^)]+\)\s*', '', description)
                    
                    # Extract link from description if present
                    link = ""
                    if description:
                        link_match = re.search(r'https?://[^\s]+', description)
                        if link_match:
                            link = link_match.group()
                            # Remove link from description
                            description = re.sub(r'https?://[^\s]+', '', description).strip()
                    
                    projects.append({
                        "id": str(i + 1),
                        "projectName": project_name.strip(),
                        "duration": "",
                        "link": link,
                        "description": description
                    })
    
    return projects

def is_new_project_entry(line):
    line_lower = line.lower()
    
    # Check for project keywords - but be more specific
    project_keywords = ['developed', 'built', 'created', 'implemented', 'designed']
    
    # Check for specific project names (common in resumes)
    specific_projects = ['cropify', 'globevista', 'shopease', 'ecommerce', 'portfolio', 'blog', 'app', 'website']
    
    # Check if line contains project keywords or specific project names
    has_project_keyword = any(keyword in line_lower for keyword in project_keywords)
    has_specific_project = any(project in line_lower for project in specific_projects)
    
    # Check if line starts with capital letters and is short (likely a project title)
    is_capitalized_short = line.strip() and line.strip()[0].isupper() and len(line.strip()) < 50
    
    # Check if line contains technology keywords (indicating a project)
    tech_keywords = ['react', 'node', 'python', 'java', 'javascript', 'django', 'express', 'mongodb']
    has_tech_keyword = any(tech in line_lower for tech in tech_keywords)
    
    # Check for summary keywords that would indicate this is NOT a project
    summary_keywords = ['professional', 'experienced', 'passionate', 'dedicated', 'motivated', 'seeking']
    has_summary_keywords = any(keyword in line_lower for keyword in summary_keywords)
    
    # If line has summary keywords, it's likely not a project entry
    if has_summary_keywords:
        return False
    
    # Check for strong project indicators
    strong_project_indicators = (
        has_project_keyword and has_tech_keyword or
        has_specific_project or
        (is_capitalized_short and has_tech_keyword and not has_summary_keywords)
    )
    
    return strong_project_indicators

def is_link_line(line):
    """Check if line contains a URL link"""
    return re.search(r'https?://[^\s]+', line) is not None

def extract_link(line):
    """Extract URL link from line"""
    link_match = re.search(r'https?://[^\s]+', line)
    if link_match:
        return link_match.group()
    return ""

def is_duration_line(line):
    """Check if line contains duration/date patterns"""
    # Check for year patterns (2024, 2023, etc.)
    has_year = re.search(r'\d{4}', line) is not None
    
    # Check for month patterns
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    has_month = any(month in line.lower() for month in months)
    
    # Check for date keywords
    date_keywords = ['present', 'current', 'to', '-', '–', 'duration', 'period']
    has_date_keyword = any(keyword in line.lower() for keyword in date_keywords)
    
    return has_year or (has_month and has_date_keyword) 