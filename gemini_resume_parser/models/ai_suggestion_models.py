"""
Pydantic models for AI suggestion service response validation
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime


class WorkExperienceSuggestion(BaseModel):
    """Model for work experience suggestions"""
    role: str = Field(..., description="Job role/title")
    existing: str = Field(default="", description="Existing work experience content")
    rewrite: str = Field(default="", description="Suggested rewritten content")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for improvement")


class ProjectSuggestion(BaseModel):
    """Model for project suggestions"""
    name: str = Field(..., description="Project name")
    existing: str = Field(default="", description="Existing project content")
    rewrite: str = Field(default="", description="Suggested rewritten content")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for improvement")


class SkillsSuggestion(BaseModel):
    """Model for skills suggestions"""
    existing: Dict[str, Any] = Field(default_factory=dict, description="Existing skills (can be dict or list)")
    rewrite: Dict[str, Any] = Field(default_factory=dict, description="Suggested skills additions (can be dict or list)")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for improvement")

    @validator('existing', 'rewrite', pre=True)
    def validate_skills_format(cls, v):
        """Handle both dict and list formats for skills"""
        if v is None:
            return {}
        if isinstance(v, list):
            return {"General": v}
        if isinstance(v, dict):
            return v
        if isinstance(v, str):
            return {"General": [v]}
        return {}

    @validator('recommendations', pre=True)
    def validate_recommendations(cls, v):
        """Ensure recommendations is a list of strings"""
        if v is None:
            return []
        if isinstance(v, list):
            return [str(item) for item in v if item]
        if isinstance(v, str):
            return [v]
        return []


class EducationSuggestion(BaseModel):
    """Model for education suggestions"""
    existing: List[str] = Field(default_factory=list, description="Existing education content")
    rewrite: str = Field(default="", description="Suggested rewritten content")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for improvement")

    @validator('existing', pre=True)
    def validate_existing_education(cls, v):
        """Handle both string and list formats for existing education"""
        if v is None:
            return []
        if isinstance(v, str):
            # Split by newlines and clean up
            items = [item.strip() for item in v.split('\n') if item.strip()]
            return items
        if isinstance(v, list):
            return [str(item) for item in v if item]
        return []

    @validator('recommendations', pre=True)
    def validate_recommendations(cls, v):
        """Ensure recommendations is a list of strings"""
        if v is None:
            return []
        if isinstance(v, list):
            return [str(item) for item in v if item]
        if isinstance(v, str):
            return [v]
        return []


class CertificationsSuggestion(BaseModel):
    """Model for certifications suggestions"""
    existing: List[str] = Field(default_factory=list, description="Existing certifications")
    rewrite: str = Field(default="", description="Suggested rewritten content")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for improvement")

    @validator('existing', pre=True)
    def validate_existing_certifications(cls, v):
        """Handle both string and list formats for existing certifications"""
        if v is None:
            return []
        if isinstance(v, str):
            # Split by newlines and clean up
            items = [item.strip() for item in v.split('\n') if item.strip()]
            return items
        if isinstance(v, list):
            return [str(item) for item in v if item]
        return []

    @validator('recommendations', pre=True)
    def validate_recommendations(cls, v):
        """Ensure recommendations is a list of strings"""
        if v is None:
            return []
        if isinstance(v, list):
            return [str(item) for item in v if item]
        if isinstance(v, str):
            return [v]
        return []


class ProfessionalSummarySuggestion(BaseModel):
    """Model for professional summary suggestions"""
    existing: str = Field(default="", description="Existing professional summary")
    rewrite: str = Field(default="", description="Suggested rewritten content")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for improvement")


class SectionSuggestions(BaseModel):
    """Model for all section suggestions"""
    professionalSummary: ProfessionalSummarySuggestion = Field(default_factory=ProfessionalSummarySuggestion)
    skills: SkillsSuggestion = Field(default_factory=SkillsSuggestion)
    workExperience: List[WorkExperienceSuggestion] = Field(default_factory=list)
    projects: List[ProjectSuggestion] = Field(default_factory=list)
    education: EducationSuggestion = Field(default_factory=EducationSuggestion)
    certifications: CertificationsSuggestion = Field(default_factory=CertificationsSuggestion)


class AIComparisonResponse(BaseModel):
    """Main model for AI comparison response"""
    overallScore: int = Field(..., ge=0, le=100, description="Overall score between 0-100")
    analysisTimestamp: str = Field(..., description="ISO timestamp of analysis")
    sectionSuggestions: SectionSuggestions = Field(default_factory=SectionSuggestions)
    topRecommendations: List[str] = Field(default_factory=list, description="Top recommendations")

    @validator('overallScore')
    def validate_score(cls, v):
        """Ensure score is between 0-100"""
        if not isinstance(v, int):
            try:
                v = int(v)
            except (ValueError, TypeError):
                v = 0
        return max(0, min(100, v))

    @validator('analysisTimestamp')
    def validate_timestamp(cls, v):
        """Ensure timestamp is valid ISO format"""
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except (ValueError, TypeError):
            return datetime.utcnow().isoformat() + 'Z'

    @validator('topRecommendations')
    def validate_recommendations(cls, v):
        """Ensure recommendations is a list of strings"""
        if not isinstance(v, list):
            return []
        return [str(item) for item in v if item]


class JobDescriptionResponse(BaseModel):
    """Model for job description generation response"""
    jobDescription: str = Field(..., description="Generated job description")
    sector: str = Field(..., description="Target sector")
    country: str = Field(..., description="Target country")
    designation: str = Field(..., description="Job designation")
    experienceLevel: str = Field(..., description="Target experience level")
    generatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + 'Z')


class ResumeData(BaseModel):
    """Model for input resume data validation"""
    professionalSummary: Optional[str] = Field(default="")
    skills: Optional[List[str]] = Field(default_factory=list)
    workExperience: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    projects: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    education: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    certifications: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    summary: Optional[str] = Field(default="")  # Alternative field name

    @validator('skills', pre=True)
    def validate_skills(cls, v):
        """Ensure skills is a list of strings"""
        if v is None:
            return []
        if isinstance(v, str):
            return [v]
        if isinstance(v, list):
            return [str(item) for item in v if item]
        return []

    @validator('workExperience', 'projects', 'education', 'certifications', pre=True)
    def validate_lists(cls, v):
        """Ensure list fields are lists"""
        if v is None:
            return []
        if isinstance(v, list):
            return v
        return []

    @validator('professionalSummary', 'summary', pre=True)
    def validate_strings(cls, v):
        """Ensure string fields are strings"""
        if v is None:
            return ""
        return str(v)
