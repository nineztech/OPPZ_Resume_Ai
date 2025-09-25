import React from 'react';

interface ProfessionalTitleCustomizationPanelProps {
  titleCustomization: {
    size: 's' | 'm' | 'l';
    position: 'same-line' | 'below';
    style: 'normal' | 'italic';
    separationType: 'vertical-line' | 'bullet' | 'dash' | 'space';
  };
  updateTitleCustomization: (updates: any) => void;
}

const ProfessionalTitleCustomizationPanel: React.FC<ProfessionalTitleCustomizationPanelProps> = ({
  titleCustomization,
  updateTitleCustomization
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Professional title</h4>
      
      {/* Size Options */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Size</label>
        <div className="flex gap-2">
          {(['s', 'm', 'l'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateTitleCustomization({ size })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                titleCustomization.size === size
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Position Options */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Position</label>
        <div className="flex gap-2">
          {(['same-line', 'below'] as const).map((position) => (
            <button
              key={position}
              onClick={() => updateTitleCustomization({ position })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                titleCustomization.position === position
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {position === 'same-line' ? 'Try Same Line' : 'Below'}
            </button>
          ))}
        </div>
      </div>

      {/* Style Options */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Style</label>
        <div className="flex gap-2">
          {(['normal', 'italic'] as const).map((style) => (
            <button
              key={style}
              onClick={() => updateTitleCustomization({ style })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                titleCustomization.style === style
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                fontStyle: style === 'italic' ? 'italic' : 'normal'
              }}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Separation Type Options - Only show when "Try Same Line" is selected */}
      {titleCustomization.position === 'same-line' && (
        <div className="mb-4">
          <label className="block text-xs text-gray-600 mb-2">Separation</label>
          <div className="flex gap-2 flex-wrap">
            {([
              { type: 'vertical-line', label: '|' },
              { type: 'bullet', label: '•' },
              { type: 'dash', label: '—' },
              { type: 'space', label: 'Space' }
            ] as const).map(({ type, label }) => (
              <button
                key={type}
                onClick={() => updateTitleCustomization({ separationType: type })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  titleCustomization.separationType === type
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTitleCustomizationPanel;
