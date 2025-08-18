# ATS Integration - Resume Score Feature

This document explains the ATS (Applicant Tracking System) integration that provides Resume Worded-style "Score My Resume" functionality using the Gemini Resume Parser API.

## Features Added

### 1. ATS Service (`src/services/atsService.ts`)
- **Standard ATS Analysis**: Evaluates resumes against general ATS best practices
- **Job-Specific Analysis**: Compares resumes against specific job descriptions
- **Resume Parsing**: Extracts structured data from resume files
- **Health Check**: Monitors API availability

### 2. ATS Score Page (`src/pages/ATSScorePage.tsx`)
- Full-page interface for resume analysis
- Drag-and-drop file upload
- Real-time analysis results with detailed breakdowns
- Category scores, strengths, weaknesses, and recommendations
- Support for both standard and job-specific analysis modes

### 3. ATS Upload Modal (`src/components/modals/ATSUploadModal.tsx`)
- Reusable modal component for quick ATS analysis
- Can be integrated into other pages
- Compact interface with same functionality as the full page

### 4. Navigation Integration
- Added "ATS Score" to main navigation in Header.tsx
- Protected route requiring user authentication
- New route `/resume/ats-score` added to App.tsx

## API Integration

The client connects to the Gemini Resume Parser API running on `http://localhost:5000` with these endpoints:

- `POST /ats/standard` - Standard ATS analysis
- `POST /ats/jd-specific` - Job description specific analysis  
- `POST /parse` - Resume parsing
- `GET /health` - Health check

## Usage

### Starting the API Server

1. Navigate to the gemini_resume_parser directory:
```bash
cd gemini_resume_parser
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set your Gemini API key:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

4. Start the server:
```bash
python web_ui.py
```

The API will be available at `http://localhost:5000`

### Using the ATS Feature

1. **Access**: Navigate to `/resume/ats-score` (requires login)

2. **Analysis Types**:
   - **Standard Analysis**: General ATS optimization feedback
   - **Job-Specific Analysis**: Match against specific job description

3. **File Support**: PDF, DOCX, and TXT files (max 10MB)

4. **Results Include**:
   - Overall ATS score (0-100)
   - Category breakdowns
   - Strengths and weaknesses
   - Actionable recommendations
   - Missing keywords (job-specific mode)

## Score Interpretation

- **80-100**: Excellent - Well-optimized for ATS systems
- **65-79**: Good - Minor improvements needed  
- **45-64**: Fair - Significant improvements required
- **0-44**: Poor - Major overhaul needed

## Technical Details

### File Structure
```
client/
├── src/
│   ├── services/
│   │   └── atsService.ts          # API client service
│   ├── pages/
│   │   └── ATSScorePage.tsx       # Main ATS analysis page
│   ├── components/
│   │   └── modals/
│   │       └── ATSUploadModal.tsx # Reusable ATS modal
│   └── components/layout/
│       └── Header.tsx             # Updated navigation
└── App.tsx                        # Updated routing
```

### Dependencies Added
- Existing UI components (Button, Card, Dialog, etc.)
- Framer Motion for animations
- Lucide React for icons
- Existing toast system for notifications

### Error Handling
- File type validation
- File size limits
- Network error handling
- API error responses
- User-friendly error messages

## Configuration

The ATS service base URL can be configured in `atsService.ts`:

```typescript
constructor(baseUrl: string = 'http://localhost:5000') {
  this.baseUrl = baseUrl;
}
```

For production, update this to point to your deployed Gemini Resume Parser API.

## Security Notes

- All routes are protected and require user authentication
- File uploads are validated for type and size
- API calls include proper error handling
- No sensitive data is stored client-side

## Future Enhancements

Potential improvements that could be added:

1. **Resume History**: Store and track previous analysis results
2. **Comparison Mode**: Compare multiple resume versions
3. **Industry-Specific Analysis**: Tailored feedback by industry
4. **Real-time Editing**: Live ATS score updates while editing
5. **Batch Analysis**: Analyze multiple resumes at once
6. **Export Reports**: PDF/Excel export of analysis results

## Troubleshooting

### Common Issues

1. **"ATS service unavailable"**
   - Ensure the Gemini Resume Parser API is running
   - Check the API URL in atsService.ts
   - Verify GEMINI_API_KEY is set

2. **"Analysis failed"**
   - Check file format (PDF, DOCX, TXT only)
   - Verify file size is under 10MB
   - Ensure file contains readable text

3. **"No text extracted from file"**
   - File may be corrupted or password-protected
   - Try a different file format
   - Ensure file contains actual text content

4. **CORS errors**
   - API server includes CORS headers for localhost:3000 and localhost:5173
   - For different ports, update the CORS configuration in web_ui.py

## Support

For issues related to:
- **Client-side functionality**: Check browser console for errors
- **API integration**: Verify API server logs
- **File processing**: Test with different file formats
- **Authentication**: Ensure user is logged in

The integration follows the existing codebase patterns and maintains consistency with the current UI/UX design.
