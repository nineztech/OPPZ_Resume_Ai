// fileExtractionService.ts
// Complete FileExtractionService for resume extraction (name, email, phone, location, education)
// Requires pdf.js available as window.pdfjsLib (or loaded via CDN) and mammoth for .docx

export interface ExtractedText {
  text: string;
  sections: { [key: string]: string };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    title?: string;
  };
  education?: string;
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
      if (typeof window !== 'undefined') {
        // Try to use existing window.pdfjsLib, or load from CDN
        if (!window.pdfjsLib) {
          await this.loadPDFJSFromCDN();
        } else {
          this.pdfjsLib = window.pdfjsLib;
        }
        // mammoth for docx
        try {
          this.mammoth = await import('mammoth');
        } catch (e) {
          console.warn('mammoth import failed (DOCX support not available):', e);
        }
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }

  private loadPDFJSFromCDN(): Promise<void> {
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
          this.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve();
        } else {
          reject(new Error('PDF.js loaded but window.pdfjsLib missing'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
      document.head.appendChild(script);
    });
  }

  async extractTextFromFile(file: File): Promise<ExtractedText> {
    await this.initializeLibraries();

    try {
      let rawText = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        rawText = await this.extractFromPDF(file);
      } else if (this.isWordDocument(file)) {
        rawText = await this.extractFromDOC(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        rawText = await file.text();
      } else {
        throw new Error(`Unsupported file type: ${file.type || file.name}`);
      }

      const parsed = this.parseExtractedText(rawText);
      // Extract contact and education
      const contact = this.extractContactInfo(parsed.text);
      const education = this.extractEducation(parsed.text, parsed.sections);

      const result: ExtractedText = {
        text: parsed.text,
        sections: parsed.sections,
        contact,
        education
      };

      return result;
    } catch (err: any) {
      console.error('extractTextFromFile error:', err);
      throw err;
    }
  }

  private isWordDocument(file: File) {
    const name = (file.name || '').toLowerCase();
    return name.endsWith('.docx') || name.endsWith('.doc') ||
      file.type.includes('word') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  // ---------- PDF extraction with improved ordering and column detection ----------
  private async extractFromPDF(file: File): Promise<string> {
    if (!this.pdfjsLib) throw new Error('PDF.js not available');

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = this.pdfjsLib.getDocument({
      data: arrayBuffer,
      disableWorker: false,
      disableAutoFetch: true,
      disableStream: true
    });

    const pdf = await loadingTask.promise;
    const maxPages = Math.min(pdf.numPages || 1, 30); // limit pages
    const pageTexts: string[] = [];

    for (let i = 1; i <= maxPages; i++) {
      const pageText = await this.extractPageText(pdf, i);
      if (pageText && pageText.trim()) pageTexts.push(pageText);
    }

    return pageTexts.join('\n\n');
  }

  private async extractPageText(pdf: any, pageNum: number): Promise<string> {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent({ normalizeWhitespace: true });
      const items = (textContent.items || []).map((it: any) => {
        const t = it.transform || it.transformMatrix || [];
        const x = (t[4] !== undefined) ? t[4] : (it.x ?? 0);
        const y = (t[5] !== undefined) ? t[5] : (it.y ?? 0);
        return {
          str: (it.str || '').replace(/\u00A0/g, ' '),
          x: Number(x),
          y: Number(y),
          width: Number(it.width || 0)
        };
      }).filter((m: any) => m.str && m.str.trim());

      if (!items.length) return '';

      // Debugging helper (dev): enable to inspect coordinates for tuning
      // console.log('DEBUG mapped items:', items.slice(0,150).map(m=>({s:m.str,x:Math.round(m.x),y:Math.round(m.y)})));

      // 1) group into Y buckets (lines)
      const yTolerance = 4; // tweak as needed (increase if lines are split)
      const linesMap = new Map<number, any[]>();
      for (const it of items) {
        const bucket = Math.round(it.y / yTolerance) * yTolerance;
        const arr = linesMap.get(bucket) ?? [];
        arr.push(it);
        linesMap.set(bucket, arr);
      }

      const sortedBuckets = Array.from(linesMap.keys()).sort((a, b) => b - a);

      // 2) detect a column boundary if present
      const xs = Array.from(new Set(items.map((i: any) => Math.round(i.x)))).sort((a: any, b: any) => (a as number) - (b as number)) as number[];
      let columnBoundary: number | null = null;
      if (xs.length > 4) {
        const gaps = xs.slice(1).map((v: number, i: number) => ({ gap: v - xs[i], mid: (v + xs[i]) / 2 }));
        const largest = gaps.reduce((p, c) => c.gap > p.gap ? c : p, { gap: 0, mid: 0 });
        const totalWidth = xs[xs.length - 1] - xs[0];
        if (largest.gap > Math.max(40, totalWidth / 5)) {
          columnBoundary = Math.round(largest.mid);
        }
      }

      // 3) assemble lines, keeping left then right (if column detected)
      const assembledLines: string[] = [];
      for (const bucket of sortedBuckets) {
        const rowItems = (linesMap.get(bucket) || []).slice();
        if (!rowItems.length) continue;
        rowItems.sort((a, b) => a.x - b.x);

        const joinRow = (arr: any[]) => {
          if (!arr.length) return '';
          arr.sort((a: any, b: any) => a.x - b.x);
          let out = '';
          let lastEnd = -Infinity;
          for (const it of arr) {
            if (!out) {
              out = it.str;
              lastEnd = it.x + (it.width || 0);
            } else {
              const gap = it.x - lastEnd;
              if (gap <= 10) out += it.str;
              else out += ' ' + it.str;
              lastEnd = it.x + (it.width || 0);
            }
          }
          return out.replace(/\s+/g, ' ').trim();
        };

        if (columnBoundary == null) {
          const line = joinRow(rowItems);
          if (line) assembledLines.push(line);
        } else {
          const left = rowItems.filter((it: any) => it.x <= columnBoundary);
          const right = rowItems.filter((it: any) => it.x > columnBoundary);
          const leftText = joinRow(left);
          const rightText = joinRow(right);
          if (leftText) assembledLines.push(leftText);
          if (rightText) assembledLines.push(rightText);
        }
      }

      // cleanup: remove separators and duplicate neighbor lines
      const cleaned = assembledLines
        .map(l => l.replace(/^[\s\-\u2014_]{2,}$/g, '').trim())
        .filter((l, idx, arr) => l && (idx === 0 || l !== arr[idx - 1]))
        .join('\n');

      return cleaned;
    } catch (err) {
      console.warn(`extractPageText error page ${pageNum}:`, err);
      return '';
    }
  }

  // ---------- DOCX extraction ----------
  private async extractFromDOC(file: File): Promise<string> {
    if (!this.mammoth) throw new Error('Mammoth not available for .docx extraction');
    const arrayBuffer = await file.arrayBuffer();
    const result = await this.mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  }

  // ---------- Parsing ----------
  private parseExtractedText(text: string): { text: string, sections: { [k: string]: string } } {
    if (!text || !text.trim()) return { text: '', sections: {} };

    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Split by newlines but keep short lines (headers are often short)
    const rawLines = normalizedText.split('\n').map(l => l.trim());
    // Remove repeated blank lines and trim separators
    const lines: string[] = [];
    for (const l of rawLines) {
      if (!l) {
        if (lines.length && lines[lines.length - 1] !== '') lines.push('');
      } else if (/^[\-\u2014_]{2,}$/.test(l)) {
        // treat lines of dashes as separators -> add blank
        if (lines.length && lines[lines.length - 1] !== '') lines.push('');
      } else {
        lines.push(l);
      }
    }

    // Section detection: iterate lines and consider headers
    const sections: { [k: string]: string } = {};
    let currentKey = 'general';
    let buffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        // blank => end current paragraph but don't end section
        if (buffer.length) {
          const content = buffer.join(' ').trim();
          if (!sections[currentKey]) sections[currentKey] = content;
          else sections[currentKey] += '\n' + content;
          buffer = [];
        }
        continue;
      }

      if (this.isSectionHeader(line)) {
        // commit previous buffer
        if (buffer.length) {
          const content = buffer.join(' ').trim();
          if (!sections[currentKey]) sections[currentKey] = content;
          else sections[currentKey] += '\n' + content;
          buffer = [];
        }
        // new section key
        const key = this.getSectionKey(line);
        currentKey = key;
        // If next line is short underline, skip it
        if (i + 1 < lines.length && /^[\-\u2014_]{2,}$/.test(lines[i + 1])) {
          i++;
        }
        continue;
      }

      buffer.push(line);
    }

    if (buffer.length) {
      const content = buffer.join(' ').trim();
      if (!sections[currentKey]) sections[currentKey] = content;
      else sections[currentKey] += '\n' + content;
    }

    return { text: normalizedText, sections };
  }

  private isSectionHeader(line: string): boolean {
    if (!line || line.length > 120) return false;
    const trimmed = line.trim();

    // All caps short lines are likely headings
    const isAllCaps = /[A-Z]/.test(trimmed) && (trimmed === trimmed.toUpperCase()) && trimmed.length <= 40;
    if (isAllCaps) return true;

    const lower = trimmed.toLowerCase();
    const keywords = ['summary','profile','about','experience','education','skills','projects','certificates','technical skills','core competencies','contact','contact info','key projects','achievements','work experience'];
    if (keywords.some(k => lower.startsWith(k) || lower === k || lower.includes(k))) return true;

    // Title case short (1-4 words): possible header "Key Projects"
    if (/^([A-Z][a-z]+(\s|$)){1,4}$/.test(trimmed)) return true;

    // ends with colon
    if (trimmed.endsWith(':')) return true;

    return false;
  }

  private getSectionKey(header: string): string {
    const lower = header.toLowerCase();
    if (lower.includes('summary') || lower.includes('profile') || lower.includes('about')) return 'summary';
    if (lower.includes('experience') || lower.includes('work')) return 'experience';
    if (lower.includes('education') || lower.includes('university') || lower.includes('school') || lower.includes('college')) return 'education';
    if (lower.includes('skill')) return 'skills';
    if (lower.includes('project')) return 'projects';
    if (lower.includes('certificate') || lower.includes('certification')) return 'certificates';
    if (lower.includes('contact')) return 'contact';
    return lower.replace(/\s+/g, '_').slice(0, 40) || 'general';
  }

  // ---------- Contact extraction ----------
  extractContactInfo(text: string): { name?: string; email?: string; phone?: string; location?: string; title?: string } {
    const res: any = {};
    if (!text) return res;

    // EMAIL
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) res.email = emailMatch[0];

    // PHONE - several patterns
    const phoneRegexes = [
      /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
      /(?:\+?\d[\d\-\s().]{7,}\d)/g
    ];
    for (const r of phoneRegexes) {
      const m = text.match(r);
      if (m && m.length) {
        // pick first reasonably short one
        const candidate = m.find((s: string) => s.replace(/[^\d]/g, '').length >= 6 && s.replace(/[^\d]/g, '').length <= 15);
        if (candidate) {
          res.phone = candidate.trim();
          break;
        } else {
          res.phone = m[0].trim();
          break;
        }
      }
    }

    // NAME: attempt from top lines - choose first line that looks like a name
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < Math.min(6, lines.length); i++) {
      const l = lines[i];
      if (this.looksLikeName(l)) {
        res.name = l;
        break;
      }
    }

    // LOCATION: look for "City, State" patterns or words like "Address" nearby
    const locRegex1 = /([A-Za-z\s]{2,50},\s*[A-Za-z]{2,50})(?:\s+\d{5})?/;
    const locMatch1 = text.match(locRegex1);
    if (locMatch1) res.location = locMatch1[1].trim();

    const addressMarker = text.match(/(?:address|location|city):\s*([^\n]+)/i);
    if (addressMarker && addressMarker[1]) res.location = addressMarker[1].trim();

    return res;
  }

  private looksLikeName(line: string): boolean {
    if (!line) return false;
    if (line.length < 3 || line.length > 50) return false;
    if (line.includes('@') || line.includes('http') || /\d/.test(line)) return false;
    // must have 2 words, each start with capital letter
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 5) return false;
    return words.every(w => /^[A-Z][a-zA-Z.'-]{1,}$/.test(w));
  }

  // ---------- Education extraction ----------
  private extractEducation(fullText: string, sections: { [k: string]: string }): string | undefined {
    // prefer 'education' section
    if (sections && sections.education) return sections.education;

    // fallback: try to find degree lines in text
    const degreeKeywords = ['bachelor', 'b.tech', 'b.sc', 'b.e', 'm.tech', 'master', 'msc', 'mba', 'phd', 'bachelor of', 'master of', 'degree', 'college', 'university'];
    const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
    const matches: string[] = [];
    for (const l of lines) {
      const lower = l.toLowerCase();
      if (degreeKeywords.some(k => lower.includes(k))) {
        matches.push(l);
      }
    }
    if (matches.length) return matches.slice(0, 6).join('\n');

    return undefined;
  }
}

// global window typing
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const fileExtractionService = new FileExtractionService();
export default fileExtractionService;
