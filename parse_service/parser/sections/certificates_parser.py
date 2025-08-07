import re
from typing import List, Dict, Optional

def parse_certificates_section(certificates_text: str) -> List[Dict[str, str]]:
    """
    Parse certificates section and extract certificate details.
    
    Args:
        certificates_text (str): Raw text from certificates section
        
    Returns:
        List[Dict[str, str]]: List of certificate dictionaries with fields:
            - certificateName: Name of the certificate
            - link: Certificate link/URL
            - startDate: Start date of certification
            - endDate: End date of certification (if applicable)
            - instituteName: Name of the issuing institute
    """
    if not certificates_text or certificates_text.strip() == "":
        return []
    
    certificates = []
    lines = certificates_text.strip().split('\n')
    current_certificate = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if this is a new certificate entry
        if is_new_certificate_entry(line):
            # Save previous certificate if exists
            if current_certificate:
                certificates.append(current_certificate)
                current_certificate = {}
            
            # Start new certificate with name
            current_certificate['certificateName'] = line
            current_certificate['link'] = ''
            current_certificate['startDate'] = ''
            current_certificate['endDate'] = ''
            current_certificate['instituteName'] = ''
            
        elif current_certificate:
            # Try to identify what type of information this line contains
            if is_link_line(line):
                current_certificate['link'] = extract_link(line)
            elif is_date_line(line):
                dates = extract_dates(line)
                if dates:
                    if len(dates) >= 2:
                        current_certificate['startDate'] = dates[0]
                        current_certificate['endDate'] = dates[1]
                    elif len(dates) == 1:
                        current_certificate['startDate'] = dates[0]
            elif is_institute_line(line):
                current_certificate['instituteName'] = extract_institute(line)
            else:
                # If it's not a specific field, it might be additional description
                # or institute name without clear indicators
                if not current_certificate.get('instituteName'):
                    current_certificate['instituteName'] = line
    
    # Add the last certificate
    if current_certificate:
        certificates.append(current_certificate)
    
    return certificates

def is_new_certificate_entry(line: str) -> bool:
    """
    Check if a line represents the start of a new certificate entry.
    """
    # Certificate names are usually in title case or all caps
    # and don't contain typical date patterns or URLs
    line_upper = line.upper()
    
    # Skip lines that are clearly not certificate names
    if any(keyword in line_upper for keyword in ['HTTP', 'WWW', 'LINK:', 'URL:', 'CERTIFICATE:', 'CERTIFICATION:']):
        return False
    
    # Skip lines that are clearly dates
    if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', line):
        return False
    
    # Skip lines that are clearly institutes (common institute keywords)
    institute_keywords = ['UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'ACADEMY', 'SCHOOL', 'CENTER', 'FOUNDATION']
    if any(keyword in line_upper for keyword in institute_keywords):
        return False
    
    # Certificate names are usually 3-50 characters and contain letters
    if len(line) >= 3 and len(line) <= 50 and re.search(r'[A-Za-z]', line):
        # Check if it looks like a title (starts with capital, contains letters)
        if line[0].isupper() and re.search(r'[A-Za-z]', line):
            return True
    
    return False

def is_link_line(line: str) -> bool:
    """
    Check if a line contains a URL/link.
    """
    return bool(re.search(r'https?://|www\.|\.com|\.org|\.edu|\.net', line, re.IGNORECASE))

def extract_link(line: str) -> str:
    """
    Extract URL/link from a line.
    """
    # Find URLs in the line
    url_pattern = r'https?://[^\s]+|www\.[^\s]+'
    urls = re.findall(url_pattern, line, re.IGNORECASE)
    return urls[0] if urls else ''

def is_date_line(line: str) -> bool:
    """
    Check if a line contains date information.
    """
    # Look for various date patterns
    date_patterns = [
        r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # MM/DD/YYYY or DD/MM/YYYY
        r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',    # YYYY/MM/DD
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b',  # Month Year
        r'\b\d{4}\b',  # Just year
    ]
    
    return any(re.search(pattern, line, re.IGNORECASE) for pattern in date_patterns)

def extract_dates(line: str) -> List[str]:
    """
    Extract dates from a line.
    """
    dates = []
    
    # Extract various date patterns
    patterns = [
        r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # MM/DD/YYYY or DD/MM/YYYY
        r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',    # YYYY/MM/DD
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b',  # Month Year
        r'\b\d{4}\b',  # Just year
    ]
    
    for pattern in patterns:
        found_dates = re.findall(pattern, line, re.IGNORECASE)
        dates.extend(found_dates)
    
    return dates

def is_institute_line(line: str) -> bool:
    """
    Check if a line contains institute information.
    """
    institute_keywords = [
        'university', 'college', 'institute', 'academy', 'school', 
        'center', 'foundation', 'organization', 'corporation', 'company',
        'inc.', 'ltd.', 'llc', 'certification', 'authority'
    ]
    
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in institute_keywords)

def extract_institute(line: str) -> str:
    """
    Extract institute name from a line.
    """
    # Remove common prefixes/suffixes
    line = re.sub(r'^(issued by|from|by|at)\s*', '', line, flags=re.IGNORECASE)
    line = re.sub(r'\s*(inc\.|ltd\.|llc|corporation|company)$', '', line, flags=re.IGNORECASE)
    
    return line.strip() 