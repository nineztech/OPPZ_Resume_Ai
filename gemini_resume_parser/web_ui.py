#!/usr/bin/env python3
"""
Simple Web UI for testing Gemini Resume Parser and ATS Analysis
Run this to get a web interface for uploading and testing resumes with ATS analysis
"""

import os
import json
import tempfile
import datetime
from pathlib import Path
from flask import Flask, render_template_string, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging

# Import the Gemini parser and ATS services
from services.gemini_parser_service import GeminiResumeParser
from services.ats_service import StandardATSService, JDSpecificATSService
from services.ai_suggestion_service import AISuggestionService
from utils.pdf_extractor import DocumentExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Enable CORS for all routes
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'], supports_credentials=True)

# HTML template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini Resume Parser & ATS Analysis - Test UI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1400px;
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
        .section-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .section-header h1 {
            margin-top: 0;
            margin-bottom: 10px;
            color: white;
        }
        .section-header p {
            margin-bottom: 0;
            opacity: 0.9;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid #ddd;
        }
        .tab {
            padding: 15px 30px;
            cursor: pointer;
            border: none;
            background: none;
            font-size: 16px;
            color: #666;
            border-bottom: 3px solid transparent;
        }
        .tab.active {
            color: #007bff;
            border-bottom-color: #007bff;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
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
        .btn-secondary {
            background: #6c757d;
        }
        .btn-secondary:hover {
            background: #545b62;
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
        .ats-results {
            margin-top: 30px;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: conic-gradient(#007bff 0deg, #e9ecef 0deg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            position: relative;
        }
        .score-circle::before {
            content: '';
            position: absolute;
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
        }
        .score-text {
            position: relative;
            z-index: 1;
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .category-scores {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .category-card {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            background: white;
        }
        .category-score {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            text-align: center;
            margin-bottom: 10px;
        }
        .category-name {
            font-weight: 600;
            margin-bottom: 10px;
            text-transform: capitalize;
        }
        .category-feedback {
            color: #666;
            font-size: 14px;
            line-height: 1.4;
        }
        .top-fixes {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .fix-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .fix-icon {
            width: 20px;
            height: 20px;
            background: #ffc107;
            border-radius: 50%;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        .job-description-input {
            width: 100%;
            min-height: 120px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-family: inherit;
            resize: vertical;
            margin-bottom: 20px;
        }
        
        .detail-card {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .detail-card h4 {
            margin-top: 0;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f8f9fa;
        }
        
        .quality-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 15px;
            border-radius: 8px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        
        .quality-indicator.success {
            background: #d4edda;
            border-color: #c3e6cb;
        }
        
        .quality-indicator.error {
            background: #f8d7da;
            border-color: #f5c6cb;
        }
        
        .skill-tag {
            background: #007bff;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            margin: 3px;
            display: inline-block;
        }
        
        .experience-item {
            border-left: 4px solid #007bff;
            padding-left: 20px;
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 0 8px 8px 0;
        }
        
        .education-item {
            border-left: 4px solid #28a745;
            padding-left: 20px;
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 0 8px 8px 0;
        }
        
        .project-item {
            border-left: 4px solid #ffc107;
            padding-left: 20px;
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 0 8px 8px 0;
        }
        
        .certification-item {
            border-left: 4px solid #17a2b8;
            padding-left: 20px;
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 0 8px 8px 0;
        }
        
        .analysis-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 1px solid #e9ecef;
        }
        
        .analysis-section h4 {
            color: #495057;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .feedback-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #007bff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .feedback-item.positive {
            border-left-color: #28a745;
            background: #f8fff9;
        }
        
        .feedback-item.warning {
            border-left-color: #ffc107;
            background: #fffbf0;
        }
        
        .feedback-item.negative {
            border-left-color: #dc3545;
            background: #fff8f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="section-header">
            <h1>🚀 Gemini Resume Parser & ATS Analysis - Test Interface</h1>
            <p style="margin: 0; opacity: 0.9;">Comprehensive resume analysis with detailed feedback and optimization recommendations</p>
        </div>
        
        <div class="supported-formats">
            <strong>Supported Formats:</strong> PDF, DOCX, TXT files
            <br><strong>Max File Size:</strong> 16MB
        </div>

        <div class="tabs">
            <button class="tab active" onclick="showTab('parsing')">Resume Parsing</button>
            <button class="tab" onclick="showTab('standard-ats')">Standard ATS</button>
            <button class="tab" onclick="showTab('jd-ats')">JD-Specific ATS</button>
            <button class="tab" onclick="showTab('ai-suggestions')">AI Suggestions</button>
        </div>

        <!-- Resume Parsing Tab -->
        <div id="parsing" class="tab-content active">
            <div class="upload-section">
                <h3>Upload Your Resume for Parsing</h3>
                <p style="color: #666; margin-bottom: 20px;">Get detailed analysis of your resume content with comprehensive parsing results</p>
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
                <!-- Results will be populated by JavaScript -->
            </div>
        </div>

        <!-- Standard ATS Tab -->
        <div id="standard-ats" class="tab-content">
            <div class="upload-section">
                <h3>Standard ATS Analysis</h3>
                <p style="color: #666; margin-bottom: 20px;">Get general resume optimization feedback, scoring, and detailed improvement recommendations</p>
                <form id="standardAtsForm" enctype="multipart/form-data">
                    <div class="file-input">
                        <input type="file" id="standardAtsFile" name="resume" accept=".pdf,.docx,.txt" required>
                    </div>
                    <button type="submit" class="btn" id="standardAtsBtn">Run Standard ATS Analysis</button>
                </form>
            </div>

            <div class="loading" id="standardAtsLoading">
                <div class="spinner"></div>
                <p>Running Standard ATS Analysis... This may take a few moments.</p>
            </div>

            <div class="ats-results" id="standardAtsResults"></div>
        </div>

        <!-- JD-Specific ATS Tab -->
        <div id="jd-ats" class="tab-content">
            <div class="upload-section">
                <h3>Job Description Specific ATS Analysis</h3>
                <p style="color: #666; margin-bottom: 20px;">Analyze how well your resume matches a specific job description with detailed feedback</p>
                <form id="jdAtsForm" enctype="multipart/form-data">
                    <div class="file-input">
                        <input type="file" id="jdAtsFile" name="resume" accept=".pdf,.docx,.txt" required>
                    </div>
                    <div>
                        <label for="jobDescription"><strong>Job Description:</strong></label>
                        <textarea 
                            id="jobDescription" 
                            name="jobDescription" 
                            class="job-description-input"
                            placeholder="Paste the job description here to get targeted analysis and improvement suggestions..."
                            required
                        ></textarea>
                    </div>
                    <button type="submit" class="btn" id="jdAtsBtn">Run JD-Specific ATS Analysis</button>
                </form>
            </div>

            <div class="loading" id="jdAtsLoading">
                <div class="spinner"></div>
                <p>Running JD-Specific ATS Analysis... This may take a few moments.</p>
            </div>

            <div class="ats-results" id="jdAtsResults"></div>
        </div>

        <!-- AI Suggestions Tab -->
        <div id="ai-suggestions" class="tab-content">
            <div class="upload-section">
                <h3>AI-Powered Resume Suggestions</h3>
                <p style="color: #666; margin-bottom: 20px;">Get personalized job descriptions and comprehensive resume improvement suggestions based on sector, country, and role</p>
                <form id="aiSuggestionsForm" enctype="multipart/form-data">
                    <div class="file-input">
                        <input type="file" id="aiSuggestionsFile" name="resume" accept=".pdf,.docx,.txt" required>
                    </div>
                    <div style="margin: 20px 0;">
                        <label for="sector"><strong>Sector/Industry:</strong></label>
                        <input type="text" id="sector" name="sector" placeholder="e.g., Technology, Healthcare, Finance" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 5px;">
                    </div>
                    <div style="margin: 20px 0;">
                        <label for="country"><strong>Country:</strong></label>
                        <input type="text" id="country" name="country" placeholder="e.g., USA, Canada, UK" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 5px;">
                    </div>
                    <div style="margin: 20px 0;">
                        <label for="designation"><strong>Designation/Role:</strong></label>
                        <input type="text" id="designation" name="designation" placeholder="e.g., Data Analyst, Software Engineer, Marketing Manager" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 5px;">
                    </div>
                    <button type="submit" class="btn" id="aiSuggestionsBtn">Generate AI Suggestions</button>
                </form>
            </div>

            <div class="loading" id="aiSuggestionsLoading">
                <div class="spinner"></div>
                <p>Generating job description and analyzing resume... This may take a few moments.</p>
            </div>

            <div class="ats-results" id="aiSuggestionsResults"></div>
        </div>

        <div id="errorMessage"></div>
    </div>

    <script>
        let currentResumeText = '';

        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Remove active class from all tabs
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }

        // Resume Parsing
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
                    currentResumeText = JSON.stringify(result.data);
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

        // Standard ATS Analysis
        document.getElementById('standardAtsForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('standardAtsFile');
            const file = fileInput.files[0];
            
            if (!file) {
                showError('Please select a file to upload.');
                return;
            }

            // Show loading
            document.getElementById('standardAtsLoading').style.display = 'block';
            document.getElementById('standardAtsResults').innerHTML = '';
            document.getElementById('errorMessage').innerHTML = '';
            document.getElementById('standardAtsBtn').disabled = true;

            const formData = new FormData();
            formData.append('resume', file);

            try {
                const response = await fetch('/ats/standard', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                if (result.success) {
                    showStandardAtsResults(result.data);
                } else {
                    showError('Standard ATS analysis failed: ' + result.error);
                }
            } catch (error) {
                showError('Error: ' + error.message);
            } finally {
                document.getElementById('standardAtsLoading').style.display = 'none';
                document.getElementById('standardAtsBtn').disabled = false;
            }
        });

        // JD-Specific ATS Analysis
        document.getElementById('jdAtsForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('jdAtsFile');
            const file = fileInput.files[0];
            const jobDescription = document.getElementById('jobDescription').value;
            
            if (!file) {
                showError('Please select a file to upload.');
                return;
            }

            if (!jobDescription.trim()) {
                showError('Please enter a job description.');
                return;
            }

            // Show loading
            document.getElementById('jdAtsLoading').style.display = 'block';
            document.getElementById('jdAtsResults').innerHTML = '';
            document.getElementById('errorMessage').innerHTML = '';
            document.getElementById('jdAtsBtn').disabled = true;

            const formData = new FormData();
            formData.append('resume', file);
            formData.append('job_description', jobDescription);

            try {
                const response = await fetch('/ats/jd-specific', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                if (result.success) {
                    showJdAtsResults(result.data);
                } else {
                    showError('JD-Specific ATS analysis failed: ' + result.error);
                }
            } catch (error) {
                showError('Error: ' + error.message);
            } finally {
                document.getElementById('jdAtsLoading').style.display = 'none';
                document.getElementById('jdAtsBtn').disabled = false;
            }
        });

        // AI Suggestions Analysis
        document.getElementById('aiSuggestionsForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('aiSuggestionsFile');
            const file = fileInput.files[0];
            const sector = document.getElementById('sector').value;
            const country = document.getElementById('country').value;
            const designation = document.getElementById('designation').value;
            
            if (!file) {
                showError('Please select a file to upload.');
                return;
            }

            if (!sector.trim() || !country.trim() || !designation.trim()) {
                showError('Please fill in all fields (Sector, Country, Designation).');
                return;
            }

            // Show loading
            document.getElementById('aiSuggestionsLoading').style.display = 'block';
            document.getElementById('aiSuggestionsResults').innerHTML = '';
            document.getElementById('errorMessage').innerHTML = '';
            document.getElementById('aiSuggestionsBtn').disabled = true;

            const formData = new FormData();
            formData.append('resume', file);
            formData.append('sector', sector);
            formData.append('country', country);
            formData.append('designation', designation);

            try {
                const response = await fetch('/ai/suggestions', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                if (result.success) {
                    showAiSuggestionsResults(result.data);
                } else {
                    showError('AI Suggestions analysis failed: ' + result.error);
                }
            } catch (error) {
                showError('Error: ' + error.message);
            } finally {
                document.getElementById('aiSuggestionsLoading').style.display = 'none';
                document.getElementById('aiSuggestionsBtn').disabled = false;
            }
        });

        function showResults(data, file) {
            // Create file info element if it doesn't exist
            let fileInfoElement = document.getElementById('fileInfo');
            if (!fileInfoElement) {
                fileInfoElement = document.createElement('div');
                fileInfoElement.id = 'fileInfo';
                fileInfoElement.className = 'file-info';
            }
            
            fileInfoElement.innerHTML = `
                <strong>File:</strong> ${file.name}<br>
                <strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
                <strong>Type:</strong> ${file.type || 'Unknown'}
            `;
            
            // Create detailed parsing results display
            let detailedHtml = '<div style="margin-top: 20px;">';
            
            // Basic information section
            if (data.basic_details) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>📋 Basic Information</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            ${data.basic_details.name ? `<div><strong>Name:</strong> ${data.basic_details.name}</div>` : ''}
                            ${data.basic_details.email ? `<div><strong>Email:</strong> ${data.basic_details.email}</div>` : ''}
                            ${data.basic_details.phone ? `<div><strong>Phone:</strong> ${data.basic_details.phone}</div>` : ''}
                            ${data.basic_details.location ? `<div><strong>Location:</strong> ${data.basic_details.location}</div>` : ''}
                            ${data.basic_details.linkedin ? `<div><strong>LinkedIn:</strong> ${data.basic_details.linkedin}</div>` : ''}
                        </div>
                    </div>
                `;
            }
            
            // Summary section
            if (data.summary) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>📝 Professional Summary</h4>
                        <p style="margin: 0; line-height: 1.6;">${data.summary}</p>
                    </div>
                `;
            }
            
            // Experience section
            if (data.experience && data.experience.length > 0) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>💼 Work Experience (${data.experience.length} positions)</h4>
                        ${data.experience.map((exp, index) => `
                            <div class="experience-item">
                                <div style="font-weight: bold; color: #856404;">${exp.title || 'Title not specified'}</div>
                                <div style="color: #6c757d;">${exp.company || 'Company not specified'}</div>
                                <div style="color: #6c757d; font-size: 14px;">${exp.duration || 'Duration not specified'}</div>
                                ${exp.description ? `<div style="margin-top: 10px; line-height: 1.5;">${exp.description}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Education section
            if (data.education && data.education.length > 0) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>🎓 Education (${data.education.length} entries)</h4>
                        ${data.education.map((edu, index) => `
                            <div class="education-item">
                                <div style="font-weight: bold; color: #4a148c;">${edu.degree || 'Degree not specified'}</div>
                                <div style="color: #6c757d;">${edu.institution || 'Institution not specified'}</div>
                                <div style="color: #6c757d; font-size: 14px;">${edu.year || 'Year not specified'}</div>
                                ${edu.gpa ? `<div style="color: #6c757d; font-size: 14px;">GPA: ${edu.gpa}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Skills section
            if (data.skills && data.skills.length > 0) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>🛠️ Skills (${data.skills.length} skills)</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            ${data.skills.map(skill => `
                                <span class="skill-tag">
                                    ${skill}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Projects section
            if (data.projects && data.projects.length > 0) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>🚀 Projects (${data.projects.length} projects)</h4>
                        ${data.projects.map((project, index) => `
                            <div class="project-item">
                                <div style="font-weight: bold; color: #880e4f;">${project.title || 'Title not specified'}</div>
                                ${project.description ? `<div style="margin-top: 10px; line-height: 1.5;">${project.description}</div>` : ''}
                                ${project.technologies ? `<div style="margin-top: 10px; color: #6c757d;"><strong>Technologies:</strong> ${project.technologies.join(', ')}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Certifications section
            if (data.certifications && data.certifications.length > 0) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>�� Certifications (${data.certifications.length} certifications)</h4>
                        ${data.certifications.map((cert, index) => `
                            <div class="certification-item">
                                <div style="font-weight: bold; color: #33691e;">${cert.name || 'Name not specified'}</div>
                                <div style="color: #6c757d;">${cert.issuer || 'Issuer not specified'}</div>
                                ${cert.date ? `<div style="color: #6c757d; font-size: 14px;">Date: ${cert.date}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Parsing quality indicators
            detailedHtml += `
                <div class="detail-card">
                    <h4>📊 Parsing Quality Analysis</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div class="quality-indicator ${data.basic_details && data.basic_details.name ? 'success' : 'error'}">
                            <div style="font-size: 24px; font-weight: bold; color: ${data.basic_details && data.basic_details.name ? '#28a745' : '#dc3545'};">${data.basic_details && data.basic_details.name ? '✓' : '✗'}</div>
                            <div style="font-size: 12px; color: #6c757d;">Name Extracted</div>
                        </div>
                        <div class="quality-indicator ${data.basic_details && data.basic_details.email ? 'success' : 'error'}">
                            <div style="font-size: 24px; font-weight: bold; color: ${data.basic_details && data.basic_details.email ? '#28a745' : '#dc3545'};">${data.basic_details && data.basic_details.email ? '✓' : '✗'}</div>
                            <div style="font-size: 12px; color: #6c757d;">Email Extracted</div>
                        </div>
                        <div class="quality-indicator ${data.experience && data.experience.length > 0 ? 'success' : 'error'}">
                            <div style="font-size: 24px; font-weight: bold; color: ${data.experience && data.experience.length > 0 ? '#28a745' : '#dc3545'};">${data.experience && data.experience.length > 0 ? '✓' : '✗'}</div>
                            <div style="font-size: 12px; color: #6c757d;">Experience Found</div>
                        </div>
                        <div class="quality-indicator ${data.education && data.education.length > 0 ? 'success' : 'error'}">
                            <div style="font-size: 24px; font-weight: bold; color: ${data.education && data.education.length > 0 ? '#28a745' : '#dc3545'};">${data.education && data.education.length > 0 ? '✓' : '✗'}</div>
                            <div style="font-size: 12px; color: #6c757d;">Education Found</div>
                        </div>
                        <div class="quality-indicator ${data.skills && data.skills.length > 0 ? 'success' : 'error'}">
                            <div style="font-size: 24px; font-weight: bold; color: ${data.skills && data.skills.length > 0 ? '#28a745' : '#dc3545'};">${data.skills && data.skills.length > 0 ? '✓' : '✗'}</div>
                            <div style="font-size: 12px; color: #6c757d;">Skills Found</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Parsing issues and warnings
            if (data.parsing_issues || data.warnings || data.errors) {
                detailedHtml += `
                    <div class="detail-card">
                        <h4>⚠️ Parsing Issues & Warnings</h4>
                        ${data.errors && data.errors.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #dc3545; margin-bottom: 10px;">❌ Critical Errors:</h5>
                                <ul style="margin: 0; padding-left: 20px; color: #dc3545;">
                                    ${data.errors.map(error => `<li>${error}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${data.warnings && data.warnings.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #ffc107; margin-bottom: 10px;">⚠️ Warnings:</h5>
                                <ul style="margin: 0; padding-left: 20px; color: #856404;">
                                    ${data.warnings.map(warning => `<li>${warning}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${data.parsing_issues && data.parsing_issues.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #6c757d; margin-bottom: 10px;">ℹ️ Parsing Issues:</h5>
                                <ul style="margin: 0; padding-left: 20px; color: #6c757d;">
                                    ${data.parsing_issues.map(issue => `<li>${issue}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${!data.errors && !data.warnings && !data.parsing_issues ? `
                            <div style="text-align: center; color: #28a745; padding: 20px;">
                                <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
                                <div>No parsing issues detected! Your resume was parsed successfully.</div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            
            // Data completeness score
            let completenessScore = 0;
            let totalFields = 0;
            
            if (data.basic_details) {
                totalFields += 5; // name, email, phone, location, linkedin
                if (data.basic_details.name) completenessScore += 1;
                if (data.basic_details.email) completenessScore += 1;
                if (data.basic_details.phone) completenessScore += 1;
                if (data.basic_details.location) completenessScore += 1;
                if (data.basic_details.linkedin) completenessScore += 1;
            }
            if (data.summary) { totalFields += 1; completenessScore += 1; }
            if (data.experience && data.experience.length > 0) { totalFields += 1; completenessScore += 1; }
            if (data.education && data.education.length > 0) { totalFields += 1; completenessScore += 1; }
            if (data.skills && data.skills.length > 0) { totalFields += 1; completenessScore += 1; }
            if (data.projects && data.projects.length > 0) { totalFields += 1; completenessScore += 1; }
            if (data.certifications && data.certifications.length > 0) { totalFields += 1; completenessScore += 1; }
            
            const completenessPercentage = totalFields > 0 ? Math.round((completenessScore / totalFields) * 100) : 0;
            
            detailedHtml += `
                <div class="detail-card">
                    <h4>📈 Data Completeness Score</h4>
                    <div style="text-align: center; margin: 20px 0;">
                        <div style="font-size: 48px; font-weight: bold; color: ${completenessPercentage >= 80 ? '#28a745' : completenessPercentage >= 60 ? '#ffc107' : '#dc3545'};">${completenessPercentage}%</div>
                        <div style="color: #6c757d; margin-bottom: 20px;">Data Completeness</div>
                        <div style="background: #e9ecef; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="background: ${completenessPercentage >= 80 ? '#28a745' : completenessPercentage >= 60 ? '#ffc107' : '#dc3545'}; height: 100%; width: ${completenessPercentage}%; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                    <div style="text-align: center; color: #6c757d;">
                        ${completenessScore} out of ${totalFields} expected fields were successfully extracted
                    </div>
                </div>
            `;
            
            detailedHtml += '</div>';
            
            // Add the detailed results to the page
            const resultsElement = document.getElementById('results');
            if (resultsElement) {
                resultsElement.innerHTML = `
                    <h3>Parsing Results</h3>
                    <div class="file-info" id="fileInfo"></div>
                    ${detailedHtml}
                    <div style="margin-top: 30px;">
                        <h4>Complete Parsed Data (JSON)</h4>
                        <div class="json-output" id="jsonOutput"></div>
                    </div>
                `;
                
                // Format JSON with proper indentation and syntax highlighting
                const formattedJson = JSON.stringify(data, null, 2);
                const jsonOutputElement = document.getElementById('jsonOutput');
                if (jsonOutputElement) {
                    jsonOutputElement.innerHTML = formatJSON(formattedJson);
                }
                resultsElement.classList.add('show');
            }
        }

        function showStandardAtsResults(data) {
            const resultsDiv = document.getElementById('standardAtsResults');
            
            // Check if results div exists
            if (!resultsDiv) {
                console.error('standardAtsResults element not found');
                return;
            }
            
            // Validate data structure
            if (!data || typeof data !== 'object') {
                resultsDiv.innerHTML = `
                    <div class="error">
                        <h3>Error: Invalid Data Received</h3>
                        <p>The ATS analysis returned invalid data. Please try again.</p>
                        <div class="json-output">${formatJSON(JSON.stringify(data, null, 2))}</div>
                    </div>
                `;
                return;
            }
            
            let html = `
                <h3>Standard ATS Analysis Results</h3>
                
                <div class="score-circle">
                    <div class="score-text">${data.overall_score || 'N/A'}</div>
                </div>
                <h4 style="text-align: center; margin-bottom: 30px;">OVERALL SCORE</h4>
            `;

            // Category scores
            if (data.category_scores && typeof data.category_scores === 'object') {
                html += '<div class="category-scores">';
                try {
                    Object.entries(data.category_scores).forEach(([key, score]) => {
                        const categoryName = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                        html += `
                            <div class="category-card">
                                <div class="category-score">${score}</div>
                                <div class="category-name">${categoryName}</div>
                                <div class="category-feedback">Score: ${score}/100</div>
                            </div>
                        `;
                    });
                } catch (error) {
                    html += '<div class="error">Error displaying category scores</div>';
                }
                html += '</div>';
            }

            // Strengths
            if (data.strengths && data.strengths.length > 0) {
                html += `
                    <div class="feedback-item positive">
                        <h5>✅ Strengths:</h5>
                        <ul style="margin: 0; padding-left: 20px; color: #155724;">
                            ${data.strengths.map(strength => `<li>${strength}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Weaknesses
            if (data.weaknesses && data.weaknesses.length > 0) {
                html += `
                    <div class="feedback-item negative">
                        <h5>❌ Areas for Improvement:</h5>
                        <ul style="margin: 0; padding-left: 20px; color: #c62828;">
                            ${data.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Recommendations
            if (data.recommendations && data.recommendations.length > 0) {
                html += `
                    <div class="feedback-item warning">
                        <h5>💡 Recommendations:</h5>
                        <ul style="margin: 0; padding-left: 20px; color: #856404;">
                            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Complete JSON output
            html += `
                <div style="margin-top: 30px;">
                    <h4>Complete Analysis Data (JSON)</h4>
                    <div class="json-output" style="max-height: 400px; overflow-y: auto;">
                        ${formatJSON(JSON.stringify(data, null, 2))}
                    </div>
                </div>
            `;

            resultsDiv.innerHTML = html;
        }

        function showJdAtsResults(data) {
            const resultsDiv = document.getElementById('jdAtsResults');
            
            // Check if results div exists
            if (!resultsDiv) {
                console.error('jdAtsResults element not found');
                return;
            }
            
            // Validate data structure
            if (!data || typeof data !== 'object') {
                resultsDiv.innerHTML = `
                    <div class="error">
                        <h3>Error: Invalid Data Received</h3>
                        <p>The ATS analysis returned invalid data. Please try again.</p>
                        <div class="json-output">${formatJSON(JSON.stringify(data, null, 2))}</div>
                    </div>
                `;
                return;
            }
            
            let html = `
                <h3>JD-Specific ATS Analysis Results</h3>
                
                <div class="score-circle">
                    <div class="score-text">${data.overall_score || 'N/A'}</div>
                </div>
                <h4 style="text-align: center; margin-bottom: 30px;">OVERALL SCORE</h4>
            `;

            // Match percentage
            if (data.match_percentage) {
                html += `
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 24px; font-weight: bold; color: #007bff;">
                            ${data.match_percentage}% Match
                        </div>
                        <div style="color: #6c757d;">Job Description Compatibility</div>
                    </div>
                `;
            }

            // Category scores
            if (data.category_scores && typeof data.category_scores === 'object') {
                html += '<div class="category-scores">';
                try {
                    Object.entries(data.category_scores).forEach(([key, score]) => {
                        const categoryName = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                        html += `
                            <div class="category-card">
                                <div class="category-score">${score}</div>
                                <div class="category-name">${categoryName}</div>
                                <div class="category-feedback">Score: ${score}/100</div>
                            </div>
                        `;
                    });
                } catch (error) {
                    html += '<div class="error">Error displaying category scores</div>';
                }
                html += '</div>';
            }

            // Missing keywords
            if (data.missing_keywords && data.missing_keywords.length > 0) {
                html += `
                    <div class="feedback-item negative">
                        <h5>❌ Missing Keywords:</h5>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                            ${data.missing_keywords.map(keyword => `
                                <span style="background: #dc3545; color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px;">
                                    ${keyword}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Strengths
            if (data.strengths && data.strengths.length > 0) {
                html += `
                    <div class="feedback-item positive">
                        <h5>✅ Strengths:</h5>
                        <ul style="margin: 0; padding-left: 20px; color: #155724;">
                            ${data.strengths.map(strength => `<li>${strength}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Weaknesses
            if (data.weaknesses && data.weaknesses.length > 0) {
                html += `
                    <div class="feedback-item negative">
                        <h5>❌ Areas for Improvement:</h5>
                        <ul style="margin: 0; padding-left: 20px; color: #c62828;">
                            ${data.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Recommendations
            if (data.recommendations && data.recommendations.length > 0) {
                html += `
                    <div class="feedback-item warning">
                        <h5>💡 Recommendations:</h5>
                        <ul style="margin: 0; padding-left: 20px; color: #856404;">
                            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Complete JSON output
            html += `
                <div style="margin-top: 30px;">
                    <h4>Complete Analysis Data (JSON)</h4>
                    <div class="json-output" style="max-height: 400px; overflow-y: auto;">
                        ${formatJSON(JSON.stringify(data, null, 2))}
                    </div>
                </div>
            `;

            resultsDiv.innerHTML = html;
        }

        function showAiSuggestionsResults(data) {
            const resultsDiv = document.getElementById('aiSuggestionsResults');
            
            if (!resultsDiv) {
                console.error('aiSuggestionsResults element not found');
                return;
            }
            
            if (!data || typeof data !== 'object') {
                resultsDiv.innerHTML = `
                    <div class="error">
                        <h3>Error: Invalid Data Received</h3>
                        <p>The AI suggestions analysis returned invalid data. Please try again.</p>
                        <div class="json-output">${formatJSON(JSON.stringify(data, null, 2))}</div>
                    </div>
                `;
                return;
            }
            
            let html = `
                <h3>AI-Powered Resume Suggestions</h3>
                
                <div class="score-circle">
                    <div class="score-text">${data.suggestions?.overallScore || 'N/A'}</div>
                </div>
                <h4 style="text-align: center; margin-bottom: 30px;">OVERALL SCORE</h4>
            `;

            // Job Description Summary
            if (data.jobDescription) {
                html += `
                    <div class="detail-card">
                        <h4>🎯 Generated Job Description</h4>
                        <div style="margin-bottom: 15px;">
                            <strong>Title:</strong> ${data.jobDescription.jobTitle || 'N/A'}<br>
                            <strong>Experience Level:</strong> ${data.jobDescription.experienceLevel || 'N/A'}<br>
                            <strong>Salary Range:</strong> ${data.jobDescription.salaryRange || 'N/A'}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>Job Summary:</strong><br>
                            <p style="margin: 5px 0; line-height: 1.5;">${data.jobDescription.jobSummary || 'N/A'}</p>
                        </div>
                        ${data.jobDescription.keyResponsibilities && data.jobDescription.keyResponsibilities.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <strong>Key Responsibilities:</strong>
                                <ul style="margin: 5px 0; padding-left: 20px;">
                                    ${data.jobDescription.keyResponsibilities.slice(0, 5).map(resp => `<li>${resp}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            // ATS Compatibility
            if (data.suggestions?.atsCompatibility) {
                html += `
                    <div class="detail-card">
                        <h4>📊 ATS Compatibility Analysis</h4>
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="font-size: 36px; font-weight: bold; color: #007bff;">${data.suggestions.atsCompatibility.score}%</div>
                            <div style="color: #6c757d;">ATS Compatibility Score</div>
                        </div>
                        ${data.suggestions.atsCompatibility.strengths && data.suggestions.atsCompatibility.strengths.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #28a745;">✅ Strengths:</h5>
                                <ul style="margin: 5px 0; padding-left: 20px; color: #155724;">
                                    ${data.suggestions.atsCompatibility.strengths.slice(0, 3).map(strength => `<li>${strength}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${data.suggestions.atsCompatibility.improvements && data.suggestions.atsCompatibility.improvements.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #dc3545;">❌ Areas to Improve:</h5>
                                <ul style="margin: 5px 0; padding-left: 20px; color: #c62828;">
                                    ${data.suggestions.atsCompatibility.improvements.slice(0, 3).map(improvement => `<li>${improvement}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            // Skills Analysis
            if (data.suggestions?.skillsAnalysis) {
                html += `
                    <div class="detail-card">
                        <h4>🛠️ Skills Analysis</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            ${data.suggestions.skillsAnalysis.matchingSkills && data.suggestions.skillsAnalysis.matchingSkills.length > 0 ? `
                                <div>
                                    <h5 style="color: #28a745;">✅ Matching Skills:</h5>
                                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                        ${data.suggestions.skillsAnalysis.matchingSkills.slice(0, 8).map(skill => `
                                            <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${skill}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${data.suggestions.skillsAnalysis.missingSkills && data.suggestions.skillsAnalysis.missingSkills.length > 0 ? `
                                <div>
                                    <h5 style="color: #dc3545;">❌ Missing Skills:</h5>
                                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                        ${data.suggestions.skillsAnalysis.missingSkills.slice(0, 8).map(skill => `
                                            <span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${skill}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }

            // Action Plan
            if (data.suggestions?.actionPlan) {
                html += `
                    <div class="detail-card">
                        <h4>📋 Action Plan</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                            ${data.suggestions.actionPlan.immediate && data.suggestions.actionPlan.immediate.length > 0 ? `
                                <div style="border-left: 4px solid #dc3545; padding-left: 15px;">
                                    <h5 style="color: #dc3545; margin-bottom: 10px;">🚨 Immediate Actions:</h5>
                                    <ul style="margin: 0; padding-left: 20px; color: #c62828;">
                                        ${data.suggestions.actionPlan.immediate.slice(0, 3).map(action => `<li>${action}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${data.suggestions.actionPlan.shortTerm && data.suggestions.actionPlan.shortTerm.length > 0 ? `
                                <div style="border-left: 4px solid #ffc107; padding-left: 15px;">
                                    <h5 style="color: #856404; margin-bottom: 10px;">📅 Short-term Goals:</h5>
                                    <ul style="margin: 0; padding-left: 20px; color: #856404;">
                                        ${data.suggestions.actionPlan.shortTerm.slice(0, 3).map(action => `<li>${action}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${data.suggestions.actionPlan.longTerm && data.suggestions.actionPlan.longTerm.length > 0 ? `
                                <div style="border-left: 4px solid #28a745; padding-left: 15px;">
                                    <h5 style="color: #155724; margin-bottom: 10px;">🎯 Long-term Development:</h5>
                                    <ul style="margin: 0; padding-left: 20px; color: #155724;">
                                        ${data.suggestions.actionPlan.longTerm.slice(0, 3).map(action => `<li>${action}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }

            // Complete JSON output
            html += `
                <div style="margin-top: 30px;">
                    <h4>Complete AI Analysis Data (JSON)</h4>
                    <div class="json-output" style="max-height: 400px; overflow-y: auto;">
                        ${formatJSON(JSON.stringify(data, null, 2))}
                    </div>
                </div>
            `;

            resultsDiv.innerHTML = html;
        }

        function formatJSON(jsonString) {
            return jsonString
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/(".*?":)/g, '<span style="color: #24292e; font-weight: bold;">$1</span>')
                .replace(/: "(.*?)"/g, ': <span style="color: #032f62;">"$1"</span>')
                .replace(/: (true|false|null)/g, ': <span style="color: #6f42c1;">$1</span>')
                .replace(/: (\\d+)/g, ': <span style="color: #005cc5;">$1</span>')
                .replace(/([{}[\\],])/g, '<span style="color: #24292e;">$1</span>');
        }

        function showError(message) {
            const errorElement = document.getElementById('errorMessage');
            if (errorElement) {
                errorElement.innerHTML = `
                    <div class="error">${message}</div>
                `;
            } else {
                console.error('Error message element not found:', message);
            }
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

@app.route('/ats/standard', methods=['POST'])
def standard_ats_analysis():
    """Standard ATS analysis endpoint"""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'})
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract text from file
            resume_text = DocumentExtractor.extract_text(filepath)
            
            if not resume_text.strip():
                raise ValueError("No text extracted from file")
            
            # Initialize ATS service
            ats_service = StandardATSService(api_key=os.getenv('GEMINI_API_KEY'))
            
            # Run standard ATS analysis
            logger.info(f"Running standard ATS analysis for: {filename}")
            results = ats_service.analyze_resume(resume_text)
            
            # Add extracted text to results if not already present
            if 'extracted_text' not in results:
                results['extracted_text'] = resume_text
            
            # Clean up temporary file
            os.unlink(filepath)
            
            return jsonify({
                'success': True,
                'data': results
            })
            
        except Exception as e:
            # Clean up temporary file on error
            if os.path.exists(filepath):
                os.unlink(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"Standard ATS analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/ats/jd-specific', methods=['POST'])
def jd_specific_ats_analysis():
    """Job Description specific ATS analysis endpoint"""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'})
        
        # Check if job description was provided
        if 'job_description' not in request.form:
            return jsonify({'success': False, 'error': 'Job description is required'})
        
        file = request.files['resume']
        job_description = request.form['job_description']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        if not job_description.strip():
            return jsonify({'success': False, 'error': 'Job description cannot be empty'})
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract text from file
            resume_text = DocumentExtractor.extract_text(filepath)
            
            if not resume_text.strip():
                raise ValueError("No text extracted from file")
            
            # Initialize ATS service
            ats_service = JDSpecificATSService(api_key=os.getenv('GEMINI_API_KEY'))
            
            # Run JD-specific ATS analysis
            logger.info(f"Running JD-specific ATS analysis for: {filename}")
            results = ats_service.analyze_resume_for_jd(resume_text, job_description)
            
            # Add extracted text to results if not already present
            if 'extracted_text' not in results:
                results['extracted_text'] = resume_text
            
            # Clean up temporary file
            os.unlink(filepath)
            
            return jsonify({
                'success': True,
                'data': results
            })
            
        except Exception as e:
            # Clean up temporary file on error
            if os.path.exists(filepath):
                os.unlink(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"JD-specific ATS analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/ai/suggestions', methods=['POST'])
def ai_suggestions():
    """AI-powered resume suggestions with job description generation"""
    try:
        # Check if file was uploaded
        if 'resume' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'})
        
        # Check if required parameters were provided
        if 'sector' not in request.form or 'country' not in request.form or 'designation' not in request.form:
            return jsonify({'success': False, 'error': 'Sector, country, and designation are required'})
        
        file = request.files['resume']
        sector = request.form['sector']
        country = request.form['country']
        designation = request.form['designation']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        if not sector.strip() or not country.strip() or not designation.strip():
            return jsonify({'success': False, 'error': 'Sector, country, and designation cannot be empty'})
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Initialize AI service
            ai_service = AISuggestionService()
            
            # Step 1: Parse the resume
            logger.info(f"Parsing resume for AI suggestions: {filename}")
            parser = GeminiResumeParser()
            resume_data = parser.parse_resume_from_file(filepath)
            
            # Step 2: Generate job description
            logger.info(f"Generating job description for {designation} in {sector} sector, {country}")
            job_description = ai_service.generate_job_description(sector, country, designation)
            
            # Step 3: Get AI suggestions by comparing resume with job description
            logger.info("Comparing resume with job description and generating suggestions")
            suggestions = ai_service.compare_resume_with_jd(resume_data, job_description)
            
            # Clean up temporary file
            os.unlink(filepath)
            
            return jsonify({
                'success': True,
                'data': {
                    'resumeData': resume_data,
                    'jobDescription': job_description,
                    'suggestions': suggestions,
                    'processedAt': str(datetime.datetime.now()),
                    'parameters': {
                        'sector': sector,
                        'country': country,
                        'designation': designation
                    }
                }
            })
            
        except Exception as e:
            # Clean up temporary file on error
            if os.path.exists(filepath):
                os.unlink(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"AI suggestions analysis failed: {str(e)}")
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
    print("🚀 Starting Gemini Resume Parser & ATS Analysis Web UI...")
    print("📱 Open your browser and go to: http://localhost:5000")
    print("🔑 Make sure your GEMINI_API_KEY is set in environment variables")
    print("📁 You can now upload and test resume files with comprehensive AI analysis!")
    print("\nFeatures:")
    print("  • Resume Parsing with Gemini AI")
    print("  • Standard ATS Analysis (General optimization)")
    print("  • JD-Specific ATS Analysis (Job matching)")
    print("  • AI-Powered Resume Suggestions (Job description generation + comparison)")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
