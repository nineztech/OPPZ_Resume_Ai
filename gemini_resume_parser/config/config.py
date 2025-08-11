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
    Parse the following resume text into structured JSON with these sections:
    Basic Details: Full Name, Professional Title, Phone, Email, Location, Website, GitHub, LinkedIn
    summary
    Skills
    Education: Institution, Degree, Start Date, End Date, Grade, Description
    Experience: Company, Role, Start Date, End Date, Description
    Projects: Name, Tech Stack, Start Date, End Date, Description
    Certifications
    Languages
    References: Name, Title, Company, Phone, email, relationship
    Other Relevant Information
    
    Resume text: {resume_text}
    Output in pure JSON format only.
    """
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        return True
