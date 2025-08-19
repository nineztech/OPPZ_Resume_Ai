import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface Highlight {
  text: string;
  color: string;
  type: 'positive' | 'negative' | 'suggestion';
}

interface PDFViewerProps {
  file: File | Blob | string; // Can be File object, Blob, or URL string
  className?: string;
  highlights?: Highlight[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, className = '', highlights = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          if (highlights.length > 0 && context) {
            await applyHighlights(page, context, viewport);
          }
        }
      } catch (error) {
        console.error('Error rendering PDF:', error);
      }
    };

    const applyHighlights = async (page: any, context: CanvasRenderingContext2D, viewport: any) => {
      try {
        // Get text content and positions
        const textContent = await page.getTextContent();
        
        highlights.forEach(highlight => {
          textContent.items.forEach((item: any) => {
            if (item.str.toLowerCase().includes(highlight.text.toLowerCase())) {
              // Calculate position
              const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
              const x = tx[4];
              const y = viewport.height - tx[5];
              
                             // Draw highlight rectangle with better styling
               context.save();
               context.globalAlpha = 0.25;
               context.fillStyle = highlight.color;
               
               // Add subtle border
               context.strokeStyle = highlight.color;
               context.lineWidth = 1;
               
               // Draw filled rectangle
               context.fillRect(
                 x - 1, 
                 y - item.height * viewport.scale - 1, 
                 item.width * viewport.scale + 2, 
                 item.height * viewport.scale + 2
               );
               
               // Draw border
               context.strokeRect(
                 x - 1, 
                 y - item.height * viewport.scale - 1, 
                 item.width * viewport.scale + 2, 
                 item.height * viewport.scale + 2
               );
               
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
  }, [file, highlights]);

  return (
    <div className={`pdf-viewer ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-auto rounded-lg shadow-sm" 
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
};

export default PDFViewer;
