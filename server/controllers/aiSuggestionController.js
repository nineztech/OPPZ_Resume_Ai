import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Helper function to call Python service
const callPythonService = (scriptName, args = []) => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, '../../gemini_resume_parser');
    const scriptPath = path.join(pythonPath, scriptName);
    
    const python = spawn('python3', [scriptPath, ...args], {
      cwd: pythonPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

// Generate job description based on sector, country, and designation
export const generateJobDescription = async (req, res) => {
  try {
    const { sector, country, designation } = req.body;

    // Validate input
    if (!sector || !country || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Sector, country, and designation are required'
      });
    }

    console.log(`Generating job description for ${designation} in ${sector} sector, ${country}`);

    // Call Python service for job description generation
    const result = await callPythonService('ai_job_description.py', [
      JSON.stringify({ sector, country, designation })
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobDescription: result,
        generatedAt: new Date().toISOString(),
        parameters: { sector, country, designation }
      }
    });

  } catch (error) {
    console.error('Job description generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate job description',
      error: error.message
    });
  }
};

// Parse resume and get AI suggestions
export const getAISuggestions = async (req, res) => {
  try {
    const { sector, country, designation } = req.body;
    const file = req.file;

    // Validate input
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    if (!sector || !country || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Sector, country, and designation are required'
      });
    }

    console.log(`Processing resume for AI suggestions: ${file.originalname}`);

    // Step 1: Parse the resume
    const resumeData = await callPythonService('parse_resume.py', [file.path]);

    // Step 2: Generate job description
    const jobDescription = await callPythonService('ai_job_description.py', [
      JSON.stringify({ sector, country, designation })
    ]);

    // Step 3: Get AI suggestions by comparing resume with job description
    const suggestions = await callPythonService('ai_suggestions.py', [
      JSON.stringify({ resumeData, jobDescription })
    ]);

    // Clean up uploaded file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.status(200).json({
      success: true,
      data: {
        resumeData,
        jobDescription,
        suggestions,
        processedAt: new Date().toISOString(),
        parameters: { sector, country, designation }
      }
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process resume and generate AI suggestions',
      error: error.message
    });
  }
};

// Parse resume only (without AI suggestions)
export const parseResume = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    console.log(`Parsing resume: ${file.originalname}`);

    // Parse the resume using Python service
    const resumeData = await callPythonService('parse_resume.py', [file.path]);

    // Clean up uploaded file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.status(200).json({
      success: true,
      data: {
        resumeData,
        parsedAt: new Date().toISOString(),
        fileName: file.originalname
      }
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to parse resume',
      error: error.message
    });
  }
};

// Compare resume with custom job description
export const compareResumeWithJD = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Resume data and job description are required'
      });
    }

    console.log('Comparing resume with job description');

    // Get AI suggestions by comparing resume with job description
    const suggestions = await callPythonService('ai_suggestions.py', [
      JSON.stringify({ resumeData, jobDescription })
    ]);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        comparedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Resume comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare resume with job description',
      error: error.message
    });
  }
};

// Enhance specific content with AI
export const enhanceContentWithAI = async (req, res) => {
  try {
    const { content, prompt, type } = req.body;

    // Validate input
    if (!content || !prompt || !type) {
      return res.status(400).json({
        success: false,
        message: 'Content, prompt, and type are required'
      });
    }

    // Validate type
    if (!['experience', 'project'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "experience" or "project"'
      });
    }

    console.log(`Enhancing ${type} content with AI`);

    // Call Python service for content enhancement
    const result = await callPythonService('enhance_content.py', [
      JSON.stringify({ content: content.trim(), prompt: prompt.trim(), type })
    ]);

    if (!result.success) {
      throw new Error(result.error || 'Enhancement failed');
    }

    res.status(200).json({
      success: true,
      data: {
        enhancedContent: result.enhanced_content,
        originalContent: result.original_content,
        enhancedAt: new Date().toISOString(),
        type: type,
        promptUsed: result.prompt_used
      }
    });

  } catch (error) {
    console.error('Content enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance content with AI',
      error: error.message
    });
  }
};

// Export multer upload middleware
export const uploadMiddleware = upload.single('resume');
