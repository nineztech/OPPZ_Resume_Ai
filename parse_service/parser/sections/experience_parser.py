import re

def parse_experience_section(text):
    """Parse experience section into structured data"""
    experiences = []
    
    if not text:
        return experiences
    
    lines = text.split('\n')
    current_exp = {
        "id": "",
        "company": "",
        "position": "",
        "start_date": "",
        "end_date": "",
        "description": ""
    }
    
    i = 0
    while i < len(lines):
        line_stripped = lines[i].strip()
        if not line_stripped:
            i += 1
            continue
        
        # Check if this looks like a new experience entry
        if is_new_experience_entry(line_stripped, i, lines):
            if current_exp["company"] or current_exp["position"]:
                current_exp["id"] = str(len(experiences) + 1)
                # Check for duplicates before adding
                if not is_duplicate_experience(current_exp, experiences):
                    experiences.append(current_exp.copy())
                    print(f"DEBUG: Added experience: {current_exp['company']} - {current_exp['position']}")
            current_exp = {
                "id": "",
                "company": "",
                "position": "",
                "start_date": "",
                "end_date": "",
                "description": ""
            }
        
        # Try to parse the current line and next few lines as a complete experience entry
        parsed_exp = parse_experience_block(lines, i)
        if parsed_exp:
            # If we successfully parsed a complete experience, use it
            if current_exp["company"] or current_exp["position"]:
                current_exp["id"] = str(len(experiences) + 1)
                # Check for duplicates before adding
                if not is_duplicate_experience(current_exp, experiences):
                    experiences.append(current_exp.copy())
                    print(f"DEBUG: Added experience: {current_exp['company']} - {current_exp['position']}")
            current_exp = parsed_exp
            # Skip the lines we just parsed
            i += count_experience_lines(lines, i)
            continue
        
        # Fallback: parse line by line
        # Check if line contains both company and dates (common format: "Company | Dates")
        if "|" in line_stripped:
            parts = line_stripped.split("|")
            if len(parts) == 2:
                company_part = parts[0].strip()
                date_part = parts[1].strip()
                
                # Only set company if it doesn't contain date patterns
                if not is_date_line(company_part):
                    current_exp["company"] = company_part
                
                # Parse dates
                start_date, end_date = parse_dates(date_part)
                current_exp["start_date"] = start_date
                current_exp["end_date"] = end_date
                i += 1
                continue
        
        # Handle case where start_date contains company name (e.g., "Excelsior Technologies | Dec")
        if current_exp["start_date"] and "|" in current_exp["start_date"]:
            parts = current_exp["start_date"].split("|")
            if len(parts) == 2:
                company_part = parts[0].strip()
                date_part = parts[1].strip()
                
                # Only set company if it doesn't contain date patterns
                if not is_date_line(company_part):
                    current_exp["company"] = company_part
                
                # Update start_date to just the date part
                current_exp["start_date"] = date_part
        
        # Check if line contains position keywords (likely a job title)
        if is_position_line(line_stripped):
            current_exp["position"] = line_stripped
            i += 1
            continue
        
        # Check if line contains date patterns
        if is_date_line(line_stripped):
            start_date, end_date = parse_dates(line_stripped)
            current_exp["start_date"] = start_date
            current_exp["end_date"] = end_date
            i += 1
            continue
        
        # Check if line looks like a company name
        if is_company_line(line_stripped):
            # Check if the line contains both company and dates
            if "|" in line_stripped:
                parts = line_stripped.split("|")
                if len(parts) == 2:
                    company_part = parts[0].strip()
                    date_part = parts[1].strip()
                    
                    # Only set company if it doesn't contain date patterns
                    if not is_date_line(company_part):
                        current_exp["company"] = company_part
                    
                    # Parse dates
                    start_date, end_date = parse_dates(date_part)
                    current_exp["start_date"] = start_date
                    current_exp["end_date"] = end_date
                else:
                    current_exp["company"] = line_stripped
            else:
                current_exp["company"] = line_stripped
            i += 1
            continue
        
        # Check if this is a long line (likely description)
        if len(line_stripped) > 50:
            if current_exp["description"]:
                current_exp["description"] += " " + line_stripped
            else:
                current_exp["description"] = line_stripped
            i += 1
            continue
        
        # For shorter lines, check if they're likely description or other fields
        # If we already have a company and position, treat as description
        if current_exp["company"] and current_exp["position"]:
            if current_exp["description"]:
                current_exp["description"] += " " + line_stripped
            else:
                current_exp["description"] = line_stripped
        # Otherwise, try to identify what this line is
        else:
            # If it looks like a company name and we don't have one yet
            if is_company_line(line_stripped) and not current_exp["company"]:
                # Check if the line contains both company and dates
                if "|" in line_stripped:
                    parts = line_stripped.split("|")
                    if len(parts) == 2:
                        company_part = parts[0].strip()
                        date_part = parts[1].strip()
                        
                        # Only set company if it doesn't contain date patterns
                        if not is_date_line(company_part):
                            current_exp["company"] = company_part
                        
                        # Parse dates if not already set
                        if not current_exp["start_date"] and not current_exp["end_date"]:
                            start_date, end_date = parse_dates(date_part)
                            current_exp["start_date"] = start_date
                            current_exp["end_date"] = end_date
                else:
                    current_exp["company"] = line_stripped
            # If it looks like a position and we don't have one yet
            elif is_position_line(line_stripped) and not current_exp["position"]:
                current_exp["position"] = line_stripped
            # If it looks like a date and we don't have dates yet
            elif is_date_line(line_stripped) and not current_exp["start_date"]:
                start_date, end_date = parse_dates(line_stripped)
                current_exp["start_date"] = start_date
                current_exp["end_date"] = end_date
            # Otherwise, treat as description
            else:
                if current_exp["description"]:
                    current_exp["description"] += " " + line_stripped
                else:
                    current_exp["description"] = line_stripped
        i += 1
    
    # Add the last experience
    if current_exp["company"] or current_exp["position"]:
        current_exp["id"] = str(len(experiences) + 1)
        # Check for duplicates before adding
        if not is_duplicate_experience(current_exp, experiences):
            experiences.append(current_exp)
            print(f"DEBUG: Added final experience: {current_exp['company']} - {current_exp['position']}")
    
    print(f"DEBUG: Total experiences found: {len(experiences)}")
    
    # Clean up and fix any malformed data
    cleaned_experiences = []
    for exp in experiences:
        # Fix case where company name is in start_date
        if exp["start_date"] and "|" in exp["start_date"]:
            parts = exp["start_date"].split("|")
            if len(parts) == 2:
                company_part = parts[0].strip()
                date_part = parts[1].strip()
                
                # Only set company if it doesn't contain date patterns
                if not is_date_line(company_part):
                    exp["company"] = company_part
                
                # Update start_date to just the date part
                exp["start_date"] = date_part
        
        # Fix case where start_date contains combined date format (e.g., "Dec-Present")
        if exp["start_date"] and "-" in exp["start_date"] and not exp["end_date"]:
            # Try to parse the combined date
            start_date, end_date = parse_dates(exp["start_date"])
            if start_date and end_date:
                exp["start_date"] = start_date
                exp["end_date"] = end_date
        
        # Remove empty experiences
        if exp["company"] or exp["position"]:
            cleaned_experiences.append(exp)
    
    return cleaned_experiences

def parse_experience_block(lines, start_index):
    """Try to parse a complete experience block starting from the given index"""
    if start_index >= len(lines):
        return None
    
    # Look ahead a few lines to try to parse a complete experience
    block_lines = []
    for i in range(start_index, min(start_index + 10, len(lines))):
        line = lines[i].strip()
        if line:
            block_lines.append(line)
        # Stop if we hit what looks like a new experience entry
        elif i > start_index and is_new_experience_entry(lines[i+1].strip(), i+1, lines):
            break
    
    if len(block_lines) < 2:
        return None
    
    # Try to identify the components
    exp = {
        "id": "",
        "company": "",
        "position": "",
        "start_date": "",
        "end_date": "",
        "description": ""
    }
    
    # First line is often position or company
    first_line = block_lines[0]
    if is_position_line(first_line):
        exp["position"] = first_line
    elif is_company_line(first_line):
        # Check if the line contains both company and dates
        if "|" in first_line:
            parts = first_line.split("|")
            if len(parts) == 2:
                company_part = parts[0].strip()
                date_part = parts[1].strip()
                
                # Only set company if it doesn't contain date patterns
                if not is_date_line(company_part):
                    exp["company"] = company_part
                
                # Parse dates
                start_date, end_date = parse_dates(date_part)
                exp["start_date"] = start_date
                exp["end_date"] = end_date
        else:
            exp["company"] = first_line
    
    # Look for dates in the block if not already found
    if not exp["start_date"] and not exp["end_date"]:
        for line in block_lines:
            if is_date_line(line):
                start_date, end_date = parse_dates(line)
                exp["start_date"] = start_date
                exp["end_date"] = end_date
                break
    
    # Look for company if not found yet
    if not exp["company"]:
        for line in block_lines:
            if is_company_line(line) and line != first_line:
                # Check if the line contains both company and dates
                if "|" in line:
                    parts = line.split("|")
                    if len(parts) == 2:
                        company_part = parts[0].strip()
                        date_part = parts[1].strip()
                        
                        # Only set company if it doesn't contain date patterns
                        if not is_date_line(company_part):
                            exp["company"] = company_part
                        
                        # Parse dates if not already set
                        if not exp["start_date"] and not exp["end_date"]:
                            start_date, end_date = parse_dates(date_part)
                            exp["start_date"] = start_date
                            exp["end_date"] = end_date
                else:
                    exp["company"] = line
                break
    
    # Look for position if not found yet
    if not exp["position"]:
        for line in block_lines:
            if is_position_line(line) and line != first_line:
                exp["position"] = line
                break
    
    # Everything else goes to description
    description_lines = []
    for line in block_lines:
        if (line != exp["position"] and 
            line != exp["company"] and 
            line != exp["start_date"] and 
            line != exp["end_date"] and
            not is_date_line(line) and
            not ("|" in line and is_date_line(line.split("|")[1].strip()))):
            description_lines.append(line)
    
    if description_lines:
        exp["description"] = " ".join(description_lines)
    
    # Only return if we have at least position or company
    if exp["position"] or exp["company"]:
        return exp
    
    return None

def count_experience_lines(lines, start_index):
    """Count how many lines make up the current experience entry"""
    count = 0
    for i in range(start_index, len(lines)):
        line = lines[i].strip()
        if not line:
            count += 1
            continue
        if is_new_experience_entry(line, i, lines) and i > start_index:
            break
        count += 1
    return count

def parse_dates(date_text):
    """Parse date text into start_date and end_date"""
    if not date_text:
        return "", ""
    
    # Common patterns: "Jan 2024 - Present", "March 2024 - Dec 2024", "2024-2025", "Dec-Present"
    date_text = date_text.strip()
    
    # Handle case where company name is mixed with date (e.g., "Excelsior Technologies | Dec")
    if "|" in date_text:
        parts = date_text.split("|")
        if len(parts) == 2:
            # The part after | is likely the date
            date_part = parts[1].strip()
            # Extract just the date part
            if re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b', date_part.lower()):
                return date_part, ""
    
    # Split by common separators
    separators = [' - ', '–', ' to ', ' -', '- ', ' - ', '-', ' to']
    start_date = ""
    end_date = ""
    
    for sep in separators:
        if sep in date_text:
            parts = date_text.split(sep)
            if len(parts) == 2:
                start_date = parts[0].strip()
                end_date = parts[1].strip()
                break
    
    # Handle case where there's no space around hyphen (e.g., "Dec-Present")
    if not start_date and not end_date and "-" in date_text:
        # Try to split by hyphen and check if parts look like dates
        parts = date_text.split("-")
        if len(parts) == 2:
            part1 = parts[0].strip()
            part2 = parts[1].strip()
            
            # Check if parts contain month names or "present"
            months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            if (any(month in part1.lower() for month in months) or 
                any(month in part2.lower() for month in months) or
                part1.lower() == "present" or part2.lower() == "present"):
                start_date = part1
                end_date = part2
    
    # If no separator found, try to extract dates differently
    if not start_date and not end_date:
        # Check if it's a single date
        if re.search(r'\d{4}', date_text):
            start_date = date_text
            end_date = ""
        # Check if it's just a month or month+year
        elif re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b', date_text.lower()):
            start_date = date_text
            end_date = ""
    
    # Special handling for "Present" as end_date
    if end_date.lower() == "present":
        end_date = "Present"
    elif start_date.lower() == "present":
        start_date = "Present"
    
    return start_date, end_date

def is_new_experience_entry(line, current_index, all_lines):
    line_lower = line.lower()
    
    # Check for job title keywords
    job_keywords = ['developer', 'engineer', 'manager', 'analyst', 'specialist', 'lead', 'architect', 'director', 'coordinator', 'assistant', 'intern', 'internship', 'tech', 'accountant', 'financial', 'senior']
    
    # Check for company indicators
    company_indicators = ['inc', 'corp', 'ltd', 'company', 'technologies', 'solutions', 'systems', 'industries', 'program', 'co']
    
    # Check if line contains job keywords
    has_job_keyword = any(keyword in line_lower for keyword in job_keywords)
    
    # Check if line contains company indicators
    has_company_indicator = any(indicator in line_lower for indicator in company_indicators)
    
    # Check if line contains date patterns (indicating a new job entry)
    has_date_pattern = re.search(r'\d{4}', line) and (line.lower().find('20') != -1 or line.lower().find('19') != -1)
    
    # Check if line is significantly shorter than the previous line (likely a header)
    prev_line = all_lines[current_index - 1].strip() if current_index > 0 else ''
    is_shorter_than_prev = prev_line and len(line.strip()) < len(prev_line) * 0.7
    
    # Check if line starts with capital letters and is short (likely a job title)
    is_capitalized_short = line.strip() and line.strip()[0].isupper() and len(line.strip()) < 50
    
    # Check if line is too long (likely description, not a new entry)
    is_too_long = len(line.strip()) > 100
    
    # Check if line contains description keywords (indicating it's part of description, not a new entry)
    description_keywords = ['developed', 'designed', 'implemented', 'led', 'coordinated', 'managed', 'achieved', 'increased', 'reduced', 'collaborated', 'built', 'optimized', 'lorem', 'ipsum']
    has_description_keywords = any(keyword in line_lower for keyword in description_keywords)
    
    # Check if line contains a pipe separator (company | dates format)
    has_pipe_separator = "|" in line
    
    # Check if line looks like a standalone job title (short, capitalized, no dates)
    is_standalone_job_title = (len(line.strip()) < 30 and 
                              line.strip() and line.strip()[0].isupper() and 
                              not has_date_pattern and 
                              has_job_keyword and
                              not has_pipe_separator)
    
    # New experience entry if:
    # 1. Contains job keywords and date patterns
    # 2. Contains company indicators and is short
    # 3. Is significantly shorter than previous line and contains job keywords
    # 4. Is capitalized, short, and contains job keywords
    # 5. Is a standalone job title
    # BUT NOT if it's too long or contains description keywords
    
    return ((has_job_keyword and has_date_pattern) or
            (has_company_indicator and len(line.strip()) < 40) or
            (is_shorter_than_prev and has_job_keyword) or
            (is_capitalized_short and has_job_keyword) or
            is_standalone_job_title) and not is_too_long and not has_description_keywords

def is_company_line(line):
    line_lower = line.lower()
    
    # Check for company keywords
    company_keywords = ['inc', 'corp', 'ltd', 'company', 'technologies', 'solutions', 'systems', 'industries', 'program', 'co', 'group']
    
    # Check if line contains company keywords
    has_company_keyword = any(keyword in line_lower for keyword in company_keywords)
    
    # Check if line is short and starts with capital letter (likely company name)
    is_short_capitalized = len(line.strip()) < 50 and line.strip() and line.strip()[0].isupper()
    
    # Check if line doesn't contain job keywords (to avoid confusion)
    job_keywords = ['developer', 'engineer', 'manager', 'analyst', 'specialist', 'lead', 'architect', 'director', 'coordinator', 'assistant', 'intern']
    has_job_keyword = any(keyword in line_lower for keyword in job_keywords)
    
    # Check if line doesn't contain date patterns
    has_date = re.search(r'\d{4}', line) is not None
    
    # Check if line doesn't contain common job-related words
    job_related_words = ['developed', 'designed', 'implemented', 'led', 'coordinated', 'managed', 'achieved', 'increased', 'reduced']
    has_job_related_words = any(word in line_lower for word in job_related_words)
    
    # Check if line looks like a simple company name (capitalized, not too long, no job keywords)
    is_simple_company = (is_short_capitalized and 
                        not has_job_keyword and 
                        not has_date and 
                        not has_job_related_words and
                        len(line.strip()) > 2)  # At least 3 characters
    
    return has_company_keyword or is_simple_company

def is_position_line(line):
    line_lower = line.lower()
    
    # Check for job title keywords
    job_keywords = ['developer', 'engineer', 'manager', 'analyst', 'specialist', 'lead', 'architect', 'director', 'coordinator', 'assistant', 'intern', 'internship', 'tech', 'accountant', 'financial', 'senior']
    
    # Check if line contains job keywords
    has_job_keyword = any(keyword in line_lower for keyword in job_keywords)
    
    # Check if line is short and doesn't contain company keywords
    is_short = len(line.strip()) < 50
    company_keywords = ['inc', 'corp', 'ltd', 'company', 'technologies', 'solutions', 'systems', 'industries', 'program', 'co']
    has_company_keyword = any(keyword in line_lower for keyword in company_keywords)
    
    # Check if line doesn't contain date patterns
    has_date = re.search(r'\d{4}', line) is not None
    
    # Check if line doesn't contain pipe separator (company | dates format)
    has_pipe = "|" in line
    
    # Check if line doesn't contain description keywords
    description_keywords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet']
    has_description_keywords = any(keyword in line_lower for keyword in description_keywords)
    
    return has_job_keyword and is_short and not has_company_keyword and not has_date and not has_pipe and not has_description_keywords

def is_date_line(line):
    # Check for year patterns (2024, 2023, etc.)
    has_year = re.search(r'\d{4}', line) is not None
    
    # Check for month patterns
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    has_month = any(month in line.lower() for month in months)
    
    # Check for date keywords
    date_keywords = ['present', 'current', 'to', '-', '–']
    has_date_keyword = any(keyword in line.lower() for keyword in date_keywords)
    
    # Check for day patterns (1st, 2nd, 3rd, etc.)
    has_day = re.search(r'\b\d{1,2}\b', line) is not None
    
    # Check for date separators
    has_separator = any(sep in line for sep in [' - ', '–', ' to ', ' -', '- ', '-', ' to'])
    
    return has_year or (has_month and (has_date_keyword or has_separator)) or (has_month and has_day)

def is_duplicate_experience(current_exp, existing_experiences):
    """Check if the current experience is a duplicate of an existing one"""
    if not current_exp["company"] and not current_exp["position"]:
        return False
    
    for exp in existing_experiences:
        # Check if company and position match
        if (current_exp["company"] and exp["company"] and 
            current_exp["company"].lower().strip() == exp["company"].lower().strip() and
            current_exp["position"] and exp["position"] and
            current_exp["position"].lower().strip() == exp["position"].lower().strip()):
            return True
        
        # Check if company matches and position is empty in one of them
        if (current_exp["company"] and exp["company"] and 
            current_exp["company"].lower().strip() == exp["company"].lower().strip() and
            (not current_exp["position"] or not exp["position"])):
            return True
        
        # Check if position matches and company is empty in one of them
        if (current_exp["position"] and exp["position"] and 
            current_exp["position"].lower().strip() == exp["position"].lower().strip() and
            (not current_exp["company"] or not exp["company"])):
            return True
    
    return False 