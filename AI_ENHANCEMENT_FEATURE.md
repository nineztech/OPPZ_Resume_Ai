# AI Enhancement Feature

## Overview
The AI Enhancement feature allows users to enhance their resume content (experiences and projects) using AI-powered suggestions. Users can provide custom prompts to guide the AI in improving their content.

## How It Works

### Frontend Flow
1. User clicks "✨ Enhance with AI" button on any experience or project
2. AI Enhancement Modal opens with:
   - Current content display
   - Prompt input field with suggestions
   - Enhancement button
3. User enters their enhancement prompt
4. AI processes the request and returns enhanced content
5. Enhanced content replaces the original content

### Backend Flow
1. Frontend sends enhancement request to Node.js server (`/api/ai-suggestions/enhance-content`)
2. Node.js server proxies request to Python service (`/enhance-content`)
3. Python service uses OpenAI to enhance content based on user prompt
4. Enhanced content is returned through the chain

## Files Added/Modified

### New Files
- `client/src/components/modals/AIEnhancementModal.tsx` - Modal for AI enhancement
- `client/src/services/aiEnhancementService.ts` - Service to call AI enhancement API
- `server/controllers/aiEnhancementController.js` - Controller to proxy requests to Python service

### Modified Files
- `client/src/pages/ResumeBuilderPage.tsx` - Added AI enhancement functionality
- `server/routes/aiSuggestionRoutes.js` - Added enhancement route
- `gemini_resume_parser/web_ui.py` - Added `/enhance-content` endpoint

## API Endpoints

### Node.js Server
- `POST /api/ai-suggestions/enhance-content` - Proxy to Python service

### Python Service
- `POST /enhance-content` - Direct AI enhancement endpoint

## Request Format
```json
{
  "content": "Original content to enhance",
  "prompt": "User's enhancement instructions",
  "type": "experience" | "project",
  "title": "Title of the experience/project"
}
```

## Response Format
```json
{
  "success": true,
  "enhanced_content": "AI-enhanced content",
  "original_content": "Original content",
  "enhancement_prompt": "User's prompt"
}
```

## Usage Examples

### Experience Enhancement
- **Prompt**: "Make this more professional and highlight quantifiable achievements"
- **Prompt**: "Focus on leadership skills and team management"
- **Prompt**: "Emphasize technical skills and problem-solving abilities"

### Project Enhancement
- **Prompt**: "Make this more technical and highlight the technologies used"
- **Prompt**: "Focus on the impact and results achieved"
- **Prompt**: "Emphasize the challenges overcome and solutions implemented"

## Setup Requirements

1. **Python Service**: Must be running on `http://localhost:5000`
2. **Node.js Server**: Must be running on configured port
3. **OpenAI API Key**: Must be configured in Python service environment

## Error Handling

- Connection errors are handled gracefully
- User-friendly error messages are displayed
- Fallback behavior when services are unavailable
- Timeout handling for long-running requests

## Testing

To test the feature:
1. Start both Python and Node.js services
2. Navigate to Resume Builder page
3. Add an experience or project with description
4. Click "✨ Enhance with AI" button
5. Enter enhancement prompt
6. Verify enhanced content replaces original

## Future Enhancements

- Batch enhancement for multiple items
- Enhancement history and undo functionality
- Pre-defined enhancement templates
- Integration with other resume sections
