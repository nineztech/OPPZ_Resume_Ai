import React, { useState } from 'react';

// Helper function to get fonts by category
const getFontsForCategory = (category: 'serif' | 'sans' | 'mono') => {
  const fonts = {
    serif: [
      { name: 'Georgia', value: 'Georgia, Times New Roman, serif' },
      { name: 'Times New Roman', value: 'Times New Roman, Georgia, serif' },
      { name: 'Playfair Display', value: 'Playfair Display, Georgia, serif' },
      { name: 'Merriweather', value: 'Merriweather, Georgia, serif' },
      { name: 'Crimson Text', value: 'Crimson Text, Georgia, serif' },
      { name: 'Libre Baskerville', value: 'Libre Baskerville, Georgia, serif' },
      { name: 'Lora', value: 'Lora, Georgia, serif' },
      { name: 'PT Serif', value: 'PT Serif, Georgia, serif' },
      { name: 'Source Serif Pro', value: 'Source Serif Pro, Georgia, serif' },
      { name: 'EB Garamond', value: 'EB Garamond, Georgia, serif' },
      { name: 'Cormorant Garamond', value: 'Cormorant Garamond, Georgia, serif' },
      { name: 'Alegreya', value: 'Alegreya, Georgia, serif' }
    ],
    sans: [
      { name: 'Source Sans Pro', value: 'Source Sans Pro, Arial, sans-serif' },
      { name: 'Lato', value: 'Lato, Arial, sans-serif' },
      { name: 'Barlow', value: 'Barlow, Arial, sans-serif' },
      { name: 'Roboto', value: 'Roboto, Arial, sans-serif' },
      { name: 'Nunito', value: 'Nunito Sans, Arial, sans-serif' },
      { name: 'Karla', value: 'Karla, Arial, sans-serif' },
      { name: 'Titillium Web', value: 'Titillium Web, Arial, sans-serif' },
      { name: 'Jost', value: 'Jost, Arial, sans-serif' },
      { name: 'Rubik', value: 'Rubik, Arial, sans-serif' },
      { name: 'Open Sans', value: 'Open Sans, Arial, sans-serif' },
      { name: 'Mulish', value: 'Mulish, Arial, sans-serif' },
      { name: 'Work Sans', value: 'Work Sans, Arial, sans-serif' },
      { name: 'Fira Sans', value: 'Fira Sans, Arial, sans-serif' },
      { name: 'Asap', value: 'Asap, Arial, sans-serif' },
      { name: 'Inter', value: 'Inter, Arial, sans-serif' },
      { name: 'Montserrat', value: 'Montserrat, Arial, sans-serif' },
      { name: 'Poppins', value: 'Poppins, Arial, sans-serif' },
      { name: 'Arial', value: 'Arial, Helvetica, Calibri, sans-serif' },
      { name: 'Calibri', value: 'Calibri, Arial, sans-serif' }
    ],
    mono: [
      { name: 'Fira Code', value: 'Fira Code, Monaco, monospace' },
      { name: 'Source Code Pro', value: 'Source Code Pro, Monaco, monospace' },
      { name: 'JetBrains Mono', value: 'JetBrains Mono, Monaco, monospace' },
      { name: 'Cascadia Code', value: 'Cascadia Code, Monaco, monospace' },
      { name: 'Monaco', value: 'Monaco, Consolas, monospace' },
      { name: 'Consolas', value: 'Consolas, Monaco, monospace' },
      { name: 'Courier New', value: 'Courier New, monospace' },
      { name: 'Roboto Mono', value: 'Roboto Mono, Monaco, monospace' },
      { name: 'Space Mono', value: 'Space Mono, Monaco, monospace' },
      { name: 'IBM Plex Mono', value: 'IBM Plex Mono, Monaco, monospace' },
      { name: 'Inconsolata', value: 'Inconsolata, Monaco, monospace' },
      { name: 'Ubuntu Mono', value: 'Ubuntu Mono, Monaco, monospace' }
    ]
  };
  return fonts[category] || [];
};

interface TypographyCustomizationPanelProps {
  customization: {
    theme: any;
    colorMode?: string;
    accentType?: string;
    selectedPalette?: string | null;
    applyAccentTo?: any;
    typography: {
      fontFamily: {
        header: string;
        body: string;
        name: string;
      };
      fontSize: {
        name: number;
        title: number;
        headers: number;
        body: number;
        subheader: number;
      };
      fontWeight: {
        name: number;
        headers: number;
        body: number;
      };
    };
    layout: any;
  };
  updateCustomization: (updates: any) => void;
}

const TypographyCustomizationPanel: React.FC<TypographyCustomizationPanelProps> = ({
  customization,
  updateCustomization
}) => {
  // Font category state
  const [fontCategory, setFontCategory] = useState<'serif' | 'sans' | 'mono'>('sans');

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Typography</h4>
      <div className="space-y-3">
        {/* Font Categories */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Font Category</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setFontCategory('serif')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                fontCategory === 'serif'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Aa Serif
            </button>
            <button
              onClick={() => setFontCategory('sans')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                fontCategory === 'sans'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Aa Sans
            </button>
            <button
              onClick={() => setFontCategory('mono')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                fontCategory === 'mono'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Aa Mono
            </button>
          </div>
        </div>

        {/* Font Selection Grid */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Select Font</label>
          <div className="grid grid-cols-3 gap-2">
            {getFontsForCategory(fontCategory).map((font) => (
              <button
                key={font.value}
                onClick={() => updateCustomization({
                  typography: {
                    ...customization.typography,
                    fontFamily: {
                      ...customization.typography.fontFamily,
                      name: font.value,
                      header: font.value,
                      body: font.value
                    }
                  }
                })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  customization.typography.fontFamily.name === font.value
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Font Size - Headers ({customization.typography.fontSize.headers}px)</label>
          <input
            type="range"
            min="10"
            max="18"
            value={customization.typography.fontSize.headers}
            onChange={(e) => updateCustomization({
              typography: { 
                ...customization.typography, 
                fontSize: { ...customization.typography.fontSize, headers: parseInt(e.target.value) }
              }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Font Size - Body ({customization.typography.fontSize.body}px)</label>
          <input
            type="range"
            min="8"
            max="14"
            value={customization.typography.fontSize.body}
            onChange={(e) => updateCustomization({
              typography: { 
                ...customization.typography, 
                fontSize: { ...customization.typography.fontSize, body: parseInt(e.target.value) }
              }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Font Size - Subheader ({customization.typography.fontSize.subheader}px)</label>
          <input
            type="range"
            min="8"
            max="14"
            value={customization.typography.fontSize.subheader}
            onChange={(e) => updateCustomization({
              typography: { 
                ...customization.typography, 
                fontSize: { ...customization.typography.fontSize, subheader: parseInt(e.target.value) }
              }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Font Weight - Headers</label>
          <select
            value={customization.typography.fontWeight.headers}
            onChange={(e) => updateCustomization({
              typography: { ...customization.typography, fontWeight: { ...customization.typography.fontWeight, headers: parseInt(e.target.value) } }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TypographyCustomizationPanel;

