import axios from 'axios';
import { tokenUtils } from '@/lib/utils';

export interface PDFGenerationRequest {
  htmlContent: string;
  templateId: string;
  resumeData: any;
}

export const generatePDF = async (request: PDFGenerationRequest): Promise<Blob> => {
  try {
    const response = await axios.post('http://localhost:5006/api/resume/generate-pdf', request, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${tokenUtils.getToken()}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const downloadPDF = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
