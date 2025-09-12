import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';
import { tokenUtils } from '@/lib/utils';

export interface WordGenerationRequest {
  htmlContent: string;
  templateId: string;
  resumeData: any;
}

export const generateWord = async (request: WordGenerationRequest): Promise<Blob> => {
  try {
    // Extract CSS classes used in the resume HTML to reduce payload size
    const usedClasses = new Set<string>();
    const htmlElement = document.createElement('div');
    htmlElement.innerHTML = request.htmlContent;
    
    // Find all class names used in the HTML
    const allElements = htmlElement.querySelectorAll('*');
    allElements.forEach(element => {
      const className = element.getAttribute('class');
      if (className) {
        className.split(' ').forEach(cls => {
          if (cls.trim()) usedClasses.add(cls.trim());
        });
      }
    });

    // Get only relevant CSS styles to reduce payload size
    const relevantStyles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .filter(rule => {
              const cssText = rule.cssText.toLowerCase();
              const selector = (rule as any).selectorText?.toLowerCase() || '';
              
              // Include rules that match used classes or are essential for templates
              return Array.from(usedClasses).some(cls => 
                selector.includes(cls.toLowerCase()) ||
                selector.includes('.' + cls.toLowerCase())
              ) || cssText.includes('template') || 
                     cssText.includes('resume') || 
                     cssText.includes('@media') ||
                     cssText.includes('@keyframes') ||
                     cssText.includes('@import') ||
                     cssText.includes('@font-face') ||
                     cssText.includes('body') ||
                     cssText.includes('html') ||
                     cssText.includes('*');
            })
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Handle cross-origin stylesheets
          return '';
        }
      })
      .filter(style => style.length > 0)
      .join('\n');

    // Get all inline styles from the document
    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map(style => style.innerHTML)
      .join('\n');

    // Get computed styles for the resume element to ensure all styles are captured
    const resumeElement = document.querySelector('.template-container') || document.querySelector('[data-template]');
    let computedStyles = '';
    
    if (resumeElement) {
      const computedStyle = window.getComputedStyle(resumeElement);
      const importantStyles = [
        'font-family', 'font-size', 'line-height', 'color', 'background-color',
        'margin', 'padding', 'border', 'width', 'height', 'display', 'flex-direction',
        'justify-content', 'align-items', 'gap', 'text-align', 'font-weight'
      ];
      
      computedStyles = importantStyles
        .map(prop => {
          const value = computedStyle.getPropertyValue(prop);
          return value ? `${prop}: ${value} !important;` : '';
        })
        .filter(Boolean)
        .join('\n');
    }

    // Combine all styles
    const allStyles = `
      <style>
        /* Reset and base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        /* Document styles */
        ${relevantStyles}
        
        /* Inline styles */
        ${inlineStyles}
        
        /* Computed styles for template container */
        .template-container {
          ${computedStyles}
        }
        
        /* Word-specific styles */
        .template-container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        /* Ensure proper formatting for Word */
        .page-break {
          page-break-before: always;
        }
        
        /* Hide elements that shouldn't be in Word */
        .no-print {
          display: none !important;
        }
        
        /* Ensure text is black for better Word compatibility */
        * {
          color: #000 !important;
          background: transparent !important;
        }
        
        /* Preserve inline styles */
        [style] {
          color: inherit !important;
        }
        
        /* Ensure template styling is preserved */
        .template-container * {
          font-family: inherit;
        }
      </style>
    `;

    // Create complete HTML document with styles
    const completeHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${request.templateId}</title>
        ${allStyles}
      </head>
      <body>
        <div class="template-container" data-template="${request.templateId}">
          ${request.htmlContent}
        </div>
      </body>
      </html>
    `;

    // Update the request with complete HTML
    const updatedRequest = {
      ...request,
      htmlContent: completeHtml
    };

    const response = await axios.post(`${API_URL}/resume/generate-word`, updatedRequest, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${tokenUtils.getToken()}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document. Please try again.');
  }
};

export const downloadWord = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

