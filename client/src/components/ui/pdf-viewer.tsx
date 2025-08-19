import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface ATSIssue {
  text: string;
  type: 'missing_keyword' | 'formatting_issue' | 'section_missing' | 'grammar_error' | 'achievement_missing' | 'contact_issue';
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion?: string;
}

interface Highlight {
  text: string;
  color: string;
  type: 'positive' | 'negative' | 'suggestion';
  issue?: ATSIssue;
}

interface PDFViewerProps {
  file: File | Blob | string; // Can be File object, Blob, or URL string
  className?: string;
  highlights?: Highlight[];
  atsIssues?: ATSIssue[];
  showATSHighlights?: boolean;
  onIssueClick?: (issue: ATSIssue) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  file, 
  className = '', 
  highlights = [], 
  atsIssues = [],
  showATSHighlights = false,
  onIssueClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get color based on ATS issue severity and type
  const getIssueColor = (issue: ATSIssue): { fill: string; border: string } => {
    const colors = {
      high: { fill: '#FEE2E2', border: '#DC2626' }, // Red
      medium: { fill: '#FEF3C7', border: '#D97706' }, // Amber
      low: { fill: '#DBEAFE', border: '#2563EB' } // Blue
    };
    return colors[issue.severity] || colors.medium;
  };

  // Convert ATS issues to highlights
  const getATSHighlights = (): Highlight[] => {
    if (!showATSHighlights || !atsIssues.length) return [];
    
    return atsIssues.map(issue => {
      const colors = getIssueColor(issue);
      return {
        text: issue.text,
        color: colors.border,
        type: issue.severity === 'high' ? 'negative' : 'suggestion' as 'negative' | 'suggestion',
        issue
      };
    });
  };

  useEffect(() => {
    let pdfDoc: any = null;
    let renderTask: any = null;

    const loadPDF = async () => {
      try {
        // Get PDF data based on input type
        let pdfData;
        if (typeof file === 'string') {
          pdfData = { url: file };
        } else if (file instanceof Blob) {
          pdfData = await file.arrayBuffer();
        }

        if (!pdfData) return;

        // Load the PDF document
        pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        
        // Get the first page
        const page = await pdfDoc.getPage(1);
        
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          // Set canvas size to match PDF page size with better scaling
          const viewport = page.getViewport({ scale: 1.8 }); // Increased scale for better readability
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          renderTask = page.render(renderContext);
          await renderTask.promise;

          // Apply highlights after rendering
          const allHighlights = [...highlights, ...getATSHighlights()];
          if (allHighlights.length > 0 && context) {
            await applyHighlights(page, context, viewport, allHighlights);
          }
        }
      } catch (error) {
        console.error('Error rendering PDF:', error);
      }
    };

    const applyHighlights = async (page: any, context: CanvasRenderingContext2D, viewport: any, highlightsToApply: Highlight[]) => {
      try {
        // Get text content and positions
        const textContent = await page.getTextContent();
        
        highlightsToApply.forEach(highlight => {
          textContent.items.forEach((item: any) => {
            if (item.str.toLowerCase().includes(highlight.text.toLowerCase())) {
              // Calculate position
              const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
              const x = tx[4];
              const y = viewport.height - tx[5];
              
              // Get colors based on highlight type
              let fillColor = highlight.color;
              let strokeColor = highlight.color;
              let alpha = 0.25;
              
              if (highlight.issue) {
                const colors = getIssueColor(highlight.issue);
                fillColor = colors.fill;
                strokeColor = colors.border;
                alpha = highlight.issue.severity === 'high' ? 0.4 : 0.3;
              }
              
              // Draw highlight rectangle with improved styling
              context.save();
              context.globalAlpha = alpha;
              context.fillStyle = fillColor;
              
              // Add border based on severity
              context.strokeStyle = strokeColor;
              context.lineWidth = highlight.issue?.severity === 'high' ? 2 : 1;
              
              // Add slight padding and rounded corners effect
              const padding = 2;
              const rectX = x - padding;
              const rectY = y - item.height * viewport.scale - padding;
              const rectWidth = item.width * viewport.scale + (padding * 2);
              const rectHeight = item.height * viewport.scale + (padding * 2);
              
              // Draw filled rectangle
              context.fillRect(rectX, rectY, rectWidth, rectHeight);
              
              // Draw border
              context.globalAlpha = 1;
              context.strokeRect(rectX, rectY, rectWidth, rectHeight);
              
              // Add small indicator for ATS issues
              if (highlight.issue) {
                const indicatorSize = 6;
                context.fillStyle = strokeColor;
                context.globalAlpha = 1;
                context.beginPath();
                context.arc(
                  rectX + rectWidth - indicatorSize, 
                  rectY + indicatorSize, 
                  indicatorSize / 2, 
                  0, 
                  2 * Math.PI
                );
                context.fill();
              }
              
              context.restore();
            }
          });
        });
      } catch (error) {
        console.error('Error applying highlights:', error);
      }
    };

    loadPDF();

    // Cleanup
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [file, highlights, atsIssues, showATSHighlights]);

  return (
    <div ref={containerRef} className={`pdf-viewer ${className}`}>
      {/* ATS Issues Legend */}
      {showATSHighlights && atsIssues.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">ATS Issues Legend:</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-200 border border-red-600 rounded"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-200 border border-amber-600 rounded"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-200 border border-blue-600 rounded"></div>
              <span>Low Priority</span>
            </div>
          </div>
        </div>
      )}
      
      {/* PDF Canvas */}
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto rounded-lg shadow-sm border" 
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>
      
      {/* ATS Issues Summary */}
      {showATSHighlights && atsIssues.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Identified Issues:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {atsIssues.map((issue, index) => (
              <div 
                key={index}
                onClick={() => onIssueClick?.(issue)}
                className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                  issue.severity === 'high' ? 'bg-red-100 border-l-2 border-red-600 text-red-800' :
                  issue.severity === 'medium' ? 'bg-amber-100 border-l-2 border-amber-600 text-amber-800' :
                  'bg-blue-100 border-l-2 border-blue-600 text-blue-800'
                }`}
              >
                <div className="font-medium">{issue.type.replace(/_/g, ' ').toUpperCase()}</div>
                <div className="text-xs opacity-80">{issue.description}</div>
                {issue.suggestion && (
                  <div className="text-xs mt-1 font-medium">💡 {issue.suggestion}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
export type { ATSIssue, Highlight };
