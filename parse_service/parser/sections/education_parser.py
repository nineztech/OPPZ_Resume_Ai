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
        "start_date": "",
        "end_date": "",
        "grade": "",
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
                # Check for duplicates before adding
                if not is_duplicate_education(current_edu, educations):
                    educations.append(current_edu.copy())
            current_edu = {
                "id": "",
                "institution": "",
                "degree": "",
                "start_date": "",
                "end_date": "",
                "grade": "",
                "description": ""
            }
        
        # Handle complex line formats with multiple separators
        processed = process_complex_line(line_stripped, current_edu)
        if processed:
            current_edu = processed
            continue
        
        # Extract degree information
        degree_info = extract_degree_info(line_stripped)
        if degree_info and not current_edu["degree"]:
            # If we already have an institution but no degree, this is likely part of the same education
            if current_edu["institution"] and not current_edu["degree"]:
                current_edu["degree"] = degree_info
            # If we don't have an institution yet, this might be a new education entry
            elif not current_edu["institution"]:
                current_edu["degree"] = degree_info
            continue
        
        # Extract institution
        institution = extract_institution_info(line_stripped)
        if institution and not current_edu["institution"]:
            current_edu["institution"] = institution
            continue
            
        # Extract date information
        dates = extract_date_info(line_stripped)
        if dates and (not current_edu["start_date"] or not current_edu["end_date"]):
            if not current_edu["start_date"]:
                current_edu["start_date"] = dates.get("start", "")
            if not current_edu["end_date"]:
                current_edu["end_date"] = dates.get("end", "")
            continue
        
        # Handle scores/grades separately from description
        if is_score_line(line_stripped):
            # Check if the line also contains date information
            date_grade_combined = re.search(r'(\d{4})\s*\|\s*(.+)$', line_stripped)
            if date_grade_combined:
                year = date_grade_combined.group(1).strip()
                grade_part = date_grade_combined.group(2).strip()
                
                # Set the year as both start and end date if not already set
                if not current_edu["start_date"]:
                    current_edu["start_date"] = year
                    current_edu["end_date"] = year
                
                # Extract the grade - preserve the original format if it contains GPA/CGPA indicators
                if is_score_line(grade_part):
                    # Check if grade_part contains GPA/CGPA indicators
                    if re.search(r'gpa|cgpa', grade_part, re.IGNORECASE):
                        current_edu["grade"] = grade_part.strip()
                    else:
                        current_edu["grade"] = extract_score_info(grade_part)
            else:
                # Regular score line without date
                score_info = extract_score_info(line_stripped)
                current_edu["grade"] = score_info
        else:
            # Check if line contains mixed date and grade information
            mixed_date_grade = re.search(r'(\d{4})\s*\|\s*(.+)$', line_stripped)
            if mixed_date_grade:
                year = mixed_date_grade.group(1).strip()
                grade_part = mixed_date_grade.group(2).strip()
                
                # Only set dates if they're not already set
                if not current_edu["start_date"]:
                    current_edu["start_date"] = year
                    current_edu["end_date"] = year
                
                # Set grade if it's a valid score - preserve original format for GPA/CGPA
                if is_score_line(grade_part):
                    if re.search(r'gpa|cgpa', grade_part, re.IGNORECASE):
                        current_edu["grade"] = grade_part.strip()
                    else:
                        current_edu["grade"] = extract_score_info(grade_part)
            else:
                # Add to description if it's meaningful content and not already processed
                if is_meaningful_description(line_stripped) and not extract_degree_info(line_stripped) and not extract_institution_info(line_stripped):
                    if current_edu["description"]:
                        current_edu["description"] += " " + line_stripped
                    else:
                        current_edu["description"] = line_stripped
    
    # Add the last education
    if current_edu["institution"] or current_edu["degree"]:
        current_edu["id"] = str(len(educations) + 1)
        # Check for duplicates before adding
        if not is_duplicate_education(current_edu, educations):
            educations.append(current_edu)
    
    # Post-process to handle any remaining combined date-grade fields
    for i, edu in enumerate(educations):
        # Check if grade field contains combined date and grade
        if edu["grade"] and re.search(r'^\d{4}\s*\|\s*', edu["grade"]):
            updated_edu = process_combined_date_grade(edu["grade"], edu.copy())
            # Update the education object
            educations[i] = updated_edu
    
    return educations

def process_complex_line(line, current_edu):
    """Process lines with multiple information pieces separated by |, -, etc."""
    
    # Pattern 1: Institution | Date Range
    if "|" in line:
        parts = line.split("|")
        if len(parts) == 2:
            left_part = parts[0].strip()
            right_part = parts[1].strip()
            
            # Check if right part is a date
            dates = extract_date_info(right_part)
            if dates and is_institution_name(left_part):
                current_edu["institution"] = clean_institution_name(left_part)
                current_edu["start_date"] = dates.get("start", "")
                current_edu["end_date"] = dates.get("end", "")
                return current_edu
            
            # Check if left part is degree and right part has score
            degree_info = extract_degree_info(left_part)
            if degree_info and is_score_line(right_part):
                current_edu["degree"] = degree_info
                score_info = extract_score_info(right_part)
                current_edu["grade"] = score_info
                return current_edu
    
    # Pattern 2: Institution with embedded dates (e.g., "LJ University 2022 - 2026")
    institution_with_dates = re.search(r'^(.+?)\s+(\d{4}\s*[-–—]\s*\d{4})$', line)
    if institution_with_dates:
        institution_part = institution_with_dates.group(1).strip()
        date_part = institution_with_dates.group(2).strip()
        
        if is_institution_name(institution_part):
            current_edu["institution"] = clean_institution_name(institution_part)
            dates = extract_date_info(date_part)
            if dates:
                current_edu["start_date"] = dates.get("start", "")
                current_edu["end_date"] = dates.get("end", "")
            return current_edu
    
    # Pattern 3: Degree with institution in same line
    degree_match = re.search(r'(.*?)\s*(?:from|at|\|)\s*(.*(?:university|college|school|institute).*)', line, re.IGNORECASE)
    if degree_match:
        degree_part = degree_match.group(1).strip()
        institution_part = degree_match.group(2).strip()
        
        if extract_degree_info(degree_part) and is_institution_name(institution_part):
            current_edu["degree"] = extract_degree_info(degree_part)
            current_edu["institution"] = clean_institution_name(institution_part)
            return current_edu
    
    # Pattern 4: Institution with degree and grade in same line (e.g., "XYZ University, India — 2019 | GPA: 3.6/4.0")
    complex_pattern = re.search(r'^(.+?)\s*,\s*(.+?)\s*[—–-]\s*(.+?)\s*\|\s*(.+)$', line)
    if complex_pattern:
        institution_part = complex_pattern.group(1).strip()
        location_part = complex_pattern.group(2).strip()
        date_part = complex_pattern.group(3).strip()
        grade_part = complex_pattern.group(4).strip()
        
        if is_institution_name(institution_part):
            current_edu["institution"] = clean_institution_name(institution_part)
            
            # Extract dates from the date part
            dates = extract_date_info(date_part)
            if dates:
                current_edu["start_date"] = dates.get("start", "")
                current_edu["end_date"] = dates.get("end", "")
            
            # Extract grade from the last part
            if is_score_line(grade_part):
                current_edu["grade"] = extract_score_info(grade_part)
            
            return current_edu
    
    # Pattern 5: Simple institution name (standalone)
    if is_institution_name(line) and not extract_degree_info(line) and not is_score_line(line):
        current_edu["institution"] = clean_institution_name(line)
        return current_edu
    
    # Pattern 6: All caps institution name (like "LJ UNIVERSITY")
    if line.isupper() and len(line.strip()) > 2 and len(line.strip()) < 50:
        if re.search(r'^[A-Z\s]+$', line.strip()) and not re.search(r'\d', line):
            current_edu["institution"] = clean_institution_name(line)
            return current_edu
    
    # Pattern 7: Date and grade combined (e.g., "2019 | GPA: 3.6/4.0")
    date_grade_pattern = re.search(r'^(\d{4})\s*\|\s*(.+)$', line)
    if date_grade_pattern:
        year = date_grade_pattern.group(1).strip()
        grade_part = date_grade_pattern.group(2).strip()
        
        # Set the year as both start and end date if not already set
        if not current_edu["start_date"]:
            current_edu["start_date"] = year
            current_edu["end_date"] = year
        
        # Extract the grade if it's a valid score - preserve original format for GPA/CGPA
        if is_score_line(grade_part):
            if re.search(r'gpa|cgpa', grade_part, re.IGNORECASE):
                current_edu["grade"] = grade_part.strip()
            else:
                current_edu["grade"] = extract_score_info(grade_part)
        
        return current_edu
    
    # Pattern 8: Institution with location, year, and grade (e.g., "XYZ University, India — 2019 | GPA: 3.6/4.0")
    institution_year_grade_pattern = re.search(r'^(.+?)\s*,\s*(.+?)\s*[—–-]\s*(\d{4})\s*\|\s*(.+)$', line)
    if institution_year_grade_pattern:
        institution_part = institution_year_grade_pattern.group(1).strip()
        location_part = institution_year_grade_pattern.group(2).strip()
        year = institution_year_grade_pattern.group(3).strip()
        grade_part = institution_year_grade_pattern.group(4).strip()
        
        if is_institution_name(institution_part):
            current_edu["institution"] = clean_institution_name(institution_part)
            current_edu["start_date"] = year
            current_edu["end_date"] = year
            
            # Extract the grade if it's a valid score - preserve original format for GPA/CGPA
            if is_score_line(grade_part):
                if re.search(r'gpa|cgpa', grade_part, re.IGNORECASE):
                    current_edu["grade"] = grade_part.strip()
                else:
                    current_edu["grade"] = extract_score_info(grade_part)
            
            return current_edu
    
    return None

def is_new_education_entry(line):
    """Determine if line starts a new education entry"""
    line_lower = line.lower()
    
    # Strong indicators of new entry
    institution_indicators = ['university', 'college', 'school', 'institute', 'academy', 'polytechnic']
    degree_indicators = ['bachelor', 'master', 'phd', 'b.tech', 'btech', 'm.tech', 'mtech', 
                        'b.sc', 'bsc', 'm.sc', 'msc', 'mba', 'b.com', 'bcom', 'm.com', 'mcom',
                        'b.a', 'ba', 'm.a', 'ma', 'b.e', 'be', 'm.e', 'me', 'diploma']
    
    has_institution = any(keyword in line_lower for keyword in institution_indicators)
    has_degree = any(keyword in line_lower for keyword in degree_indicators)
    has_year = re.search(r'\d{4}', line) is not None
    
    # Line structure analysis
    is_capitalized_header = line and line[0].isupper() and len(line.split()) <= 5
    has_date_range = bool(re.search(r'\d{4}[-–—]\d{4}|\d{4}[-–—]present|\d{4}\s*to\s*\d{4}', line, re.IGNORECASE))
    
    # Avoid treating scores/descriptions as new entries
    is_score = is_score_line(line)
    is_long_text = len(line) > 80 and not has_institution and not has_degree
    
    # Check if line contains both institution and dates (likely a complete education entry)
    has_institution_with_dates = (has_institution and has_date_range)
    
    # Check if line is a standalone degree (likely part of current education, not new)
    is_standalone_degree = has_degree and not has_institution and not has_date_range and len(line.strip()) < 50
    
    return ((has_institution_with_dates or (has_institution and not is_standalone_degree) or has_date_range or is_capitalized_header) 
            and not is_score and not is_long_text and not is_standalone_degree)

def is_institution_name(line):
    """Check if line contains institution name"""
    line_lower = line.lower()
    institution_keywords = ['university', 'college', 'school', 'institute', 'academy', 'polytechnic']
    
    # Check for institution keywords
    has_institution_keyword = any(keyword in line_lower for keyword in institution_keywords)
    
    # Also check for patterns that look like institution names (all caps, short names)
    is_all_caps = line.isupper() and len(line.strip()) > 2 and len(line.strip()) < 50
    has_institution_pattern = re.search(r'^[A-Z\s]+(?:UNIVERSITY|COLLEGE|SCHOOL|INSTITUTE|ACADEMY|POLYTECHNIC)$', line.strip())
    
    return has_institution_keyword or is_all_caps or bool(has_institution_pattern)

def clean_institution_name(line):
    """Extract clean institution name"""
    # Remove common prefixes but keep the institution keywords (university, college, etc.)
    cleaned = re.sub(r'^\s*(?:institution):\s*', '', line, flags=re.IGNORECASE)
    # Remove trailing dates that are clearly separated by | or ,
    cleaned = re.sub(r'\s*[|,]\s*\d{4}.*$', '', cleaned)  # Remove trailing dates
    # Remove trailing location info (e.g., ", India")
    cleaned = re.sub(r'\s*,\s*[A-Za-z\s]+$', '', cleaned)
    return cleaned.strip()

def extract_institution_info(line):
    """Extract institution name from line"""
    if is_institution_name(line) and not extract_degree_info(line) and not is_score_line(line):
        return clean_institution_name(line)
    
    # Handle cases where institution might be in all caps without keywords
    if line.isupper() and len(line.strip()) > 2 and len(line.strip()) < 50:
        # Check if it looks like an institution name
        if re.search(r'^[A-Z\s]+$', line.strip()) and not re.search(r'\d', line):
            return clean_institution_name(line)
    
    return None

def extract_degree_info(line):
    """Extract degree information from line"""
    line_lower = line.lower()
    
    # Skip if line contains grade indicators
    if is_score_line(line):
        return None
    
    # Common degree patterns
    degree_patterns = [
        r'\b(bachelor\s+of\s+\w+(?:\s+\w+)*)',
        r'\b(master\s+of\s+\w+(?:\s+\w+)*)',
        r'\b(b\.?tech\s+\w+(?:\s+\w+)*)',
        r'\b(m\.?tech\s+\w+(?:\s+\w+)*)',
        r'\b(b\.?sc\s+\w+(?:\s+\w+)*)',
        r'\b(m\.?sc\s+\w+(?:\s+\w+)*)',
        r'\b(b\.?com\s*\w*)',
        r'\b(m\.?com\s*\w*)',
        r'\b(b\.?a\s+\w+(?:\s+\w+)*)',
        r'\b(m\.?a\s+\w+(?:\s+\w+)*)',
        r'\b(b\.?e\s+\w+(?:\s+\w+)*)',
        r'\b(m\.?e\s+\w+(?:\s+\w+)*)',
        r'\b(mba\s*\w*)',
        r'\b(phd\s+in\s+\w+(?:\s+\w+)*)',
        r'\b(diploma\s+in\s+\w+(?:\s+\w+)*)',
        r'\b(class\s+(?:x|xi|xii|\d+))\b',
        r'\b(senior\s+\w+)'
    ]
    
    for pattern in degree_patterns:
        match = re.search(pattern, line_lower)
        if match:
            degree = match.group(1)
            # Clean up the degree name
            degree = re.sub(r'\s+', ' ', degree).strip()
            return degree.title()
    
    return None

def extract_date_info(line):
    """Extract start and end dates from line"""
    date_patterns = [
        r'(\d{4})[-–—](\d{4})',           # 2022-2026
        r'(\d{4})[-–—](present|current)', # 2022-present
        r'(\d{4})\s*to\s*(\d{4})',       # 2022 to 2026
        r'(\d{4})\s*to\s*(present|current)', # 2022 to present
        r'(\d{4})[-–—](\d{2})',          # 2022-26 (short year)
        r'(\d{1,2})/(\d{4})\s*[-–—]\s*(\d{1,2})/(\d{4})', # MM/YYYY - MM/YYYY
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) >= 2:
                start = groups[0]
                end = groups[1].lower()
                
                # Handle 'present' or 'current'
                if end in ['present', 'current']:
                    end = 'Present'
                elif len(end) == 2 and end.isdigit():
                    # Handle short year format (e.g., 22 for 2022)
                    end = '20' + end if int(end) < 50 else '19' + end
                
                return {"start": start, "end": end}
    
    # Single year pattern - but be more careful about excluding grade information
    single_year = re.search(r'\b(\d{4})\b', line)
    if single_year:
        # Check if this year is part of a grade pattern (e.g., "2019 | GPA: 3.6/4.0")
        if re.search(r'\d{4}\s*\|\s*(?:gpa|cgpa|spi|percentage|grade|score)', line, re.IGNORECASE):
            # This is a grade line, don't extract as date
            return None
        elif not re.search(r'cgpa|gpa|spi|percentage|grade|score', line, re.IGNORECASE):
            year = single_year.group(1)
            return {"start": year, "end": year}
        else:
            # If the line contains a year but also grade indicators, check if it's a standalone year
            # This handles cases like "2019" in "XYZ University, India — 2019 | GPA: 3.6/4.0"
            if re.search(r'^\d{4}$', line.strip()) or re.search(r'^\d{4}\s*$', line.strip()):
                year = single_year.group(1)
                return {"start": year, "end": year}
    
    return None

def is_score_line(line):
    """Check if line contains academic scores"""
    line_lower = line.lower()
    score_indicators = ['cgpa', 'gpa', 'spi', 'percentage', 'percentile', 'grade', 'marks', '%', 'score']
    return any(indicator in line_lower for indicator in score_indicators)

def extract_score_info(line):
    """Extract and format score information"""
    # First, check if the line contains both date and grade information
    # Pattern: "2019 | GPA: 3.6/4.0" or "2019|GPA: 3.6/4.0"
    date_grade_pattern = re.search(r'^(\d{4})\s*\|\s*(.+)$', line.strip())
    if date_grade_pattern:
        # Return only the grade part, date will be handled separately
        grade_part = date_grade_pattern.group(2).strip()
        # Remove common prefixes and clean up
        score = re.sub(r'^\s*(?:cgpa|gpa|spi|percentage|percentile|grade|marks?|score):\s*', '', grade_part, flags=re.IGNORECASE)
        # Also remove any remaining prefixes like "CGPA : " or "Percentile : "
        score = re.sub(r'^\s*(?:cgpa|gpa|spi|percentage|percentile|grade|marks?|score)\s*:\s*', '', score, flags=re.IGNORECASE)
        return score.strip()
    
    # Regular score extraction (no date combined)
    # Remove common prefixes and clean up
    score = re.sub(r'^\s*(?:cgpa|gpa|spi|percentage|percentile|grade|marks?|score):\s*', '', line, flags=re.IGNORECASE)
    # Also remove any remaining prefixes like "CGPA : " or "Percentile : "
    score = re.sub(r'^\s*(?:cgpa|gpa|spi|percentage|percentile|grade|marks?|score)\s*:\s*', '', score, flags=re.IGNORECASE)
    return score.strip()

def is_meaningful_description(line):
    """Check if line contains meaningful description content"""
    # Skip very short lines or lines that are just formatting
    if len(line.strip()) < 3:
        return False
    
    # Skip lines that are just separators or formatting
    if re.match(r'^[-=_*]+$', line.strip()):
        return False
    
    # Skip lines that look like headers or section titles
    if line.isupper() and len(line) < 30:
        return False
    
    return True

def process_combined_date_grade(field_value, current_edu):
    """Process a field that contains both date and grade information"""
    if not field_value:
        return current_edu
    
    # Pattern: "2019 | GPA: 3.6/4.0" or "2019|GPA: 3.6/4.0"
    date_grade_pattern = re.search(r'^(\d{4})\s*\|\s*(.+)$', field_value.strip())
    if date_grade_pattern:
        year = date_grade_pattern.group(1).strip()
        grade_part = date_grade_pattern.group(2).strip()
        
        # Set the year as both start and end date if not already set
        if not current_edu["start_date"]:
            current_edu["start_date"] = year
            current_edu["end_date"] = year
        
        # Set the grade - preserve original format for GPA/CGPA
        if is_score_line(grade_part):
            if re.search(r'gpa|cgpa', grade_part, re.IGNORECASE):
                current_edu["grade"] = grade_part.strip()
            else:
                current_edu["grade"] = extract_score_info(grade_part)
        else:
            current_edu["grade"] = grade_part.strip()
    
    return current_edu

def is_duplicate_education(current_edu, existing_educations):
    """Check if the current education is a duplicate of an existing one"""
    if not current_edu["institution"] and not current_edu["degree"]:
        return False
    
    for edu in existing_educations:
        # Check if institution and degree match
        if (current_edu["institution"] and edu["institution"] and 
            current_edu["institution"].lower().strip() == edu["institution"].lower().strip() and
            current_edu["degree"] and edu["degree"] and
            current_edu["degree"].lower().strip() == edu["degree"].lower().strip()):
            return True
        
        # Check if institution matches and degree is empty in one of them
        if (current_edu["institution"] and edu["institution"] and 
            current_edu["institution"].lower().strip() == edu["institution"].lower().strip() and
            (not current_edu["degree"] or not edu["degree"])):
            return True
        
        # Check if degree matches and institution is empty in one of them
        if (current_edu["degree"] and edu["degree"] and 
            current_edu["degree"].lower().strip() == edu["degree"].lower().strip() and
            (not current_edu["institution"] or not edu["institution"])):
            return True
    
    return False