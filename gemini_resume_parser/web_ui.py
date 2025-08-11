#!/usr/bin/env python3
"""
Simple Web UI for testing Gemini Resume Parser
Run this to get a web interface for uploading and testing resumes
"""

import os
import json
import tempfile
from pathlib import Path
from flask import Flask, render_template_string, request, jsonify, send_file
from werkzeug.utils import secure_filename
import logging

# Import the Gemini parser
from services.gemini_parser_service import GeminiResumeParser
from utils.pdf_extractor import DocumentExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# HTML template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini Resume Parser - Test UI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .upload-section {
            border: 2px dashed #ddd;
            padding: 40px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 20px;
            background: #fafafa;
        }
        .upload-section:hover {
            border-color: #007bff;
            background: #f0f8ff;
        }
        .file-input {
            margin: 20px 0;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .results {
            margin-top: 30px;
            display: none;
        }
        .results.show {
            display: block;
        }
        .json-output {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            white-space: pre;
            max-height: 600px;
            overflow-y: auto;
            color: #24292e;
        }
        .error {
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .success {
            color: #155724;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .file-info {
            margin: 20px 0;
            padding: 15px;
            background: #e9ecef;
            border-radius: 5px;
        }
        .supported-formats {
            margin: 20px 0;
            padding: 15px;
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Gemini Resume Parser - Test Interface</h1>
        
        <div class="supported-formats">
            <strong>Supported Formats:</strong> PDF, DOCX, TXT files
            <br><strong>Max File Size:</strong> 16MB
        </div>

        <div class="upload-section">
            <h3>Upload Your Resume</h3>
            <form id="uploadForm" enctype="multipart/form-data">
                <div class="file-input">
                    <input type="file" id="resumeFile" name="resume" accept=".pdf,.docx,.txt" required>
                </div>
                <button type="submit" class="btn" id="parseBtn">Parse Resume</button>
            </form>
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Parsing your resume with Gemini AI... This may take a few moments.</p>
        </div>

        <div class="results" id="results">
            <h3>Parsing Results</h3>
            <div class="file-info" id="fileInfo"></div>
            <div class="json-output" id="jsonOutput"></div>
        </div>

        <div id="errorMessage"></div>
    </div>

    <script>
        document.getElementById('uploadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('resumeFile');
            const file = fileInput.files[0];
            
            if (!file) {
                showError('Please select a file to upload.');
                return;
            }

            // Show loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('results').classList.remove('show');
            document.getElementById('errorMessage').innerHTML = '';
            document.getElementById('parseBtn').disabled = true;

            const formData = new FormData();
            formData.append('resume', file);

            try {
                const response = await fetch('/parse', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                if (result.success) {
                    showResults(result.data, file);
                } else {
                    showError('Parsing failed: ' + result.error);
                }
            } catch (error) {
                showError('Error: ' + error.message);
            } finally {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('parseBtn').disabled = false;
            }
        });

        function showResults(data, file) {
            document.getElementById('fileInfo').innerHTML = `
                <strong>File:</strong> ${file.name}<br>
                <strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
                <strong>Type:</strong> ${file.type || 'Unknown'}
            `;
            
            // Format JSON with proper indentation and syntax highlighting
            const formattedJson = JSON.stringify(data, null, 2);
            document.getElementById('jsonOutput').innerHTML = formatJSON(formattedJson);
            document.getElementById('results').classList.add('show');
        }

        function formatJSON(jsonString) {
            return jsonString
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/(".*?":)/g, '<span style="color: #24292e; font-weight: bold;">$1</span>')
                .replace(/: "(.*?)"/g, ': <span style="color: #032f62;">"$1"</span>')
                .replace(/: (true|false|null)/g, ': <span style="color: #6f42c1;">$1</span>')
                .replace(/: (\d+)/g, ': <span style="color: #005cc5;">$1</span>')
                .replace(/([{}[\],])/g, '<span style="color: #24292e;">$1</span>');
        }

        function showError(message) {
            document.getElementById('errorMessage').innerHTML = `
                <div class="error">${message}</div>
            `;
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Main page with the upload interface"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/parse', methods=['POST'])
def parse_resume():
    """Parse uploaded resume file"""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'})
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        # Validate file
        if not file:
            return jsonify({'success': False, 'error': 'Invalid file'})
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Initialize parser
            parser = GeminiResumeParser()
            
            # Parse the resume
            logger.info(f"Parsing resume: {filename}")
            parsed_data = parser.parse_resume_from_file(filepath)
            
            # Clean up temporary file
            os.unlink(filepath)
            
            return jsonify({
                'success': True, 
                'data': parsed_data
            })
            
        except Exception as e:
            # Clean up temporary file on error
            if os.path.exists(filepath):
                os.unlink(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"Error parsing resume: {str(e)}")
        return jsonify({
            'success': False, 
            'error': str(e)
        })

@app.route('/health')
def health():
    """Health check endpoint"""
    try:
        # Test if parser can be initialized
        parser = GeminiResumeParser()
        model_info = parser.get_model_info()
        
        return jsonify({
            'status': 'healthy',
            'gemini_model': model_info['model_name'],
            'api_key_configured': model_info['api_key_configured']
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Gemini Resume Parser Web UI...")
    print("📱 Open your browser and go to: http://localhost:5000")
    print("🔑 Make sure your GEMINI_API_KEY is set in environment variables")
    print("📁 You can now upload and test resume files!")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
