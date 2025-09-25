import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class OpenAIConfig:
    """Configuration class for OpenAI API settings"""
    
    # OpenAI API Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    
    # PDF Processing Configuration
    MAX_PDF_SIZE_MB = int(os.getenv('MAX_PDF_SIZE_MB', '10'))
    SUPPORTED_FORMATS = ['.pdf', '.docx', '.txt']
    
    # Parsing Configuration
    DEFAULT_PROMPT_TEMPLATE = """
    You are an advanced resume parsing system that handles ALL types of resumes including academic, professional, student, and non-standard formats.
    Extract all possible information from the given resume text, even if the section headings differ or are non-standard.
    Map them into the following JSON structure exactly, with empty strings ("") only if information is truly missing.
    
    **CRITICAL: Handle All Resume Types**
    - Academic/Student resumes with course projects
    - Professional resumes with work experience
    - Non-standard formats with unusual section names
    - Resumes with mixed content (both academic and professional)
    - International resumes with different formatting
    
    **CRITICAL: Name Extraction Rules**
    - ALWAYS extract the FULL NAME from the resume header/top section
    - Handle split names like "S T R M AI EJA EDDY ADDIKARA" -> "STRM AI EJA EDDY ADDIKARA"
    - Look for names in formats: "John Smith", "J. Smith", "John S.", "Smith, John", "JOHN SMITH", "S T R M NAME"
    - If names are split across lines, combine them intelligently
    - Check the very top of the resume, header section, or first few lines for the name
    - Handle initials and abbreviated names properly
    
    **CRITICAL: Experience Section Handling**
    - Academic projects under "COURSE:" should be mapped to "projects" section, not "experience"
    - Course-based work should be treated as academic projects
    - Only actual employment should go in "experience" section
    - If no real work experience exists, leave experience array empty
    - Academic research, thesis work, and course projects belong in "projects"
    
    **CRITICAL: Section Detection and Mapping**
    The "summary" field should contain content from sections labeled as:
    - "PROFILE", "Summary", "Professional Summary", "About Me"
    - "Career Objective", "Objective", "Career Highlights"
    - "Professional Profile", "Bio", "Introduction"
    - "Personal Statement", "Career Goal", "Mission Statement"
    
    **Academic Resume Specific Handling:**
    - "COURSE:" sections = Academic Projects (map to projects)
    - "RESEARCH PROJECT:" = Academic Projects
    - "THESIS:" = Academic Projects
    - "ACADEMIC PROJECTS:" = Projects
    - "COURSEWORK:" = Education details
    - "RELEVANT COURSEWORK:" = Education details
    
    **Professional Resume Specific Handling:**
    - "WORK EXPERIENCE:" = Experience
    - "EMPLOYMENT:" = Experience
    - "CAREER HISTORY:" = Experience
    - "PROFESSIONAL EXPERIENCE:" = Experience
    
    **Skills Section Handling:**
    - PRESERVE ORIGINAL SKILL CATEGORIES as they appear in the resume
    - Extract skills in their original categorized format (e.g., "Languages", "Frameworks", "Tools", "Cloud", etc.)
    - Do NOT recategorize or merge skill categories - keep them exactly as they appear
    - Technical skills (Python, Java, etc.) = Skills
    - Communication languages (English, Spanish, etc.) = Languages
    - Distinguish between technical and communication languages
    
    **Education Section Handling:**
    - Extract incomplete dates (e.g., "MONTH 2025" -> "2025")
    - Handle degree abbreviations (M.SC., B.S., etc.)
    - Include relevant coursework in education description
    
    Sections and possible variations to detect:
    basic_details: ["Basic Details", "Personal Information", "Contact Info", "Contacts", "Profile Info", "Header", "Name", "Contact Information", "Personal Details"]
    summary: ["Summary", "PROFILE", "Professional Summary", "Profile", "About Me", "Career Objective", "Objective", "Career Highlights", "Professional Profile", "Bio", "Introduction", "Personal Statement", "Career Goal", "Mission Statement"]
    skills: ["Skills", "Technical Skills", "Core Competencies", "Key Skills", "Expertise", "Strengths", "Technologies", "Tech Stack", "Technical Proficiencies", "Programming Languages", "Software Skills"]
    education: ["Education", "Academic Background", "Educational Qualifications", "Studies", "Academics", "Education and Credentials", "Academic Credentials"]
    experience: ["Experience", "Work Experience", "Professional Experience", "Employment History", "Work History", "Career History", "Positions Held", "Job Experience", "Professional Background", "Employment", "Career"]
    projects: ["Projects", "Key Projects", "Work Samples", "Portfolio", "Assignments", "Case Studies", "Academic Projects", "Research Projects", "Course Projects", "Thesis Work", "COURSE:", "RESEARCH PROJECT:", "THESIS:"]
    certifications: ["Certifications", "Courses", "Completed Courses", "Licenses", "Accreditations", "Professional Certifications", "Training"]
    languages: ["Languages", "Languages Known", "Language Proficiency", "Communication Languages", "Spoken Languages"]
    references: ["References", "Referees", "Professional References", "Recommendation Contacts"]
    activities: ["Activities", "Hobbies", "Interests", "Volunteer Work", "Extra-Curricular Activities", "Achievements", "Awards", "Publications", "Miscellaneous", "Additional Information"]

    Parse the following resume text into structured JSON with these sections:
    Basic Details: Full Name (MUST include first AND last name, handle split names), Professional Title, Phone, Email, Location, Website, GitHub, LinkedIn
    summary: Extract ALL content from Profile/Summary sections (this is crucial - do not leave empty if Profile content exists)
    Skills: Technical skills in their original categorized format (preserve categories like "Languages", "Frameworks", "Tools", "Cloud", etc. as they appear in the resume)
    Education: Institution, Degree, Start Date, End Date, Grade, Description (include relevant coursework), Location 
    Experience: Only actual employment (Company, Role, Start Date, End Date, Description, Location)
    Projects: Academic projects, course work, research, thesis (Name, Tech Stack, Start Date, End Date, Description, Link)
    Certifications: certificateName, link, startDate, endDate, institueName
    Languages: Communication languages only (English, Spanish, etc.) with proficiency levels
    References: Name, Title, Company, Phone, email, relationship
    Activities: Hobbies, interests, volunteer work, achievements, awards
    
    Resume text: {resume_text}
    
    **IMPORTANT**: 
    1. Ensure the name field contains the complete name (first + last) as it appears on the resume
    2. Distinguish between academic projects (COURSE:) and professional experience
    3. Handle incomplete dates gracefully
    4. Separate technical skills from communication languages
    5. Extract all available information even from non-standard formats
    6. **CRITICAL FORMATTING**: For ALL description fields (experience, projects, education, activities, etc.), format each sentence to end with \n (newline character). This ensures proper bullet point formatting in the frontend.
    
    **DESCRIPTION FORMATTING RULES**:
    - Experience descriptions: Each responsibility/achievement should be a separate sentence ending with \n
    - Project descriptions: Each feature/achievement should be a separate sentence ending with \n  
    - Education descriptions: Each detail should be a separate sentence ending with \n
    - Activity descriptions: Each detail should be a separate sentence ending with \n
    - Example: "Developed web applications using React and Node.js.\nImplemented responsive design for mobile devices.\nCollaborated with team of 5 developers.\n"
    
    Output in pure JSON format only. Return ONLY the JSON output — no explanations.
    """
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        return True

