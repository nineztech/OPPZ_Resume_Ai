import re

def parse_volunteering_section(text):
    """Parse volunteering section"""
    volunteering = []
    
    if not text:
        return volunteering
    
    lines = text.split('\n')
    current_vol = {
        "id": "",
        "organization": "",
        "role": "",
        "description": ""
    }
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        # Check if this looks like a new volunteering entry
        if is_new_volunteering_entry(line_stripped):
            if current_vol["organization"] or current_vol["role"]:
                current_vol["id"] = str(len(volunteering) + 1)
                volunteering.append(current_vol.copy())
            current_vol = {
                "id": "",
                "organization": "",
                "role": "",
                "description": ""
            }
        
        # Extract organization
        if is_organization_line(line_stripped):
            current_vol["organization"] = extract_organization(line_stripped)
        # Extract role
        elif is_role_line(line_stripped):
            current_vol["role"] = extract_role(line_stripped)
        # Otherwise, treat as description
        else:
            if current_vol["description"]:
                current_vol["description"] += " " + line_stripped
            else:
                current_vol["description"] = line_stripped
    
    # Add the last volunteering
    if current_vol["organization"] or current_vol["role"]:
        current_vol["id"] = str(len(volunteering) + 1)
        volunteering.append(current_vol)
    
    return volunteering

def is_new_volunteering_entry(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in ['volunteer', 'organization', 'foundation'])

def is_organization_line(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in ['organization', 'ngo', 'foundation', 'charity'])

def extract_organization(line):
    return re.sub(r'Organization|NGO|Foundation|Charity|:', '', line, flags=re.IGNORECASE).strip()

def is_role_line(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in ['volunteer', 'member', 'coordinator', 'assistant'])

def extract_role(line):
    return re.sub(r'Role|Position|Title|:', '', line, flags=re.IGNORECASE).strip() 