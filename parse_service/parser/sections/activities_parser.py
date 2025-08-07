import re

def parse_activities_section(text):
    """Parse activities/projects section"""
    activities = []
    
    if not text:
        return activities
    
    lines = text.split('\n')
    current_activity = {
        "id": "",
        "title": "",
        "description": ""
    }
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        
        # Check if this looks like a new activity/project
        if is_new_activity_entry(line_stripped):
            if current_activity["title"]:
                current_activity["id"] = str(len(activities) + 1)
                activities.append(current_activity.copy())
            current_activity = {
                "id": "",
                "title": "",
                "description": ""
            }
            current_activity["title"] = line_stripped
        else:
            if current_activity["description"]:
                current_activity["description"] += " " + line_stripped
            else:
                current_activity["description"] = line_stripped
    
    # Add the last activity
    if current_activity["title"]:
        current_activity["id"] = str(len(activities) + 1)
        activities.append(current_activity)
    
    # If no activities were found but we have text, try to parse it as projects
    if not activities and text.strip():
        # Split by double newlines (common project separator)
        project_parts = text.split('\n\n')
        for i, part in enumerate(project_parts):
            if part.strip():
                lines = part.strip().split('\n')
                if lines:
                    # First line is usually the project title
                    title = lines[0].strip()
                    # Rest is description
                    description = ' '.join(lines[1:]).strip() if len(lines) > 1 else ""
                    
                    # Clean up title (remove extra spaces, etc.)
                    title = ' '.join(title.split())
                    
                    activities.append({
                        "id": str(i + 1),
                        "title": title,
                        "description": description
                    })
    
    # If still no activities, try splitting by project names
    if not activities and text.strip():
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
                    
                    activities.append({
                        "id": str(i + 1),
                        "title": project_name.strip(),
                        "description": description
                    })
    
    return activities

def is_new_activity_entry(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in ['project', 'developed', 'built', 'created', 'cropify', 'globevista', 'shopease'])

def is_project_content(text):
    """Check if text content looks like project descriptions"""
    text_lower = text.lower()
    
    # Summary indicators - if these are present, it's likely summary content
    summary_keywords = [
        'professional', 'experienced', 'passionate', 'dedicated', 'motivated',
        'seeking', 'opportunity', 'career', 'position', 'role', 'team',
        'collaborative', 'detail-oriented', 'results-driven', 'problem-solving',
        'communication', 'leadership', 'management', 'analytical', 'creative'
    ]
    
    # Project indicators
    project_keywords = [
        'developed', 'built', 'created', 'implemented', 'designed',
        'reactjs', 'nodejs', 'mongodb', 'expressjs', 'python',
        'javascript', 'java', 'sql', 'django', 'tailwind', 'bootstrap',
        'sourcecode', 'github', 'portfolio', 'project'
    ]
    
    # Check if text contains summary-related keywords
    has_summary_keywords = any(keyword in text_lower for keyword in summary_keywords)
    
    # Check if text contains project-related keywords
    has_project_keywords = any(keyword in text_lower for keyword in project_keywords)
    
    # Check if text contains technology stacks (common in project descriptions)
    tech_keywords = ['react', 'node', 'mongodb', 'express', 'python', 'javascript', 'java', 'sql', 'django']
    has_tech_stack = any(tech in text_lower for tech in tech_keywords)
    
    # Check if text is long and descriptive (typical of project descriptions)
    is_descriptive = len(text) > 100
    
    # Check for project-specific patterns
    has_project_patterns = (
        'developed' in text_lower or 
        'built' in text_lower or 
        'created' in text_lower or
        'implemented' in text_lower or
        'designed' in text_lower
    )
    
    # If text has summary keywords, it's likely summary content
    if has_summary_keywords and not has_project_patterns:
        return False
    
    # If text has strong project patterns, it's likely project content
    if has_project_patterns and has_tech_stack:
        return True
    
    # If text has project keywords and is descriptive, it's likely project content
    if has_project_keywords and is_descriptive and has_tech_stack:
        return True
    
    # Default: if it has tech stack and is descriptive, treat as project
    return has_tech_stack and is_descriptive 