import React from 'react';

interface EntryLayoutPanelProps {
  entryLayout: {
    layoutType: 'text-left-icons-right' | 'icons-left-text-right' | 'icons-text-icons' | 'two-lines';
    titleSize: 'small' | 'medium' | 'large';
    subtitleStyle: 'normal' | 'bold' | 'italic';
    subtitlePlacement: 'same-line' | 'next-line';
    indentBody: boolean;
    listStyle: 'bullet' | 'hyphen';
    descriptionFormat: 'paragraph' | 'points';
  };
  updateEntryLayout: (updates: any) => void;
}

const EntryLayoutPanel: React.FC<EntryLayoutPanelProps> = ({
  entryLayout,
  updateEntryLayout
}) => {
  // Entry Layout Preview Options
  const layoutOptions = [
    {
      id: 'text-left-icons-right',
      name: 'Text Left, Icons Right',
      preview: (
        <div className="flex items-center justify-between w-full p-2">
          <div className="flex-1">
            <div className="w-20 h-2 bg-gray-400 rounded mb-1"></div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 'icons-left-text-right',
      name: 'Icons Left, Text Right',
      preview: (
        <div className="flex items-center justify-between w-full p-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
          </div>
          <div className="flex-1 ml-2">
            <div className="w-20 h-2 bg-gray-400 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: 'icons-text-icons',
      name: 'Icons, Text, Icons',
      preview: (
        <div className="flex items-center justify-between w-full p-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <div className="flex-1 mx-2">
            <div className="w-16 h-2 bg-gray-400 rounded"></div>
          </div>
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
        </div>
      )
    },
    {
      id: 'two-lines',
      name: 'Two Lines',
      preview: (
        <div className="w-full p-2">
          <div className="w-24 h-2 bg-gray-400 rounded mb-1"></div>
          <div className="w-20 h-2 bg-gray-400 rounded"></div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Entry Layout</h4>
      
      {/* Entry Layout Preview Options */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          {layoutOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateEntryLayout({ layoutType: option.id })}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                entryLayout.layoutType === option.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option.preview}
            </button>
          ))}
        </div>
      </div>

      {/* Title & Subtitle Size */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Title & subtitle size</label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateEntryLayout({ titleSize: size })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                entryLayout.titleSize === size
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Style */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Subtitle style</label>
        <div className="flex gap-2">
          {(['normal', 'bold', 'italic'] as const).map((style) => (
            <button
              key={style}
              onClick={() => updateEntryLayout({ subtitleStyle: style })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                entryLayout.subtitleStyle === style
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                fontWeight: style === 'bold' ? 'bold' : 'normal',
                fontStyle: style === 'italic' ? 'italic' : 'normal'
              }}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Placement */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Subtitle placement</label>
        <div className="flex gap-2">
          {(['same-line', 'next-line'] as const).map((placement) => (
            <button
              key={placement}
              onClick={() => updateEntryLayout({ subtitlePlacement: placement })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                entryLayout.subtitlePlacement === placement
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {placement === 'same-line' ? 'Try Same Line' : 'Next Line'}
            </button>
          ))}
        </div>
      </div>

      {/* Description Indentation */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Description indentation</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={entryLayout.indentBody}
            onChange={(e) => updateEntryLayout({ indentBody: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="ml-2 text-sm text-gray-700">Indent body</span>
        </div>
      </div>

      {/* List Style */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">List style</label>
        <div className="flex gap-2">
          {(['bullet', 'hyphen'] as const).map((style) => (
            <button
              key={style}
              onClick={() => updateEntryLayout({ listStyle: style })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                entryLayout.listStyle === style
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {style === 'bullet' ? '• Bullet' : '– Hyphen'}
            </button>
          ))}
        </div>
      </div>

      {/* Description Format */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Description</label>
        <div className="flex gap-2">
          {(['paragraph', 'points'] as const).map((format) => (
            <button
              key={format}
              onClick={() => updateEntryLayout({ descriptionFormat: format })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                entryLayout.descriptionFormat === format
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {format === 'paragraph' ? 'Paragraph' : 'Points'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntryLayoutPanel;
