import re

def parse_education_section(text):
    """Parse education section into structured data"""
    educations = []
    
    if not text:
        return educations
    
    lines = text.split('\n')
    current_edu = {
        "id": "",
        "institution": "",
        "degree": "",
        "year": "",
        "description": ""
    }
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        # Check if this looks like a new education entry
        if is_new_education_entry(line_stripped):
            if current_edu["institution"] or current_edu["degree"]:
                current_edu["id"] = str(len(educations) + 1)
                educations.append(current_edu.copy())
            current_edu = {
                "id": "",
                "institution": "",
                "degree": "",
                "year": "",
                "description": ""
            }
        
        # Check if line contains both institution and year (common format: "Institution | Year")
        if "|" in line_stripped:
            parts = line_stripped.split("|")
            if len(parts) == 2:
                institution_part = parts[0].strip()
                year_part = parts[1].strip()
                
                # Check if institution part looks like an institution name
                if is_institution_line(institution_part):
                    current_edu["institution"] = extract_institution(institution_part)
                else:
                    current_edu["institution"] = institution_part
                
                # Check if year part contains date patterns
                if is_year_line(year_part):
                    current_edu["year"] = extract_year(year_part)
                else:
                    current_edu["year"] = year_part
                continue
        
        # Check for degree patterns first (like "BTech Computer Science and Engineering")
        if is_degree_line(line_stripped):
            if not current_edu["degree"]:
                current_edu["degree"] = extract_degree(line_stripped)
            else:
                # If we already have a degree, this might be additional info
                if current_edu["description"]:
                    current_edu["description"] += " " + line_stripped
                else:
                    current_edu["description"] = line_stripped
        # Extract institution
        elif is_institution_line(line_stripped):
            current_edu["institution"] = extract_institution(line_stripped)
        # Extract year/GPA/Percentage
        elif is_year_line(line_stripped) or is_gpa_line(line_stripped):
            current_edu["year"] = extract_year(line_stripped)
        # Otherwise, treat as description
        else:
            if current_edu["description"]:
                current_edu["description"] += " " + line_stripped
            else:
                current_edu["description"] = line_stripped
    
    # Add the last education
    if current_edu["institution"] or current_edu["degree"]:
        current_edu["id"] = str(len(educations) + 1)
        educations.append(current_edu)
    
    return educations

def is_new_education_entry(line):
    line_lower = line.lower()
    
    # Check for institution keywords
    institution_keywords = ['university', 'college', 'school', 'institute', 'academy', 'polytechnic']
    has_institution = any(keyword in line_lower for keyword in institution_keywords)
    
    # Check for degree keywords
    degree_keywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 'mba', 'ba', 'ma', 'btech', 'mtech', 'bsc', 'msc']
    has_degree = any(keyword in line_lower for keyword in degree_keywords)
    
    # Check for year patterns
    has_year = re.search(r'\d{4}', line) is not None
    
    # Check if line starts with capital letters (likely institution name)
    starts_with_caps = line and line[0].isupper() and len(line) > 3
    
    # Check if line is significantly shorter than typical description (likely a header)
    is_short = len(line.strip()) < 50
    
    # Check if line contains degree patterns (like "BTech Computer Science and Engineering")
    has_degree_pattern = any(pattern in line_lower for pattern in ['btech', 'mtech', 'bsc', 'msc', 'computer science', 'engineering'])
    
    # New education entry if it has institution keywords OR degree keywords with year OR starts with caps and is short
    # OR if it contains degree patterns
    return (has_institution or 
            (has_degree and has_year) or 
            (starts_with_caps and is_short and not any(word in line_lower for word in ['cgpa', 'gpa', 'percentage', 'percentile'])) or
            has_degree_pattern)

def is_institution_line(line):
    line_lower = line.lower()
    
    # Check for institution keywords
    institution_keywords = ['university', 'college', 'school', 'institute', 'academy', 'polytechnic']
    has_institution_keyword = any(keyword in line_lower for keyword in institution_keywords)
    
    # Check if line contains degree patterns (avoid treating degree names as institutions)
    degree_patterns = ['btech', 'mtech', 'bsc', 'msc', 'computer science', 'engineering', 'bachelor', 'master']
    has_degree_pattern = any(pattern in line_lower for pattern in degree_patterns)
    
    # Check if line contains GPA/percentage patterns (likely not an institution)
    gpa_patterns = ['cgpa', 'gpa', 'percentage', 'percentile']
    has_gpa_pattern = any(pattern in line_lower for pattern in gpa_patterns)
    
    return has_institution_keyword and not has_degree_pattern and not has_gpa_pattern

def extract_institution(line):
    return re.sub(r'Institution|University|School|College|:', '', line, flags=re.IGNORECASE).strip()

def is_degree_line(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in ['bachelor', 'master', 'phd', 'degree', 'diploma', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 'mba', 'ba', 'ma', 'btech', 'mtech', 'bsc', 'msc'])

def extract_degree(line):
    return re.sub(r'Degree|Qualification|Diploma|:', '', line, flags=re.IGNORECASE).strip()

def is_year_line(line):
    return re.search(r'\d{4}', line) is not None

def is_gpa_line(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in ['cgpa', 'gpa', 'percentage', 'percentile'])

def extract_year(line):
    return re.sub(r'Year|Date|Graduated|:', '', line, flags=re.IGNORECASE).strip() 