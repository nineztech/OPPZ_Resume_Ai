import React from 'react';
import { Button } from '@/components/ui/button';

interface SectionHeadingsPanelProps {
  sectionHeadings: {
    style: 'left-align-underline' | 'center-align-underline' | 'center-align-no-line' | 'box-style' | 'double-line' | 'left-extended' | 'wavy-line';
    alignment: 'left' | 'center' | 'right';
    showUnderline: boolean;
    underlineStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
    underlineColor: string;
  };
  updateSectionHeadings: (updates: any) => void;
}

const SectionHeadingsPanel: React.FC<SectionHeadingsPanelProps> = ({
  sectionHeadings,
  updateSectionHeadings
}) => {
  const headingStyles = [
    {
      id: 'left-align-underline',
      name: 'Left Align with Underline',
      preview: (
        <div className="flex flex-col items-start space-y-1">
          <div className="w-8 h-1 bg-gray-400 rounded"></div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
        </div>
      )
    },
    {
      id: 'center-align-underline',
      name: 'Center Align with Underline',
      preview: (
        <div className="flex flex-col items-center space-y-1">
          <div className="w-8 h-1 bg-gray-400 rounded"></div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
        </div>
      )
    },
    {
      id: 'center-align-no-line',
      name: 'Center Align No Line',
      preview: (
        <div className="flex flex-col items-center">
          <div className="w-8 h-1 bg-gray-400 rounded"></div>
        </div>
      )
    },
    {
      id: 'box-style',
      name: 'Box Style',
      preview: (
        <div className="bg-gray-200 rounded p-1">
          <div className="w-6 h-1 bg-gray-600 rounded"></div>
        </div>
      )
    },
    {
      id: 'double-line',
      name: 'Double Line',
      preview: (
        <div className="flex flex-col items-center space-y-1">
          <div className="w-10 h-0.5 bg-gray-300"></div>
          <div className="w-6 h-1 bg-gray-400 rounded"></div>
          <div className="w-10 h-0.5 bg-gray-300"></div>
        </div>
      )
    },
    {
      id: 'left-extended',
      name: 'Left Extended',
      preview: (
        <div className="flex items-center space-x-1">
          <div className="w-4 h-1 bg-gray-400 rounded"></div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
        </div>
      )
    },
    {
      id: 'wavy-line',
      name: 'Straight Line',
      preview: (
        <div className="flex flex-col items-center space-y-1">
          <div className="w-8 h-1 bg-gray-400 rounded"></div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
        </div>
      )
    }
  ];

  const handleStyleChange = (style: string) => {
    const updates: any = { style };
    
    // Set alignment and underline based on style
    switch (style) {
      case 'left-align-underline':
        updates.alignment = 'left';
        updates.showUnderline = true;
        updates.underlineStyle = 'solid';
        break;
      case 'center-align-underline':
        updates.alignment = 'center';
        updates.showUnderline = true;
        updates.underlineStyle = 'solid';
        break;
      case 'center-align-no-line':
        updates.alignment = 'center';
        updates.showUnderline = false;
        break;
      case 'box-style':
        updates.alignment = 'left';
        updates.showUnderline = false;
        break;
      case 'double-line':
        updates.alignment = 'center';
        updates.showUnderline = true;
        updates.underlineStyle = 'double';
        break;
      case 'left-extended':
        updates.alignment = 'left';
        updates.showUnderline = true;
        updates.underlineStyle = 'solid';
        break;
      case 'wavy-line':
        updates.alignment = 'center';
        updates.showUnderline = true;
        updates.underlineStyle = 'wavy';
        break;
    }
    
    updateSectionHeadings(updates);
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Section Headings</h4>
      
      {/* Style Selection */}
      <div className="mb-4">
        <h5 className="text-xs font-medium text-gray-600 mb-2">Style</h5>
        <div className="grid grid-cols-2 gap-2">
          {headingStyles.map((style) => (
            <Button
              key={style.id}
              variant={sectionHeadings.style === style.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleStyleChange(style.id)}
              className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                sectionHeadings.style === style.id 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {style.preview}
              <span className="text-xs text-center leading-tight">{style.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Alignment Options */}
      {(sectionHeadings.style === 'box-style' || sectionHeadings.style === 'double-line') && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-600 mb-2">Alignment</h5>
          <div className="flex space-x-2">
            {['left', 'center', 'right'].map((align) => (
              <Button
                key={align}
                variant={sectionHeadings.alignment === align ? "default" : "outline"}
                size="sm"
                onClick={() => updateSectionHeadings({ alignment: align })}
                className={`capitalize ${
                  sectionHeadings.alignment === align 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : ''
                }`}
              >
                {align}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Underline Options */}
      {sectionHeadings.showUnderline && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-600 mb-2">Underline Style</h5>
          <div className="flex space-x-2">
            {['solid', 'dashed', 'dotted', 'double', 'wavy'].map((style) => (
              <Button
                key={style}
                variant={sectionHeadings.underlineStyle === style ? "default" : "outline"}
                size="sm"
                onClick={() => updateSectionHeadings({ underlineStyle: style })}
                className={`capitalize ${
                  sectionHeadings.underlineStyle === style 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : ''
                }`}
              >
                {style}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Underline Color */}
      {sectionHeadings.showUnderline && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-600 mb-2">Underline Color</h5>
          <div className="flex space-x-2">
            {['#000000', '#6B7280', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'].map((color) => (
              <button
                key={color}
                onClick={() => updateSectionHeadings({ underlineColor: color })}
                className={`w-8 h-8 rounded border-2 ${
                  sectionHeadings.underlineColor === color ? 'border-purple-600' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionHeadingsPanel;
