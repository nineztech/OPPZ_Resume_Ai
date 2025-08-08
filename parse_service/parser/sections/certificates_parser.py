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
        print("DEBUG: Empty certificates text")
        return []
    
    print(f"DEBUG: Parsing certificates text: {len(certificates_text)} characters")
    print(f"DEBUG: Certificates text: {certificates_text[:200]}...")
    
    certificates = []
    lines = certificates_text.strip().split('\n')
    current_certificate = {}
    
    print(f"DEBUG: Processing {len(lines)} lines")
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        print(f"DEBUG: Line {i}: '{line}'")
        
        # Check if this is a new certificate entry
        if is_new_certificate_entry(line):
            print(f"DEBUG: New certificate entry detected: '{line}'")
            # Save previous certificate if exists
            if current_certificate:
                certificates.append(current_certificate)
                print(f"DEBUG: Added certificate: {current_certificate}")
                current_certificate = {}
            
            # Start new certificate with name
            current_certificate['certificateName'] = clean_certificate_name(line)
            current_certificate['link'] = ''
            current_certificate['startDate'] = ''
            current_certificate['endDate'] = ''
            current_certificate['instituteName'] = ''
            
        elif current_certificate:
            # Try to identify what type of information this line contains
            if is_link_line(line):
                current_certificate['link'] = extract_link(line)
                print(f"DEBUG: Found link: {current_certificate['link']}")
            elif is_date_line(line):
                dates = extract_dates(line)
                if dates:
                    if len(dates) >= 2:
                        current_certificate['startDate'] = dates[0]
                        current_certificate['endDate'] = dates[1]
                    elif len(dates) == 1:
                        current_certificate['startDate'] = dates[0]
                    print(f"DEBUG: Found dates: {dates}")
            elif is_institute_line(line):
                current_certificate['instituteName'] = extract_institute(line)
                print(f"DEBUG: Found institute: {current_certificate['instituteName']}")
            else:
                # If it's not a specific field, it might be additional description
                # or institute name without clear indicators
                if not current_certificate.get('instituteName'):
                    current_certificate['instituteName'] = line
                    print(f"DEBUG: Assigned as institute: {line}")
    
    # Add the last certificate
    if current_certificate:
        certificates.append(current_certificate)
        print(f"DEBUG: Added final certificate: {current_certificate}")
    
    print(f"DEBUG: Found {len(certificates)} certificates with normal parsing")
    
    # If no certificates were found with the normal parsing, try alternative parsing
    if not certificates:
        print("DEBUG: No certificates found with normal parsing, trying alternative method")
        certificates = parse_certificates_alternative(lines)
        print(f"DEBUG: Alternative parsing found {len(certificates)} certificates")
    
    return certificates

def parse_certificates_alternative(lines: List[str]) -> List[Dict[str, str]]:
    """
    Alternative parsing method for certificates when normal parsing fails.
    This method looks for patterns that might indicate certificates.
    """
    certificates = []
    i = 0
    
    print("DEBUG: Starting alternative certificate parsing")
    
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        
        print(f"DEBUG: Alternative parsing - checking line {i}: '{line}'")
        
        # Look for potential certificate patterns
        if looks_like_certificate_name(line):
            print(f"DEBUG: Alternative parsing - found certificate name: '{line}'")
            certificate = {
                'certificateName': clean_certificate_name(line),
                'link': '',
                'startDate': '',
                'endDate': '',
                'instituteName': ''
            }
            
            # Look at next few lines for additional info
            j = i + 1
            while j < len(lines) and j < i + 5:  # Look at next 5 lines max
                next_line = lines[j].strip()
                if not next_line:
                    j += 1
                    continue
                
                print(f"DEBUG: Alternative parsing - checking next line {j}: '{next_line}'")
                
                # If next line looks like a new certificate, stop
                if looks_like_certificate_name(next_line):
                    print(f"DEBUG: Alternative parsing - next line looks like new certificate, stopping")
                    break
                
                # Check what type of info this line contains
                if is_link_line(next_line):
                    certificate['link'] = extract_link(next_line)
                    print(f"DEBUG: Alternative parsing - found link: {certificate['link']}")
                elif is_date_line(next_line):
                    dates = extract_dates(next_line)
                    if dates:
                        if len(dates) >= 2:
                            certificate['startDate'] = dates[0]
                            certificate['endDate'] = dates[1]
                        elif len(dates) == 1:
                            certificate['startDate'] = dates[0]
                        print(f"DEBUG: Alternative parsing - found dates: {dates}")
                elif is_institute_line(next_line):
                    certificate['instituteName'] = extract_institute(next_line)
                    print(f"DEBUG: Alternative parsing - found institute: {certificate['instituteName']}")
                elif not certificate.get('instituteName'):
                    # If no institute found yet, this might be the institute
                    certificate['instituteName'] = next_line
                    print(f"DEBUG: Alternative parsing - assigned as institute: {next_line}")
                
                j += 1
            
            certificates.append(certificate)
            print(f"DEBUG: Alternative parsing - added certificate: {certificate}")
            i = j  # Skip the lines we've already processed
        else:
            i += 1
    
    print(f"DEBUG: Alternative parsing completed, found {len(certificates)} certificates")
    return certificates

def looks_like_certificate_name(line: str) -> bool:
    """
    Check if a line looks like a certificate name using more lenient criteria.
    """
    if len(line) < 3 or len(line) > 100:
        print(f"DEBUG: Line too short or too long: '{line}' (length: {len(line)})")
        return False
    
    line_lower = line.lower()
    
    # Skip obvious non-certificate lines
    if any(keyword in line_lower for keyword in ['http', 'www', 'link:', 'url:', 'issued:', 'valid:', 'expires:']):
        print(f"DEBUG: Line contains non-certificate keywords: '{line}'")
        return False
    
    # Skip date-only lines
    if re.match(r'^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$', line) or re.match(r'^\d{4}$', line):
        print(f"DEBUG: Line is date-only: '{line}'")
        return False
    
    # Certificate names typically contain letters and may be in various formats
    if re.search(r'[A-Za-z]', line):
        # Check for certificate-related keywords
        cert_keywords = ['certified', 'certification', 'certificate', 'diploma', 'license', 'accreditation', 'qualification', 'aws', 'azure', 'microsoft', 'cisco', 'oracle']
        has_cert_keyword = any(keyword in line_lower for keyword in cert_keywords)
        
        # If it has certificate keywords, it's likely a certificate
        if has_cert_keyword:
            print(f"DEBUG: Line has certificate keyword: '{line}'")
            return True
        
        # Check for common certificate name patterns
        # Certificate names are often in title case, all caps, or sentence case
        if (line[0].isupper() or line.isupper()) and len(line) >= 3:
            # Should not be just a single short word
            words = line.split()
            if len(words) >= 1 and len(words) <= 8:
                print(f"DEBUG: Line looks like certificate name: '{line}'")
                return True
    
    print(f"DEBUG: Line does not look like certificate name: '{line}'")
    return False

def is_new_certificate_entry(line: str) -> bool:
    """
    Check if a line represents the start of a new certificate entry.
    """
    line_upper = line.upper()
    line_lower = line.lower()
    
    print(f"DEBUG: Checking if line is new certificate entry: '{line}'")
    
    # Skip lines that are clearly not certificate names
    if any(keyword in line_upper for keyword in ['HTTP', 'WWW', 'LINK:', 'URL:', 'CERTIFICATE:', 'CERTIFICATION:', 'ISSUED:', 'VALID:', 'EXPIRES:']):
        print(f"DEBUG: Line contains non-certificate keywords: '{line}'")
        return False
    
    # Skip lines that are clearly dates
    if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', line):
        print(f"DEBUG: Line contains date pattern: '{line}'")
        return False
    
    # Skip lines that are clearly institutes (common institute keywords)
    institute_keywords = ['UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'ACADEMY', 'SCHOOL', 'CENTER', 'FOUNDATION', 'CORPORATION', 'INC.', 'LTD.', 'LLC']
    if any(keyword in line_upper for keyword in institute_keywords):
        print(f"DEBUG: Line contains institute keywords: '{line}'")
        return False
    
    # Skip lines that are too short (likely not certificate names)
    if len(line) < 3:
        print(f"DEBUG: Line too short: '{line}' (length: {len(line)})")
        return False
    
    # Skip lines that are too long (likely descriptions)
    if len(line) > 100:
        print(f"DEBUG: Line too long: '{line}' (length: {len(line)})")
        return False
    
    # Certificate names typically contain letters and may contain common certificate keywords
    certificate_keywords = ['certified', 'certification', 'certificate', 'diploma', 'license', 'accreditation', 'qualification']
    has_certificate_keyword = any(keyword in line_lower for keyword in certificate_keywords)
    
    # Check if it looks like a certificate name
    # Certificate names are usually in title case, sentence case, or all caps
    # and contain letters
    if re.search(r'[A-Za-z]', line):
        # Check for common certificate name patterns
        if (line[0].isupper() or line.isupper()) and len(line) >= 3:
            # If it has certificate keywords, it's likely a certificate name
            if has_certificate_keyword:
                print(f"DEBUG: Line has certificate keyword: '{line}'")
                return True
            
            # If it's in title case or all caps and not too long, it might be a certificate name
            if (line.istitle() or line.isupper()) and len(line) <= 80:
                # Additional check: should not be just a single word that's too short
                words = line.split()
                if len(words) >= 1 and len(words) <= 10:
                    print(f"DEBUG: Line looks like certificate name: '{line}'")
                    return True
    
    print(f"DEBUG: Line does not look like certificate entry: '{line}'")
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
        'inc.', 'ltd.', 'llc', 'certification', 'authority', 'microsoft',
        'amazon', 'google', 'cisco', 'oracle', 'ibm', 'aws', 'azure'
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

def clean_certificate_name(certificate_name: str) -> str:
    """
    Clean certificate name by removing link identifiers and prefixes.
    
    Args:
        certificate_name (str): Raw certificate name that may contain link identifiers
        
    Returns:
        str: Cleaned certificate name without link identifiers
    """
    if not certificate_name:
        return certificate_name
    
    # Remove common link identifiers that appear at the beginning
    link_identifiers = [
        r'^certificate:\s*',
        r'^certification:\s*',
        r'^cert:\s*',
        r'^link:\s*',
        r'^url:\s*',
        r'^https?://[^\s]*\s*',
        r'^www\.[^\s]*\s*'
    ]
    
    cleaned_name = certificate_name
    for pattern in link_identifiers:
        cleaned_name = re.sub(pattern, '', cleaned_name, flags=re.IGNORECASE)
    
    # Remove trailing whitespace
    cleaned_name = cleaned_name.strip()
    
    print(f"DEBUG: Cleaned certificate name: '{certificate_name}' -> '{cleaned_name}'")
    return cleaned_name 