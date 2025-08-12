# Gemini Resume Parser

A Python package for intelligent resume parsing using Google's Gemini AI API. This package provides advanced resume parsing capabilities with structured JSON output.

## Features

- **AI-Powered Parsing**: Uses Google Gemini API for intelligent resume analysis
- **Multiple Format Support**: PDF, DOCX, and TXT file formats
- **Structured Output**: Returns parsed data in organized JSON format
- **Configurable Prompts**: Customizable parsing prompts for different use cases
- **Error Handling**: Robust error handling and fallback mechanisms
- **Command Line Interface**: Easy-to-use CLI for batch processing

## Installation

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key

### Install Dependencies

```bash
cd gemini_resume_parser
pip install -r requirements.txt
```

### Set Environment Variables

Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
MAX_PDF_SIZE_MB=10
```

## Quick Start

### Basic Usage

```python
from gemini_resume_parser import GeminiResumeParser

# Initialize parser
parser = GeminiResumeParser()

# Parse resume from file
parsed_data = parser.parse_resume_from_file("resume.pdf")

# Parse resume text directly
parsed_data = parser.parse_resume_text("Your resume text here...")

print(parsed_data)
```

### Command Line Usage

```bash
# Parse a resume file
python main.py resume.pdf

# Save output to JSON file
python main.py resume.pdf -o results.json

# Use custom API key
python main.py resume.pdf --api-key YOUR_API_KEY

# Enable verbose logging
python main.py resume.pdf -v
```

## API Reference

### GeminiResumeParser

Main class for resume parsing operations.

#### Methods

- `parse_resume_from_file(file_path)`: Parse resume from file
- `parse_resume_text(text, custom_prompt)`: Parse resume text with optional custom prompt
- `get_model_info()`: Get information about the current Gemini model

#### Parameters

- `file_path`: Path to resume file (PDF, DOCX, TXT)
- `text`: Raw resume text
- `custom_prompt`: Optional custom parsing prompt
- `api_key`: Gemini API key (optional, uses environment variable by default)

### DocumentExtractor

Utility class for extracting text from various document formats.

#### Methods

- `extract_text(file_path)`: Extract text based on file extension
- `extract_text_from_pdf(file_path)`: Extract text from PDF files
- `validate_file(file_path)`: Check if file is supported

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | Required |
| `GEMINI_MODEL` | Gemini model to use | `gemini-1.5-flash` |
| `MAX_PDF_SIZE_MB` | Maximum PDF file size | `10` |

### Custom Prompts

You can customize the parsing prompt for specific use cases:

```python
custom_prompt = """
Parse this resume focusing on technical skills and experience:
{resume_text}
Output in JSON format with emphasis on technical details.
"""

parsed_data = parser.parse_resume_text(resume_text, custom_prompt)
```

## Output Format

The parser returns structured JSON with the following sections:

```json
{
  "Basic Details": {
    "Full Name": "John Doe",
    "Professional Title": "Software Engineer",
    "Phone": "+1-555-0123",
    "Email": "john.doe@email.com",
    "Location": "San Francisco, CA",
    "Website": "https://johndoe.com",
    "GitHub": "github.com/johndoe",
    "LinkedIn": "linkedin.com/in/johndoe"
  },
  "summary": "Experienced software engineer...",
  "Skills": {
    "Programming Languages": ["Python", "JavaScript"],
    "Technologies & Tools": ["React", "Node.js"]
  },
  "Education": [...],
  "Experience": [...],
  "Projects": [...],
  "Certifications": [...],
  "Languages": [...],
  "References": [...]
}
```

## Integration with Existing Projects

### Import in Your Code

```python
import sys
sys.path.append('path/to/gemini_resume_parser')

from gemini_resume_parser import GeminiResumeParser

# Use in your application
parser = GeminiResumeParser()
```

### Error Handling

```python
try:
    parsed_data = parser.parse_resume_from_file("resume.pdf")
except ValueError as e:
    print(f"Validation error: {e}")
except Exception as e:
    print(f"Parsing error: {e}")
```

## Examples

### Example 1: Basic File Parsing

```python
from gemini_resume_parser import GeminiResumeParser

parser = GeminiResumeParser()
result = parser.parse_resume_from_file("resume.pdf")
print(f"Parsed {result['Basic Details']['Full Name']}'s resume")
```

### Example 2: Custom Prompt

```python
custom_prompt = """
Extract only the technical skills and programming languages from this resume:
{resume_text}
Return as JSON with format: {"technical_skills": [], "languages": []}
"""

result = parser.parse_resume_text(resume_text, custom_prompt)
```

### Example 3: Batch Processing

```python
import os
from pathlib import Path

resume_dir = Path("resumes/")
results = {}

for resume_file in resume_dir.glob("*.pdf"):
    try:
        result = parser.parse_resume_from_file(resume_file)
        results[resume_file.name] = result
    except Exception as e:
        print(f"Failed to parse {resume_file}: {e}")
```

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `GEMINI_API_KEY` is set in environment
2. **File Format Error**: Check if file format is supported
3. **JSON Parsing Error**: The AI response might need cleaning

### Debug Mode

Enable verbose logging for detailed information:

```bash
python main.py resume.pdf -v
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the examples
- Open an issue on GitHub

## Changelog

### Version 1.0.0
- Initial release
- Basic resume parsing functionality
- PDF, DOCX, and TXT support
- Command-line interface
- Configuration management

