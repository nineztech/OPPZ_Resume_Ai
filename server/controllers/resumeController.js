import Resume from "../models/resumeModel.js";
import User from "../models/userModel.js";
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

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

// Update resume title only
export const updateResumeTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const resume = await Resume.findOne({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await resume.update({
      title,
      lastEdited: new Date()
    });

    res.status(200).json({ 
      message: "Resume title updated successfully", 
      resume 
    });
  } catch (error) {
    console.error("Update resume title error:", error);
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
        top: '1mm',
        right: '1mm',
        bottom: '1mm',
        left: '1mm'
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

// Generate Word document from HTML resume data (UPDATED)
export const generateWord = async (req, res) => {
  try {
    const { htmlContent, templateId } = req.body;

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
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract styled content from the rendered page
    const styledContent = await page.evaluate(() => {
      const container = document.querySelector('.template-container') || document.body;

      const getElementStyles = (element) => {
        const cs = window.getComputedStyle(element);
        return {
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily,
          fontWeight: cs.fontWeight,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          textAlign: cs.textAlign,
          margin: cs.margin,
          padding: cs.padding,
          lineHeight: cs.lineHeight,
          textDecoration: cs.textDecoration,
          fontStyle: cs.fontStyle
        };
      };

      const result = [];

      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.textContent || "").trim();
          if (text) {
            const parentElement = node.parentElement || container;
            const styles = getElementStyles(parentElement);
            result.push({
              type: 'text',
              content: text,
              styles: styles,
              tagName: parentElement.tagName ? parentElement.tagName.toLowerCase() : 'span'
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          const tagName = el.tagName.toLowerCase();

          if (['h1','h2','h3','h4','h5','h6'].includes(tagName)) {
            const styles = getElementStyles(el);
            const text = (el.textContent || "").trim();
            if (text) {
              result.push({
                type: 'heading',
                level: parseInt(tagName.substring(1), 10),
                content: text,
                styles: styles
              });
            }
          } else if (tagName === 'p') {
            const styles = getElementStyles(el);
            const text = (el.textContent || "").trim();
            if (text) {
              result.push({
                type: 'paragraph',
                content: text,
                styles: styles
              });
            }
            // Also walk children to capture inline emphasis if present
            Array.from(el.childNodes).forEach(processNode);
          } else if (tagName === 'br') {
            result.push({ type: 'linebreak' });
          } else {
            Array.from(el.childNodes).forEach(processNode);
          }
        }
      };

      Array.from(container.childNodes).forEach(processNode);
      return result;
    });

    await browser.close();

    // --- Helpers to translate CSS -> docx ---
    const isBold = (fw) => {
      if (!fw) return false;
      if (typeof fw === 'string') {
        if (fw.toLowerCase() === 'bold') return true;
        const n = parseInt(fw, 10);
        return !isNaN(n) && n >= 600;
      }
      if (typeof fw === 'number') return fw >= 600;
      return false;
    };

    const pxToHalfPoints = (pxStr) => {
      const n = parseFloat(pxStr || '');
      // docx uses half-points; 1px ~ 0.75pt => 1px * 0.75 * 2 = 1.5 half-points
      // But many examples simply use px*2; keep prior approach for visual parity
      return Number.isFinite(n) ? Math.round(n * 2) : 24; // default ~12pt
    };

    const rgbToHex = (rgbStr) => {
      if (!rgbStr) return undefined;
      const s = rgbStr.trim();
      if (s.startsWith('#')) {
        return s.replace('#', '').toUpperCase();
      }
      // rgb or rgba
      const m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
      if (!m) return undefined;
      const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
      const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
      const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
      const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
      return hex.toUpperCase();
    };

    const colorOrUndefined = (rgbStr) => {
      const hex = rgbToHex(rgbStr);
      // Avoid setting pure black to keep default
      if (!hex || hex === '000000') return undefined;
      return hex;
    };

    const toAlignment = (alignStr) => {
      const s = (alignStr || '').toLowerCase();
      switch (s) {
        case 'center': return AlignmentType.CENTER;
        case 'right': return AlignmentType.RIGHT;
        case 'justify': return AlignmentType.JUSTIFIED;
        case 'left':
        default: return AlignmentType.LEFT;
      }
    };

    // --- Build paragraphs first (no in-place mutations) ---
    const paragraphs = [];
    let currentRuns = [];
    let currentAlign = AlignmentType.LEFT;

    const flushParagraph = (spacingAfter = 100) => {
      if (currentRuns.length > 0) {
        paragraphs.push(new Paragraph({
          children: currentRuns,
          alignment: currentAlign,
          spacing: { after: spacingAfter }
        }));
        currentRuns = [];
        currentAlign = AlignmentType.LEFT;
      }
    };

    const makeRun = (text, styles) => new TextRun({
      text: text || '',
      bold: isBold(styles?.fontWeight),
      italics: (styles?.fontStyle || '').toLowerCase() === 'italic',
      size: pxToHalfPoints(styles?.fontSize),
      color: colorOrUndefined(styles?.color)
    });

    (styledContent || []).forEach((item) => {
      if (!item || !item.type) return;

      if (item.type === 'heading') {
        // Finish any open paragraph first
        flushParagraph(100);

        const level = Math.min(Math.max(parseInt(item.level, 10) || 1, 1), 6);
        const headingPara = new Paragraph({
          children: [
            new TextRun({
              text: item.content || '',
              bold: isBold(item.styles?.fontWeight) || true, // headings generally bold
              italics: (item.styles?.fontStyle || '').toLowerCase() === 'italic',
              size: pxToHalfPoints(item.styles?.fontSize),
              color: colorOrUndefined(item.styles?.color)
            })
          ],
          heading:
            level === 1 ? HeadingLevel.HEADING_1 :
            level === 2 ? HeadingLevel.HEADING_2 :
            level === 3 ? HeadingLevel.HEADING_3 :
            level === 4 ? HeadingLevel.HEADING_4 :
            level === 5 ? HeadingLevel.HEADING_5 :
                          HeadingLevel.HEADING_6,
          alignment: toAlignment(item.styles?.textAlign),
          spacing: { after: 200 }
        });

        paragraphs.push(headingPara);

      } else if (item.type === 'paragraph') {
        // Start a new paragraph
        flushParagraph(100);
        currentAlign = toAlignment(item.styles?.textAlign);
        currentRuns.push(makeRun(item.content || '', item.styles));

      } else if (item.type === 'text') {
        // Inline text: append to current paragraph if exists, else start one
        if (currentRuns.length === 0) {
          currentAlign = toAlignment(item.styles?.textAlign);
        }
        currentRuns.push(makeRun(item.content || '', item.styles));

      } else if (item.type === 'linebreak') {
        // Insert a line break in the current paragraph; if no paragraph, create one
        if (currentRuns.length === 0) {
          currentRuns.push(new TextRun({ text: '', break: 1 }));
        } else {
          currentRuns.push(new TextRun({ text: '', break: 1 }));
        }
      }
    });

    // Flush any trailing paragraph
    flushParagraph(100);

    // Build the document with a single section
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
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
