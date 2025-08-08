import re

def parse_projects_section(text):
    projects = []
    lines = text.split("\n")

    buffer = []
    current_project_index = 1

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Check if this line starts a new project
        if is_project_title(line_stripped):
            # Process previous project if buffer has content
            if buffer:
                parsed = parse_project_block("\n".join(buffer), current_project_index)
                if parsed:
                    projects.append(parsed)
                    current_project_index += 1
                buffer = []
            # Start new project
            buffer.append(line_stripped)
        else:
            # Add to current project buffer
            buffer.append(line_stripped)

    # Process the last project
    if buffer:
        parsed = parse_project_block("\n".join(buffer), current_project_index)
        if parsed:
            projects.append(parsed)

    return projects

def is_project_title(line):
    # Check for numbered/bulleted project titles
    if re.match(r'^[-*•\d.]+\s+', line):
        return True
    
    # Check for project titles with technologies in parentheses
    # Pattern: ProjectName (Tech1, Tech2, Tech3)
    if re.match(r'^[A-Z][A-Za-z0-9\s\-]+\([^)]+\)$', line):
        return True
    
    # Check for project titles that might have technologies in parentheses
    # Pattern: ProjectName (Tech1, Tech2, Tech3) - rest of description
    if re.match(r'^[A-Z][A-Za-z0-9\s\-]+\([^)]+\)', line):
        return True
    
    # Check for title case project names (common format)
    if line.istitle() and len(line.split()) <= 8:
        return True
    
    # Check for project names that start with capital letter and contain typical project name patterns
    if re.match(r'^[A-Z][A-Za-z0-9\s\-:()]+$', line):
        # Additional check to avoid treating descriptions as titles
        if len(line) < 50 and not any(word.lower() in ['technologies', 'description', 'source', 'code', 'link'] for word in line.split()):
            return True
    
    # Check for project names that might be in all caps
    if line.isupper() and len(line) < 30 and len(line.split()) <= 4:
        return True
    
    # Check for lines that start with dash/bullet and contain project-like content
    # This handles the format: "- Project Name – Description"
    if re.match(r'^[-*•]\s+[A-Z]', line):
        return True
    
    return False

def parse_project_block(block, index):
    lines = block.strip().split("\n")
    if not lines:
        return None
    
    title_line = lines[0].strip()
    
    # Extract tech stack if present in parentheses
    tech_stack = ""
    tech_match = re.search(r'\(([^()]+)\)', title_line)
    if tech_match:
        tech_stack = tech_match.group(1).strip()
        # Remove the parentheses part from title
        title_line = re.sub(r'\s*\([^()]+\)\s*', '', title_line).strip()

    # Check if the title line contains an en dash (–) or regular dash (-) separator
    # This indicates title and description are on the same line
    title = title_line
    description = ""
    
    # Look for en dash (–) or regular dash (-) as separator
    dash_patterns = [
        r'^(.+?)\s*[–—]\s*(.+)$',  # en dash or em dash
        r'^(.+?)\s*-\s*(.+)$',      # regular dash
    ]
    
    for pattern in dash_patterns:
        match = re.search(pattern, title_line)
        if match:
            title = match.group(1).strip()
            description = match.group(2).strip()
            break
    
    # If no dash separator found, check if there are additional lines for description
    if not description:
        # Build description from remaining lines, excluding SourceCode links
        desc_lines = []
        for line in lines[1:]:
            line = line.strip()
            # Skip lines that are just "SourceCode" or similar
            if line.lower() in ['sourcecode', 'source code', 'github', 'link']:
                continue
            # Skip date lines and technology lines
            if not extract_start_end_dates(line)[0] and "technolog" not in line.lower():
                desc_lines.append(line)

        description = " ".join(desc_lines).strip()
        
        # Clean up the description - remove any remaining SourceCode references
        description = re.sub(r'\s*SourceCode\s*', '', description, flags=re.IGNORECASE)
        description = re.sub(r'\s*Source Code\s*', '', description, flags=re.IGNORECASE)

    # Extract dates from any of the lines
    start_date, end_date = "", ""
    for line in lines:
        s, e = extract_start_end_dates(line)
        if s or e:
            start_date, end_date = s, e
            break

    return {
        "id": str(index),
        "title": title,
        "start_date": start_date,
        "end_date": end_date,
        "tech_stack": tech_stack,
        "description": description
    }

def extract_start_end_dates(text):
    # Normalize separators
    text = text.lower().replace("–", "-").replace("—", "-").replace(" to ", "-")
    # Examples: Jan 2022 - Dec 2022, 2020 - Present, March 2021 - July 2023
    match = re.search(r'([a-z]{3,9}\s*\d{4}|\d{4})\s*[-]\s*(present|[a-z]{3,9}\s*\d{4}|\d{4})', text, re.IGNORECASE)
    if match:
        start, end = match.groups()
        return start.title().strip(), end.title().strip()
    return "", ""

