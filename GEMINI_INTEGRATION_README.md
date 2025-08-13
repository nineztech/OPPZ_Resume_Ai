# Gemini Resume Parser Integration

This integration connects your React frontend with the Gemini AI-powered resume parser backend.

## Setup Instructions

### 1. Backend Setup (Gemini Parser)

1. Navigate to the `gemini_resume_parser` directory:
   ```bash
   cd gemini_resume_parser
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your Gemini API key:
   - Create a `.env` file in the `gemini_resume_parser` directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. Start the Gemini parser backend:
   ```bash
   python web_ui.py
   ```
   The backend will run on `http://localhost:5000`

### 2. Frontend Setup (React App)

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## How It Works

### 1. Resume Upload Flow

1. User uploads a resume file on the `UseTemplatePage`
2. The file is sent to the Gemini parser backend (`http://localhost:5000/parse`)
3. Gemini AI parses the resume and returns structured JSON data
4. The parsed data is converted to the format expected by `ResumeBuilderPage`
5. User is presented with options to continue with parsed content or get AI suggestions

### 2. Data Flow

```
Resume File → Gemini Parser → Structured JSON → React State → Resume Builder
```

### 3. Parsed Data Structure

The Gemini parser extracts:
- **Basic Details**: Name, title, phone, email, location, website
- **Summary**: Professional summary/profile
- **Experience**: Company, role, dates, description
- **Education**: Institution, degree, dates, description
- **Skills**: Technical and professional skills
- **Languages**: Language proficiencies
- **Projects**: Project details and tech stack
- **Certifications**: Certificates and courses

## API Endpoints

### POST `/parse`
- **Purpose**: Parse uploaded resume file
- **Input**: Form data with resume file
- **Output**: JSON with parsed resume data
- **Example Response**:
  ```json
  {
    "success": true,
    "data": {
      "basic_details": { ... },
      "summary": "...",
      "experience": [ ... ],
      "education": [ ... ],
      "skills": [ ... ]
    }
  }
  ```

### GET `/health`
- **Purpose**: Health check endpoint
- **Output**: Backend status and Gemini model info

## Error Handling

- File upload errors are caught and displayed to the user
- Gemini API errors are logged and user-friendly messages are shown
- CORS is properly configured for local development

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running and CORS is properly configured
2. **API Key Issues**: Check that `GEMINI_API_KEY` is set in your `.env` file
3. **File Size**: Maximum file size is 16MB
4. **Supported Formats**: PDF, DOCX, TXT files are supported

### Debug Steps

1. Check backend logs for parsing errors
2. Verify Gemini API key is valid
3. Check browser console for frontend errors
4. Ensure both servers are running on correct ports

## Development Notes

- The integration maintains the existing UI/UX while replacing the text extraction logic
- All existing functionality in `ResumeBuilderPage` is preserved
- The modal flow has been updated to reflect AI parsing completion
- Error handling has been improved with user-friendly messages

