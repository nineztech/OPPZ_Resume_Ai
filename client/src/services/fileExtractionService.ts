// Optimized file extraction service for PDF and DOC files
// This version uses a more reliable approach for PDF extraction

export interface ExtractedText {
  text: string;
  sections: {
    [key: string]: string;
  };
}

class FileExtractionService {
  private pdfjsLib: any = null;
  private mammoth: any = null;
  private isInitialized = false;

  constructor() {
    this.initializeLibraries();
  }

  private async initializeLibraries() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing file extraction libraries...');
      
      if (typeof window !== 'undefined') {
        // For PDF extraction - use a simpler approach
        try {
          // Try to load PDF.js from CDN if not available as module
          if (!window.pdfjsLib) {
            await this.loadPDFJSFromCDN();
          } else {
            this.pdfjsLib = window.pdfjsLib;
          }
          console.log('PDF.js loaded successfully');
        } catch (error) {
          console.warn('PDF.js not available, trying alternative approach:', error);
        }

        // For DOC extraction
        try {
          this.mammoth = await import('mammoth');
          console.log('Mammoth imported successfully');
        } catch (error) {
          console.warn('Mammoth library not available:', error);
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing libraries:', error);
    }
  }

  private async loadPDFJSFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        this.pdfjsLib = window.pdfjsLib;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          this.pdfjsLib = window.pdfjsLib;
          // Configure worker
          this.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve();
        } else {
          reject(new Error('PDF.js failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
  }

  async extractTextFromFile(file: File): Promise<ExtractedText> {
    console.log('Extracting text from file:', file.name, file.type, 'Size:', file.size);
    
    // Ensure libraries are initialized
    await this.initializeLibraries();
    
    try {
      let extractedText = '';
      const startTime = Date.now();

      if (file.type === 'application/pdf') {
        console.log('Processing PDF file...');
        extractedText = await this.extractFromPDF(file);
      } else if (this.isWordDocument(file)) {
        console.log('Processing Word document...');
        extractedText = await this.extractFromDOC(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        console.log('Processing text file...');
        extractedText = await file.text();
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      const endTime = Date.now();
      console.log(`Text extraction completed in ${endTime - startTime}ms, length: ${extractedText.length}`);
      
      const result = this.parseExtractedText(extractedText);
      return result;
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  private isWordDocument(file: File): boolean {
    return file.type.includes('word') || 
           file.type.includes('document') ||
           file.name.endsWith('.docx') || 
           file.name.endsWith('.doc') ||
           file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  private async extractFromPDF(file: File): Promise<string> {
    if (!this.pdfjsLib) {
      throw new Error('PDF.js library not available. Please ensure PDF.js is loaded.');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('PDF ArrayBuffer size:', arrayBuffer.byteLength);
      
      // Configure PDF.js for better performance
      const loadingTask = this.pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
        // Disable worker for simpler setup
        disableWorker: false,
        // Optimize for speed
        disableAutoFetch: true,
        disableStream: true
      });

      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 50); // Limit pages for performance
      
      // Extract text from all pages
      const pagePromises = [];
      for (let i = 1; i <= maxPages; i++) {
        pagePromises.push(this.extractPageText(pdf, i));
      }
      
      const pageTexts = await Promise.all(pagePromises);
      fullText = pageTexts.join('\n\n');
      
      console.log(`PDF extraction completed. Total text length: ${fullText.length}`);
      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // Fallback: try simpler extraction method
      if (error.message && error.message.includes('worker')) {
        console.log('Retrying with worker disabled...');
        return this.extractFromPDFSimple(file);
      }
      
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  private async extractPageText(pdf: any, pageNum: number): Promise<string> {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them
      const textItems = textContent.items || [];
      const pageText = textItems
        .filter((item: any) => item.str && item.str.trim())
        .map((item: any) => item.str)
        .join(' ');
      
      return pageText;
    } catch (error) {
      console.warn(`Error extracting page ${pageNum}:`, error);
      return '';
    }
  }

  private async extractFromPDFSimple(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Disable worker completely for simpler extraction
      const originalWorkerSrc = this.pdfjsLib.GlobalWorkerOptions.workerSrc;
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      
      const pdf = await this.pdfjsLib.getDocument({
        data: arrayBuffer,
        disableWorker: true,
        useWorkerFetch: false,
        isEvalSupported: false
      }).promise;
      
      let fullText = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .filter((str: string) => str.trim())
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
        } catch (pageError) {
          console.warn(`Error processing page ${i}:`, pageError);
        }
      }
      
      // Restore worker setting
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
      
      return fullText;
    } catch (error) {
      console.error('Simple PDF extraction failed:', error);
      throw error;
    }
  }

  private async extractFromDOC(file: File): Promise<string> {
    if (!this.mammoth) {
      throw new Error('Mammoth library not available for Word document processing');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await this.mammoth.extractRawText({ arrayBuffer });
      return result.value || '';
    } catch (error) {
      console.error('Word document extraction error:', error);
      throw new Error(`Word document extraction failed: ${error.message}`);
    }
  }

  private parseExtractedText(text: string): ExtractedText {
    if (!text || text.trim().length === 0) {
      return { text: '', sections: {} };
    }

    console.log('Parsing extracted text, length:', text.length);
    
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const sections: { [key: string]: string } = {};
    let currentSection = 'general';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (this.isSectionHeader(line)) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = this.getSectionKey(line);
        currentContent = [];
      } else if (line.length > 2) { // Ignore very short lines
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    // If no specific sections found, add some basic parsing
    if (Object.keys(sections).length <= 1) {
      this.parseUnstructuredText(normalizedText, sections);
    }

    console.log('Parsed sections:', Object.keys(sections));
    
    return {
      text: normalizedText,
      sections
    };
  }

  private parseUnstructuredText(text: string, sections: { [key: string]: string }) {
    // Try to identify sections even without clear headers
    const lowerText = text.toLowerCase();
    
    // Look for experience keywords
    const experienceKeywords = ['work experience', 'experience', 'employment', 'career', 'job'];
    const educationKeywords = ['education', 'academic', 'university', 'college', 'degree'];
    const skillsKeywords = ['skills', 'technical skills', 'competencies', 'expertise'];
    
    if (experienceKeywords.some(keyword => lowerText.includes(keyword))) {
      sections.experience = text;
    }
    if (educationKeywords.some(keyword => lowerText.includes(keyword))) {
      sections.education = text;
    }
    if (skillsKeywords.some(keyword => lowerText.includes(keyword))) {
      sections.skills = text;
    }
  }

  private isSectionHeader(line: string): boolean {
    if (line.length > 100) return false; // Headers are usually short
    
    const lowerLine = line.toLowerCase().trim();
    
    // Check if line is all caps (common for headers)
    const isAllCaps = line === line.toUpperCase() && line.length > 2;
    
    // Common section keywords
    const sectionKeywords = [
      'professional summary', 'summary', 'profile', 'objective', 'about',
      'work experience', 'experience', 'employment history', 'career',
      'education', 'academic background', 'qualifications', 'degrees',
      'skills', 'technical skills', 'core competencies', 'expertise',
      'languages', 'language skills', 'language proficiency',
      'projects', 'key projects', 'notable projects',
      'achievements', 'accomplishments', 'awards', 'honors',
      'certifications', 'certificates', 'licenses',
      'volunteer', 'volunteering', 'volunteer work',
      'activities', 'extracurricular', 'interests', 'hobbies',
      'references', 'contact', 'personal details'
    ];

    const containsKeyword = sectionKeywords.some(keyword => 
      lowerLine === keyword || lowerLine.startsWith(keyword + ':') || lowerLine.endsWith(keyword)
    );

    return isAllCaps || containsKeyword || (line.endsWith(':') && line.length < 50);
  }

  private getSectionKey(header: string): string {
    const lowerHeader = header.toLowerCase().replace(/[:\-_]/g, '').trim();
    
    const sectionMap: { [key: string]: string[] } = {
      'summary': ['summary', 'profile', 'objective', 'about', 'overview'],
      'experience': ['experience', 'work experience', 'employment', 'career', 'work history'],
      'education': ['education', 'academic', 'qualifications', 'degrees', 'schooling'],
      'skills': ['skills', 'technical skills', 'competencies', 'expertise', 'abilities'],
      'languages': ['languages', 'language skills', 'language proficiency'],
      'activities': ['activities', 'projects', 'interests', 'hobbies', 'extracurricular'],
      'volunteering': ['volunteer', 'volunteering', 'volunteer work', 'community service'],
      'achievements': ['achievements', 'accomplishments', 'awards', 'honors', 'certifications']
    };

    for (const [section, keywords] of Object.entries(sectionMap)) {
      if (keywords.some(keyword => lowerHeader.includes(keyword))) {
        return section;
      }
    }
    
    return 'general';
  }

  extractContactInfo(text: string): {
    email?: string;
    phone?: string;
    name?: string;
    location?: string;
    title?: string;
  } {
    const contactInfo: any = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Email extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }

    // Phone extraction (improved patterns)
    const phonePatterns = [
      /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/,
      /\+?[\d\s\-\(\)]{10,}/,
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = text.match(pattern);
      if (phoneMatch) {
        contactInfo.phone = phoneMatch[0].trim();
        break;
      }
    }

    // Name extraction (from first few lines)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (this.looksLikeName(line)) {
        contactInfo.name = line;
        break;
      }
    }

    // Location extraction
    const locationPatterns = [
      /(?:address|location|city|lives in):\s*([^,\n]+(?:,\s*[^,\n]+)*)/i,
      /([A-Za-z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/,
      /([A-Za-z\s]+,\s*[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?)/
    ];
    
    for (const pattern of locationPatterns) {
      const locationMatch = text.match(pattern);
      if (locationMatch) {
        contactInfo.location = locationMatch[1].trim();
        break;
      }
    }

    return contactInfo;
  }

  private looksLikeName(line: string): boolean {
    if (!line || line.length < 3 || line.length > 50) return false;
    if (line.includes('@') || line.includes('http') || line.includes('www')) return false;
    if (/^\d/.test(line) || line.includes('resume') || line.includes('cv')) return false;
    
    // Should contain at least 2 words with proper capitalization
    const words = line.split(/\s+/);
    if (words.length < 2) return false;
    
    return words.every(word => 
      word.length > 0 && 
      word[0] === word[0].toUpperCase() && 
      /^[A-Za-z\s\-'\.]+$/.test(word)
    );
  }
}

// Add type declaration for PDF.js global
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const fileExtractionService = new FileExtractionService();