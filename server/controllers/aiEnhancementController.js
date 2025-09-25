import axios from 'axios';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

/**
 * Proxy AI enhancement request to Python service
 */
export const enhanceContent = async (req, res) => {
  try {
    const { content, prompt, type, title } = req.body;

    // Validate required fields
    if (!content || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Content and prompt are required'
      });
    }

    // Forward request to Python service
    const response = await axios.post(`${PYTHON_SERVICE_URL}/enhance-content`, {
      content,
      prompt,
      type: type || 'experience',
      title: title || ''
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    // Return the response from Python service
    res.json(response.data);

  } catch (error) {
    console.error('AI Enhancement Controller Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI enhancement service is unavailable. Please ensure the Python service is running.'
      });
    }

    if (error.response) {
      // Python service returned an error
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data?.error || 'Enhancement failed'
      });
    }

    // Other errors
    res.status(500).json({
      success: false,
      error: 'Internal server error during enhancement'
    });
  }
};
