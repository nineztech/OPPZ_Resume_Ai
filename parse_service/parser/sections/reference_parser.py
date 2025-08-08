import re

def parse_reference_section(text):
    """Parse reference section into structured data"""
    references = []
    
    if not text:
        return references
    
    lines = text.split('\n')
    current_ref = {
        "id": "",
        "name": "",
        "title": "",
        "company": "",
        "phone": "",
        "email": "",
        "relationship": ""
    }
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        # Check if this looks like a new reference entry
        if is_new_reference_entry(line_stripped):
            if current_ref["name"] or current_ref["title"] or current_ref["company"]:
                current_ref["id"] = str(len(references) + 1)
                # Check for duplicates before adding
                if not is_duplicate_reference(current_ref, references):
                    references.append(current_ref.copy())
            current_ref = {
                "id": "",
                "name": "",
                "title": "",
                "company": "",
                "phone": "",
                "email": "",
                "relationship": ""
            }
        
        # Extract name
        name = extract_name_info(line_stripped)
        if name and not current_ref["name"]:
            current_ref["name"] = name
            continue
            
        # Extract title and company
        title_company = extract_title_company_info(line_stripped)
        if title_company:
            if not current_ref["title"]:
                current_ref["title"] = title_company.get("title", "")
            if not current_ref["company"]:
                current_ref["company"] = title_company.get("company", "")
            continue
        
        # Extract phone number
        phone = extract_phone_info(line_stripped)
        if phone and not current_ref["phone"]:
            current_ref["phone"] = phone
            continue
        
        # Extract email
        email = extract_email_info(line_stripped)
        if email and not current_ref["email"]:
            current_ref["email"] = email
            continue
        
        # Extract relationship (if mentioned)
        relationship = extract_relationship_info(line_stripped)
        if relationship and not current_ref["relationship"]:
            current_ref["relationship"] = relationship
            continue
    
    # Add the last reference if it has content
    if current_ref["name"] or current_ref["title"] or current_ref["company"]:
        current_ref["id"] = str(len(references) + 1)
        if not is_duplicate_reference(current_ref, references):
            references.append(current_ref)
    
    return references

def is_new_reference_entry(line):
    """Check if line indicates a new reference entry"""
    # Look for patterns that indicate a new reference
    # Pattern 1: Just a name (title case or all caps)
    if (line.isupper() or line.istitle()) and len(line) > 2 and len(line) < 50:
        # Check if it doesn't contain contact info keywords
        line_lower = line.lower()
        if not any(keyword in line_lower for keyword in ['phone', 'email', '@', '+', 'www', 'http']):
            return True
    
    # Pattern 2: Name followed by company/title pattern
    if re.search(r'^[A-Z][a-zA-Z\s]+\s*[/|]\s*[A-Z]', line):
        return True
    
    return False

def extract_name_info(line):
    """Extract reference name from line"""
    # Remove common prefixes
    line = re.sub(r'^(?:name|ref|reference)\s*:?\s*', '', line, flags=re.IGNORECASE)
    
    # Pattern 1: Simple name (title case or all caps)
    if (line.isupper() or line.istitle()) and len(line) > 2 and len(line) < 50:
        # Check if it doesn't contain contact info
        if not re.search(r'[0-9@#$%^&*()]', line):
            return line.strip()
    
    # Pattern 2: Name before company/title separator
    name_match = re.search(r'^([A-Z][a-zA-Z\s]+?)\s*[/|]', line)
    if name_match:
        name = name_match.group(1).strip()
        if len(name) > 2 and len(name) < 50:
            return name
    
    return ""

def extract_title_company_info(line):
    """Extract title and company information"""
    result = {"title": "", "company": ""}
    
    # Pattern 1: Company / Title format
    company_title_match = re.search(r'([^/|]+)\s*[/|]\s*(.+)', line)
    if company_title_match:
        company = company_title_match.group(1).strip()
        title = company_title_match.group(2).strip()
        
        # Clean up company name
        company = re.sub(r'^(?:company|organization|firm)\s*:?\s*', '', company, flags=re.IGNORECASE)
        result["company"] = company
        
        # Clean up title
        title = re.sub(r'^(?:title|position|role)\s*:?\s*', '', title, flags=re.IGNORECASE)
        result["title"] = title
    
    # Pattern 2: Just company name
    elif not re.search(r'phone|email|@|\+', line, re.IGNORECASE):
        company = line.strip()
        company = re.sub(r'^(?:company|organization|firm)\s*:?\s*', '', company, flags=re.IGNORECASE)
        if len(company) > 2:
            result["company"] = company
    
    return result

def extract_phone_info(line):
    """Extract phone number from line"""
    # Remove phone label
    line = re.sub(r'^(?:phone|tel|telephone)\s*:?\s*', '', line, flags=re.IGNORECASE)
    
    # Phone number patterns
    phone_patterns = [
        r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # International format
        r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # US format
        r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',  # Simple format
    ]
    
    for pattern in phone_patterns:
        phone_match = re.search(pattern, line)
        if phone_match:
            return phone_match.group()
    
    return ""

def extract_email_info(line):
    """Extract email address from line"""
    # Remove email label
    line = re.sub(r'^(?:email|e-mail)\s*:?\s*', '', line, flags=re.IGNORECASE)
    
    # Email pattern
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', line)
    if email_match:
        return email_match.group()
    
    return ""

def extract_relationship_info(line):
    """Extract relationship information"""
    # Remove relationship label
    line = re.sub(r'^(?:relationship|relation)\s*:?\s*', '', line, flags=re.IGNORECASE)
    
    # Common relationship keywords
    relationship_keywords = [
        'supervisor', 'manager', 'director', 'colleague', 'coworker', 'peer',
        'mentor', 'advisor', 'professor', 'instructor', 'teacher', 'boss',
        'team lead', 'project manager', 'department head'
    ]
    
    line_lower = line.lower()
    for keyword in relationship_keywords:
        if keyword in line_lower:
            return line.strip()
    
    return ""

def is_duplicate_reference(current_ref, existing_references):
    """Check if reference is a duplicate"""
    if not current_ref["name"]:
        return False
    
    for ref in existing_references:
        # Check if names match (case insensitive)
        if (current_ref["name"].lower() == ref["name"].lower() and 
            ref["name"]):  # Only if existing ref has a name
            return True
        
        # Check if email matches
        if (current_ref["email"] and ref["email"] and 
            current_ref["email"].lower() == ref["email"].lower()):
            return True
        
        # Check if phone matches
        if (current_ref["phone"] and ref["phone"] and 
            current_ref["phone"] == ref["phone"]):
            return True
    
    return False
