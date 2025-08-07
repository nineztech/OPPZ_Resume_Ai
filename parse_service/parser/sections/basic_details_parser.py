import re

def extract_contact_info(text):
    """Extract contact information from text"""
    contact_info = {
        "fullName": "",
        "professionalTitle": "",
        "phone": "",
        "email": "",
        "location": "",
        "website": "",
        "github": "",
        "linkedin": ""
    }
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        line_lower = line_stripped.lower()
        
        # Extract email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', line)
        if email_match:
            contact_info["email"] = email_match.group()
        
        # Extract phone
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', line)
        if phone_match:
            contact_info["phone"] = phone_match.group()
        
        # Extract website
        website_match = re.search(r'(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/\S*)?', line)
        if website_match and 'github' not in line_lower and 'linkedin' not in line_lower:
            contact_info["website"] = website_match.group()
        
        # Extract GitHub link
        github_match = re.search(r'github\.com/[a-zA-Z0-9-]+', line)
        if github_match:
            contact_info["github"] = github_match.group()
        
        # Extract LinkedIn link - improved to handle various formats
        
        if 'linkedin' in line_lower:
            # Pattern 1: Direct linkedin.com/in/username
            linkedin_match = re.search(r'linkedin\.com/in/[a-zA-Z0-9-]+', line)
            if linkedin_match:
                contact_info["linkedin"] = linkedin_match.group()
            else:
                # Pattern 2: www.linkedin.com or any subdomain
                linkedin_match = re.search(r'(?:www\.)?[a-zA-Z0-9-]*\.?linkedin\.com/in/[a-zA-Z0-9-]+', line)
                if linkedin_match:
                    contact_info["linkedin"] = linkedin_match.group()
                else:
                    # Pattern 3: Just the username part after linkedin: or LinkedIn:
                    linkedin_match = re.search(r'linkedin\s*:\s*(?:www\.)?([a-zA-Z0-9-]*\.?linkedin\.com/in/[a-zA-Z0-9-]+)', line, re.IGNORECASE)
                    if linkedin_match:
                        contact_info["linkedin"] = linkedin_match.group(1)
                    else:
                        # Pattern 4: Extract any URL containing linkedin
                        linkedin_match = re.search(r'(?:https?://)?((?:www\.)?[a-zA-Z0-9-]*\.?linkedin\.com/[^\s|)]+)', line)
                        if linkedin_match:
                            contact_info["linkedin"] = linkedin_match.group(1)
        
        # Extract location (city, state/country pattern)
        location_match = re.search(r'([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)', line)
        if location_match:
            contact_info["location"] = location_match.group()
        
        # Extract name - improved logic
        if not contact_info["fullName"]:
            # Look for name patterns
            # Pattern 1: All caps name (common in resumes)
            if line_stripped.isupper() and len(line_stripped) > 2 and len(line_stripped) < 50:
                # Check if it's not a section header
                if not any(keyword in line_lower for keyword in ['experience', 'education', 'skills', 'projects', 'about', 'summary']):
                    contact_info["fullName"] = line_stripped.title()
            
            # Pattern 2: Title case name (first letter of each word capitalized)
            elif line_stripped.istitle() and len(line_stripped) > 2 and len(line_stripped) < 50:
                # Check if it's not a section header or contact info
                if not any(keyword in line_lower for keyword in ['email', 'phone', 'linkedin', 'github', 'experience', 'education', 'skills']):
                    contact_info["fullName"] = line_stripped
            
            # Pattern 3: First prominent line that looks like a name
            elif i < 5 and len(line_stripped) > 2 and len(line_stripped) < 50:
                # Check if it looks like a name (not all caps, not too long, not contact info)
                if (not line_stripped.isupper() and 
                    not any(keyword in line_lower for keyword in ['email', 'phone', 'linkedin', 'github', 'experience', 'education', 'skills', 'about', 'summary']) and
                    not re.search(r'[0-9@#$%^&*()]', line_stripped)):
                    contact_info["fullName"] = line_stripped.title()
        
        # Extract professional title
        if not contact_info["professionalTitle"]:
            # Look for title patterns
            title_keywords = ['developer', 'engineer', 'manager', 'analyst', 'specialist', 'lead', 'architect', 'director', 'coordinator', 'assistant', 'intern', 'tech']
            if any(keyword in line_lower for keyword in title_keywords):
                contact_info["professionalTitle"] = line_stripped
    
    # Generate LinkedIn and GitHub URLs based on name if not found
    if contact_info["fullName"] and not contact_info["linkedin"]:
        # Convert "John Doe" to "john-doe"
        username = contact_info["fullName"].lower().replace(" ", "-")
        contact_info["linkedin"] = f"linkedin.com/in/{username}"
    
    if contact_info["fullName"] and not contact_info["github"]:
        # Convert "John Doe" to "john-doe" for GitHub
        username = contact_info["fullName"].lower().replace(" ", "-")
        contact_info["github"] = f"github.com/{username}"
    
    return contact_info