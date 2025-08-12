import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiConfig:
    """Configuration class for Gemini API settings"""
    
    # Gemini API Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    
    # PDF Processing Configuration
    MAX_PDF_SIZE_MB = int(os.getenv('MAX_PDF_SIZE_MB', '10'))
    SUPPORTED_FORMATS = ['.pdf', '.docx', '.txt']
    
    # Parsing Configuration
    DEFAULT_PROMPT_TEMPLATE = """
    You are a professional resume parsing system. 
    Extract all possible information from the given resume text, even if the section headings differ. 
    Map them into the following JSON structure exactly, with empty strings ("") only if information is truly missing. 
    If a section is found under a different name, normalize it to the correct field in the output.
    Languages are not technical languages like python, java etc, It is language used for communication like English etc
    IMPORTANT: The "summary" field should contain content from sections labeled as:
    - "PROFILE" (most common)
    - "Summary" 
    - "Professional Summary"
    - "About Me"
    - "Career Objective"
    - "Objective"
    - "Career Highlights"
    - "Professional Profile"
    - "Bio"
    - "Introduction"
    
    If you find any of these sections, extract ALL the text content and place it in the "summary" field.

    Sections and possible variations to detect:
    basic_details: ["Basic Details", "Personal Information", "Contact Info", "Contacts", "Profile Info"]
    summary: ["Summary", "PROFILE", "Professional Summary", "Profile", "About Me", "Career Objective", "Objective", "Career Highlights", "Professional Profile", "Bio", "Introduction"]
    skills: ["Skills", "Technical Skills", "Core Competencies", "Key Skills", "Expertise", "Strengths", "Technologies", "Tech Stack"]
    education: ["Education", "Academic Background", "Educational Qualifications", "Studies", "Academics"]
    experience: ["Experience", "Work Experience", "Professional Experience", "Employment History", "Work History", "Career History", "Positions Held", "Job Experience", "Professional Background"]
    projects: ["Projects", "Key Projects", "Work Samples", "Portfolio", "Assignments", "Case Studies"]
    certifications: ["Certifications", "Courses", "Completed Courses", "Licenses", "Accreditations"]
    languages: ["Languages", "Languages Known", "Language Proficiency"]
    references: ["References", "Referees", "Professional References", "Recommendation Contacts"]
    other: ["Hobbies", "Interests", "Volunteer Work", "Extra-Curricular Activities", "Achievements", "Awards", "Publications", "Miscellaneous"]

    Parse the following resume text into structured JSON with these sections:
    Basic Details: Full Name, Professional Title, Phone, Email, Location, Website, GitHub, LinkedIn
    summary: Extract ALL content from Profile/Summary sections (this is crucial - do not leave empty if Profile content exists)
    Skills: 
    Education: Institution, Degree, Start Date, End Date, Grade, Description, Location 
    Experience: Company, Role, Start Date, End Date, Description, Location 
    Projects: Name, Tech Stack, Start Date, End Date, Description, Link
    Certifications: certificateName, link, startDate, endDate, institueName
    Languages: Name, Proffeciency
    References: Name, Title, Company, Phone, email, relationship
    Other Relevant Information
    
    Resume text: {resume_text}
    
    Output in pure JSON format only. Return ONLY the JSON output — no explanations.
    """
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        return True

