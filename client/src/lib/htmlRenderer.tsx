import React from 'react';

// Utility function to safely render HTML content with AI highlights
export const renderHtmlContent = (content: string): React.ReactNode => {
  if (!content) return content;
  
  // Check if content contains HTML tags
  if (!content.includes('<span')) {
    return content;
  }
  
  // Parse HTML and convert to React elements
  const parseHtml = (html: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Regular expression to match span tags with AI highlight classes
    const spanRegex = /<span\s+class="(ai-highlight-(?:added|modified))"[^>]*>(.*?)<\/span>/g;
    let match;
    
    while ((match = spanRegex.exec(html)) !== null) {
      // Add text before the span
      if (match.index > currentIndex) {
        const beforeText = html.slice(currentIndex, match.index);
        if (beforeText) {
          parts.push(beforeText);
        }
      }
      
      // Add the highlighted span
      const highlightClass = match[1];
      const spanContent = match[2];
      
      parts.push(
        <span 
          key={`highlight-${match.index}`}
          className={highlightClass}
          style={{
            backgroundColor: highlightClass === 'ai-highlight-added' ? '#dcfce7' : '#dbeafe',
            color: highlightClass === 'ai-highlight-added' ? '#166534' : '#1e40af',
            padding: '2px 4px',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'inline'
          }}
        >
          {spanContent}
        </span>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last span
    if (currentIndex < html.length) {
      const remainingText = html.slice(currentIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }
    
    return parts;
  };
  
  return parseHtml(content);
};

// Alternative simpler approach using dangerouslySetInnerHTML (use with caution)
export const renderHtmlContentUnsafe = (content: string): React.ReactNode => {
  if (!content) return content;
  
  // Check if content contains HTML tags
  if (!content.includes('<span')) {
    return content;
  }
  
  return (
    <span 
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Ensure highlighting styles are applied
        '--ai-highlight-added-bg': '#dcfce7',
        '--ai-highlight-added-color': '#166534',
        '--ai-highlight-modified-bg': '#dbeafe',
        '--ai-highlight-modified-color': '#1e40af'
      } as React.CSSProperties}
    />
  );
};
