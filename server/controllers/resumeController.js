import Resume from "../models/resumeModel.js";
import User from "../models/userModel.js";
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
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

// Generate Word document from HTML resume data
export const generateWord = async (req, res) => {
  try {
    const { htmlContent, templateId, resumeData } = req.body;

    if (!htmlContent || !templateId) {
      return res.status(400).json({ 
        message: "Missing required fields: htmlContent and templateId" 
      });
    }

    // Launch Puppeteer to render HTML with all styles
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
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract styled content from the rendered page
    const styledContent = await page.evaluate(() => {
      const container = document.querySelector('.template-container') || document.body;
      
      // Function to get computed styles for an element
      const getElementStyles = (element) => {
        const computedStyle = window.getComputedStyle(element);
        return {
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily,
          fontWeight: computedStyle.fontWeight,
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor,
          textAlign: computedStyle.textAlign,
          margin: computedStyle.margin,
          padding: computedStyle.padding,
          lineHeight: computedStyle.lineHeight,
          textDecoration: computedStyle.textDecoration,
          fontStyle: computedStyle.fontStyle
        };
      };

      // Function to extract text content with styling information
      const extractStyledText = (element) => {
        const result = [];
        
        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) {
              const parentElement = node.parentElement;
              const styles = getElementStyles(parentElement);
              result.push({
                type: 'text',
                content: text,
                styles: styles,
                tagName: parentElement.tagName.toLowerCase()
              });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            
            // Handle different element types
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              const styles = getElementStyles(node);
              result.push({
                type: 'heading',
                level: parseInt(tagName.substring(1)),
                content: node.textContent.trim(),
                styles: styles
              });
            } else if (tagName === 'p') {
              const styles = getElementStyles(node);
              result.push({
                type: 'paragraph',
                content: node.textContent.trim(),
                styles: styles
              });
            } else if (tagName === 'br') {
              result.push({
                type: 'linebreak'
              });
            } else {
              // Process child nodes
              Array.from(node.childNodes).forEach(processNode);
            }
          }
        };

        Array.from(element.childNodes).forEach(processNode);
        return result;
      };

      return extractStyledText(container);
    });

    await browser.close();

    // Convert extracted content to Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: []
      }]
    });

    // Process the extracted content
    styledContent.forEach(item => {
      if (item.type === 'heading') {
        const headingLevel = item.level === 1 ? HeadingLevel.TITLE : 
                            item.level === 2 ? HeadingLevel.HEADING_1 :
                            item.level === 3 ? HeadingLevel.HEADING_2 :
                            item.level === 4 ? HeadingLevel.HEADING_3 :
                            HeadingLevel.HEADING_4;

        doc.addSection({
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.content,
                  bold: item.styles.fontWeight === 'bold' || parseInt(item.styles.fontWeight) >= 600,
                  italics: item.styles.fontStyle === 'italic',
                  size: Math.round(parseFloat(item.styles.fontSize) * 2), // Convert px to half-points
                  color: item.styles.color !== 'rgb(0, 0, 0)' ? item.styles.color.replace('rgb', '').replace('(', '').replace(')', '') : undefined,
                }),
              ],
              heading: headingLevel,
              spacing: {
                after: 200,
              },
            })
          ]
        });
      } else if (item.type === 'paragraph') {
        doc.addSection({
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.content,
                  bold: item.styles.fontWeight === 'bold' || parseInt(item.styles.fontWeight) >= 600,
                  italics: item.styles.fontStyle === 'italic',
                  size: Math.round(parseFloat(item.styles.fontSize) * 2),
                  color: item.styles.color !== 'rgb(0, 0, 0)' ? item.styles.color.replace('rgb', '').replace('(', '').replace(')', '') : undefined,
                }),
              ],
              spacing: {
                after: 100,
              },
            })
          ]
        });
      } else if (item.type === 'text') {
        // Add text runs for inline content
        const currentSection = doc.sections[doc.sections.length - 1];
        if (currentSection && currentSection.children.length > 0) {
          const lastParagraph = currentSection.children[currentSection.children.length - 1];
          if (lastParagraph.children) {
            lastParagraph.children.push(
              new TextRun({
                text: item.content,
                bold: item.styles.fontWeight === 'bold' || parseInt(item.styles.fontWeight) >= 600,
                italics: item.styles.fontStyle === 'italic',
                size: Math.round(parseFloat(item.styles.fontSize) * 2),
                color: item.styles.color !== 'rgb(0, 0, 0)' ? item.styles.color.replace('rgb', '').replace('(', '').replace(')', '') : undefined,
              })
            );
          }
        }
      } else if (item.type === 'linebreak') {
        // Add line break
        const currentSection = doc.sections[doc.sections.length - 1];
        if (currentSection && currentSection.children.length > 0) {
          const lastParagraph = currentSection.children[currentSection.children.length - 1];
          if (lastParagraph.children) {
            lastParagraph.children.push(new TextRun({ text: '\n' }));
          }
        }
      }
    });

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc);

    // Set response headers for Word download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="resume_${templateId}.docx"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the Word buffer
    res.send(buffer);

  } catch (error) {
    console.error("Word generation error:", error);
    res.status(500).json({ 
      message: "Error generating Word document",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};