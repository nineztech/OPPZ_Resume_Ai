# Integration Guide: Gemini Resume Parser with OPPZ Resume AI

This guide explains how to integrate the Gemini Resume Parser with your existing OPPZ Resume AI project.

## Project Structure

```
OPPZ_Resume_Ai/
├── gemini_resume_parser/          # New Gemini parser module
│   ├── config/
│   ├── services/
│   ├── utils/
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── parse_service/                  # Your existing parser
├── client/                        # React frontend
└── server/                        # Node.js backend
```

## Integration Steps

### 1. Install Dependencies

```bash
cd gemini_resume_parser
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file in the `gemini_resume_parser` directory:

```bash
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-1.5-flash
MAX_PDF_SIZE_MB=10
```

### 3. Test the Integration

```bash
cd gemini_resume_parser
python test_parser.py
```

### 4. Integrate with Existing Parser

#### Option A: Replace Existing Parser

Modify your existing `parse_service/parser/resume_parser.py`:

```python
import sys
from pathlib import Path

# Add Gemini parser to path
gemini_path = Path(__file__).parent.parent.parent / "gemini_resume_parser"
sys.path.insert(0, str(gemini_path))

from gemini_resume_parser import GeminiResumeParser

class ResumeParser:
    def __init__(self, use_gemini=True):
        self.use_gemini = use_gemini
        if use_gemini:
            self.gemini_parser = GeminiResumeParser()
    
    def parse_resume(self, file_path):
        if self.use_gemini:
            return self.gemini_parser.parse_resume_from_file(file_path)
        else:
            # Your existing parsing logic
            pass
```

#### Option B: Add as Alternative Parser

Keep your existing parser and add Gemini as an option:

```python
class ResumeParser:
    def __init__(self):
        self.parsers = {
            'traditional': TraditionalParser(),
            'gemini': GeminiResumeParser()
        }
    
    def parse_resume(self, file_path, method='gemini'):
        if method not in self.parsers:
            raise ValueError(f"Unknown parsing method: {method}")
        
        return self.parsers[method].parse_resume_from_file(file_path)
```

### 5. Update Your Main Application

#### Python Backend (parse_service)

```python
# In your main.py or app.py
from gemini_resume_parser import GeminiResumeParser

def parse_resume_endpoint(file_path):
    try:
        parser = GeminiResumeParser()
        result = parser.parse_resume_from_file(file_path)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

#### Node.js Backend (server)

Create a Python bridge in your Node.js server:

```javascript
// In your server.js or controller
const { spawn } = require('child_process');

app.post('/parse-resume', upload.single('resume'), (req, res) => {
    const filePath = req.file.path;
    
    const pythonProcess = spawn('python', [
        'gemini_resume_parser/main.py',
        filePath,
        '--output', 'temp_result.json'
    ]);
    
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            const result = JSON.parse(fs.readFileSync('temp_result.json'));
            res.json({ success: true, data: result });
        } else {
            res.json({ success: false, error: 'Parsing failed' });
        }
    });
});
```

### 6. Frontend Integration

Update your React frontend to handle the new parsing method:

```typescript
// In your resume upload component
const parseResume = async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
        const response = await fetch('/api/parse-resume', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            // Handle parsed data
            setParsedData(result.data);
        } else {
            // Handle error
            setError(result.error);
        }
    } catch (error) {
        setError('Failed to parse resume');
    }
};
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | Required |
| `GEMINI_MODEL` | Model to use | `gemini-1.5-flash` |
| `MAX_PDF_SIZE_MB` | Max file size | `10` |

### Custom Prompts

You can customize the parsing prompt for your specific needs:

```python
custom_prompt = """
Parse this resume for a job application system:
{resume_text}
Focus on skills, experience, and education.
Output in JSON format matching our database schema.
"""

result = parser.parse_resume_text(resume_text, custom_prompt)
```

## Error Handling

The Gemini parser includes robust error handling:

```python
try:
    result = parser.parse_resume_from_file("resume.pdf")
except ValueError as e:
    # Configuration or validation errors
    print(f"Configuration error: {e}")
except Exception as e:
    # API or parsing errors
    print(f"Parsing error: {e}")
```

## Performance Considerations

- **API Limits**: Be aware of Gemini API rate limits
- **File Size**: Large PDFs may take longer to process
- **Caching**: Consider caching parsed results for repeated requests
- **Fallback**: Implement fallback to traditional parsing if Gemini fails

## Testing

### Unit Tests

```bash
cd gemini_resume_parser
python test_parser.py
python main.py
python web_ui.py
```

### Integration Tests

Test with your existing application:

1. Upload a resume through your frontend
2. Verify the parsing works correctly
3. Check that the output format matches your expectations
4. Test error handling with invalid files

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure the `gemini_resume_parser` path is correct
2. **API Key Issues**: Verify your Gemini API key is set correctly
3. **File Format Errors**: Check that your files are in supported formats
4. **JSON Parsing Errors**: The AI response might need additional cleaning

### Debug Mode

Enable verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Next Steps

1. **Test the integration** with sample resumes
2. **Customize the prompts** for your specific use case
3. **Implement error handling** in your application
4. **Add monitoring** for API usage and performance
5. **Consider implementing caching** for parsed results

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the example code
3. Test with the provided test script
4. Check your Gemini API key and quotas








