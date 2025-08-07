def parse_summary_section(text):
    """Parse summary section into professional summary"""
    if not text:
        return ""
    
    # Clean up the text
    summary = text.strip()
    
    # Remove any section headers that might be included
    summary_lines = summary.split('\n')
    cleaned_lines = []
    
    for line in summary_lines:
        line_stripped = line.strip()
        if line_stripped:
            # Skip lines that look like section headers
            line_lower = line_stripped.lower()
            if any(keyword in line_lower for keyword in ['summary', 'about', 'profile', 'objective','about me']):
                continue
            cleaned_lines.append(line_stripped)
    
    # Join the cleaned lines
    summary_text = ' '.join(cleaned_lines)
    
    # Additional cleaning: remove any remaining section header patterns
    summary_text = summary_text.replace('Summary:', '').replace('About Me:', '').replace('Profile:', '')
    summary_text = summary_text.replace('SUMMARY:', '').replace('ABOUT ME:', '').replace('PROFILE:', '')
    
    # Clean up extra whitespace but preserve content
    summary_text = ' '.join(summary_text.split())
    
    # Ensure we don't lose content - if the cleaned text is empty but original had content,
    # return the original text with minimal cleaning
    if not summary_text and summary.strip():
        # Fallback: just remove obvious headers and return the rest
        original_lines = summary.split('\n')
        fallback_lines = []
        for line in original_lines:
            line_stripped = line.strip()
            if line_stripped:
                line_lower = line_stripped.lower()
                # Only skip obvious headers, not content that might contain keywords
                if line_lower in ['summary', 'about me', 'profile', 'objective']:
                    continue
                fallback_lines.append(line_stripped)
        
        if fallback_lines:
            summary_text = ' '.join(fallback_lines)
    
    return summary_text 