import re

def parse_activities_section(text):
    """Parse activities section"""
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
        
        # Check if this looks like a new activity
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
    
    return activities

def is_new_activity_entry(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in ['activity', 'volunteer', 'community', 'service', 'club', 'organization']) 