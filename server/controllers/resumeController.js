import Resume from "../models/resumeModel.js";
import User from "../models/userModel.js";
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Save new resume
// Save new resume
export const saveResume = async (req, res) => {
  try {
    // Add debugging to check if req.body exists
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers['content-type']);

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ 
        message: "Request body is missing. Ensure Content-Type is application/json" 
      });
    }

    const { title, templateId, selectedColor, resumeData } = req.body;

    // Validate required fields
    if (!title || !templateId || !resumeData) {
      return res.status(400).json({ 
        message: "Missing required fields",
        received: { title: !!title, templateId: !!templateId, resumeData: !!resumeData }
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id; // set by auth middleware

    const resume = await Resume.create({
      userId,
      title,
      templateId,
      selectedColor,
      resumeData
    });

    res.status(201).json({ 
      message: "Resume saved successfully", 
      resume 
    });
  } catch (error) {
    console.error("Save resume error:", error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: error.message 
      });
    }
    
    if (error.name === 'SequelizeError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: "Database error", 
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    res.status(500).json({ 
      message: "Server error",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update existing resume
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, templateId, selectedColor, resumeData } = req.body;
    const userId = req.user.id;

    const resume = await Resume.findOne({ 
      where: { id, userId } 
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await resume.update({
      title,
      templateId,
      selectedColor,
      resumeData,
      lastEdited: new Date()
    });

    res.status(200).json({ 
      message: "Resume updated successfully", 
      resume 
    });
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's resumes
export const getUserResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const resumes = await Resume.findAll({
      where: { userId, isActive: true },
      order: [['lastEdited', 'DESC']]
    });

    res.status(200).json(resumes);
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get specific resume
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      where: { id, userId, isActive: true }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete resume (soft delete)
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await resume.update({ isActive: false });

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate PDF from HTML resume data
export const generatePDF = async (req, res) => {
  try {
    const { htmlContent, templateId, resumeData } = req.body;

    if (!htmlContent || !templateId) {
      return res.status(400).json({ 
        message: "Missing required fields: htmlContent and templateId" 
      });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(1000);
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    // Extract text from the generated PDF for ATS analysis (optional)
    let extractedText = '';
    try {
      // Only attempt text extraction if pdf-parse is available
      const pdfParseModule = await import('pdf-parse').catch(() => null);
      if (pdfParseModule) {
        const pdfData = await pdfParseModule.default(pdfBuffer);
        extractedText = pdfData.text;
        console.log('Extracted text length:', extractedText.length);
      }
    } catch (parseError) {
      console.log('Text extraction skipped - pdf-parse not available');
      // Continue without text extraction - this is optional
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume_${templateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ 
      message: "Error generating PDF",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};