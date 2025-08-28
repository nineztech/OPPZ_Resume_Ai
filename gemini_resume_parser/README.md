# Gemini Resume Parser with AI Suggestions

A powerful resume parsing and AI suggestion service using Google's Gemini AI model, optimized for consistent and accurate results.

## 🎯 Key Features

- **Resume Parsing**: Extract structured data from resumes in various formats
- **AI Job Description Generation**: Create tailored job descriptions based on sector, country, and role
- **Resume-JD Comparison**: Get actionable suggestions to improve resume alignment
- **ATS Optimization**: Analyze resumes against ATS best practices
- **Consistent Results**: Optimized generation parameters for reliable AI outputs
- **Schema Enforcement**: Guaranteed presence of all required sections, even if AI skips them

## 🚀 Quick Start

### Prerequisites

1. Python 3.8+
2. Google Gemini API key
3. Required Python packages (see `requirements.txt`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gemini_resume_parser

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API key
export GEMINI_API_KEY="your-api-key-here"
```

### Basic Usage

```python
from services.ai_suggestion_service import AISuggestionService

# Initialize with default settings (optimized for consistency)
service = AISuggestionService(api_key="your-api-key")

# Generate a job description
job_desc = service.generate_job_description(
    sector="Technology",
    country="United States",
    designation="Software Engineer"
)

# Compare resume with job description
suggestions = service.compare_resume_with_jd(
    resume_data=resume_data,
    job_description=job_description
)
```

## ⚙️ Generation Configuration

The service is optimized for **consistent and accurate results** using carefully tuned generation parameters:

### Default Settings (Recommended)

- **Temperature**: `0.1` - Low randomness for deterministic responses
- **Top-p**: `0.8` - Balanced diversity without excessive variation
- **Top-k**: `40` - Controlled vocabulary selection
- **Candidate Count**: `1` - Single response for consistency
- **Max Tokens**: `8192` - Sufficient output length

### Parameter Tuning

```python
# For maximum consistency (critical applications)
service = AISuggestionService(
    api_key="your-key",
    temperature=0.05,  # Very low randomness
    top_p=0.6         # Highly focused
)

# For balanced consistency (general use)
service = AISuggestionService(
    api_key="your-key",
    temperature=0.1,   # Low randomness
    top_p=0.8         # Moderate diversity
)

# For slight creativity (creative roles)
service = AISuggestionService(
    api_key="your-key",
    temperature=0.2,   # Slight randomness
    top_p=0.9         # More diverse
)

# Dynamic parameter updates
service.update_generation_parameters(temperature=0.15, top_p=0.85)
```

### Parameter Guidelines

| Use Case | Temperature | Top-p | Description |
|----------|-------------|-------|-------------|
| **Critical Analysis** | 0.05-0.1 | 0.6-0.8 | Maximum consistency, reliable results |
| **General Use** | 0.1-0.15 | 0.8-0.85 | Balanced consistency and creativity |
| **Creative Content** | 0.2-0.3 | 0.85-0.95 | More varied, creative responses |
| **Avoid** | > 0.3 | > 0.95 | May produce inconsistent results |

## 🔧 Service Architecture

### Core Services

1. **AISuggestionService**: Main service for AI-powered suggestions
2. **GeminiResumeParser**: Core resume parsing functionality
3. **ATSService**: ATS optimization and scoring

### Key Methods

- `generate_job_description()`: Create tailored job descriptions
- `compare_resume_with_jd()`: Resume-JD alignment analysis
- `update_generation_parameters()`: Dynamic parameter tuning
- `get_generation_settings()`: Current configuration status
- `_enforce_schema_compliance()`: Guarantees all required sections are present

## 🛡️ Schema Enforcement

The service includes **automatic schema enforcement** to prevent the common issue of missing sections in AI responses.

### Why Sections Go Missing

Even with strict prompting, AI models sometimes:
- Skip sections they think don't need improvement
- Rename sections (e.g., `experience` → `work_experience`)
- Return empty arrays instead of proper objects
- Omit sections due to JSON cleaning issues

### How Schema Enforcement Works

1. **Post-Processing Validation**: After AI response, validates against required schema
2. **Automatic Section Injection**: Adds missing sections with default structures
3. **Fallback to Original Data**: Uses original resume data to populate missing sections
4. **Guaranteed Compliance**: Ensures all required sections are always present

### Required Sections (Always Present)

```json
{
  "sectionSuggestions": {
    "professionalSummary": {"existing": "", "rewrite": "", "recommendations": [""]},
    "skills": {"existing": [], "rewrite": [], "recommendations": [""]},
    "workExperience": [{"role": "", "existing": "", "rewrite": "", "recommendations": [""]}],
    "projects": [{"name": "", "existing": "", "rewrite": "", "recommendations": [""]}],
    "education": {"existing": [], "rewrite": "", "recommendations": [""]},
    "certifications": {"existing": [], "rewrite": "", "recommendations": [""]}
  }
}
```

### Testing Schema Enforcement

```bash
# Test that schema enforcement works correctly
python test_schema_enforcement.py

# Test experience detection specifically
python test_experience_detection.py

# Debug your resume data structure
python debug_resume_data.py your_resume.json
```

## 📊 Testing

Run the generation config test to verify consistency:

```bash
python test_generation_config.py
```

This will test different parameter combinations and show their effects on response consistency.

## 🎯 Best Practices

1. **Start with defaults**: Use the optimized default settings for most applications
2. **Test consistency**: Run multiple generations with the same prompt to verify consistency
3. **Monitor quality**: Use logging to track generation parameters and response quality
4. **Adjust gradually**: Make small parameter changes and test results
5. **Document settings**: Keep track of optimal parameters for different use cases

## 🔍 Troubleshooting

### Common Issues

- **Inconsistent responses**: Lower temperature and top-p values
- **Repetitive outputs**: Slightly increase temperature (0.15-0.2)
- **Truncated responses**: Check max_output_tokens setting
- **API errors**: Verify API key and rate limits

### Logging

The service provides detailed logging for debugging:

```python
import logging
logging.basicConfig(level=logging.INFO)
```

## 📈 Performance Tips

1. **Batch processing**: Process multiple resumes with the same parameters
2. **Cache results**: Store and reuse job descriptions for similar roles
3. **Parameter persistence**: Save optimal settings for different use cases
4. **Monitor costs**: Track API usage and optimize for cost-effectiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes with different generation parameters
4. Submit a pull request with detailed documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
