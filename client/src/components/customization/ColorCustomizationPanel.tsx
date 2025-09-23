import React from 'react';

// Color palette data for FlowCV-style customization
const colorPalettes = [
  { name: 'Dark Blue & Red', text: '#1e3a8a', accent: '#dc2626' },
  { name: 'White & Light Green', text: '#ffffff', accent: '#22c55e' },
  { name: 'Dark Teal & White', text: '#0f766e', accent: '#ffffff' },
  { name: 'White & Brown', text: '#ffffff', accent: '#92400e' },
  { name: 'White & Gray', text: '#ffffff', accent: '#6b7280' },
  { name: 'Dark Blue & Light Blue', text: '#1e3a8a', accent: '#3b82f6' },
  { name: 'Light Brown & Light Blue', text: '#d97706', accent: '#3b82f6' },
  { name: 'Dark Purple & Light Purple', text: '#7c3aed', accent: '#a855f7' },
];

const predefinedColors = [
  '#ffffff', '#0f766e', '#0d9488', '#14b8a6', '#0f766e', '#64748b', '#3b82f6', '#2563eb', '#1d4ed8', '#3b82f6', '#93c5fd', '#1e40af', '#7c3aed', '#a21caf', '#ec4899', '#f97316', '#000000'
];

interface ColorCustomizationPanelProps {
  customization: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      textColor: string;
      backgroundColor: string;
      accentColor: string;
      borderColor: string;
      headerColor: string;
    };
    // FlowCV-style color customization
    colorMode?: 'basic' | 'advanced' | 'border';
    accentType?: 'accent' | 'multi' | 'image';
    selectedPalette?: string | null;
    applyAccentTo?: {
      name: boolean;
      headings: boolean;
      headerIcons: boolean;
      dotsBarsBubbles: boolean;
      dates: boolean;
      linkIcons: boolean;
    };
    typography: any;
    layout: any;
  };
  updateCustomization: (updates: any) => void;
}

const ColorCustomizationPanel: React.FC<ColorCustomizationPanelProps> = ({
  customization,
  updateCustomization
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Colors</h4>
      
      {/* Main Color Selection Options */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => updateCustomization({ colorMode: 'basic' })}
          className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
            customization.colorMode === 'basic'
              ? 'border-purple-500 bg-purple-100'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <div className={`w-full h-full rounded-full ${
            customization.colorMode === 'basic' ? 'bg-purple-500' : 'bg-gray-300'
          }`}></div>
        </button>
        <button
          onClick={() => updateCustomization({ colorMode: 'advanced' })}
          className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
            customization.colorMode === 'advanced'
              ? 'border-purple-500'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className={`w-full h-full rounded-full ${
            customization.colorMode === 'advanced' 
              ? 'bg-gradient-to-b from-purple-500 to-purple-300' 
              : 'bg-gradient-to-b from-gray-300 to-white'
          }`}></div>
        </button>
        <button
          onClick={() => updateCustomization({ colorMode: 'border' })}
          className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
            customization.colorMode === 'border'
              ? 'border-purple-500 bg-transparent'
              : 'border-gray-300 bg-transparent hover:border-gray-400'
          }`}
        ></button>
      </div>
      <div className="flex justify-center gap-4 mb-6 text-xs">
        <span className={customization.colorMode === 'basic' ? 'text-purple-600 font-medium' : 'text-gray-500'}>Basic</span>
        <span className={customization.colorMode === 'advanced' ? 'text-purple-600 font-medium' : 'text-gray-500'}>Advanced</span>
        <span className={customization.colorMode === 'border' ? 'text-purple-600 font-medium' : 'text-gray-500'}>Border</span>
      </div>

      {/* Accent Type Selection Options */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => updateCustomization({ accentType: 'accent' })}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            customization.accentType === 'accent'
              ? 'bg-black text-white border-2 border-black'
              : 'bg-gray-200 text-gray-600 border-2 border-transparent hover:bg-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm mr-1"></div>
            <span>Accent</span>
          </div>
        </button>
        <button
          onClick={() => updateCustomization({ accentType: 'multi' })}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            customization.accentType === 'multi'
              ? 'bg-white text-black border-2 border-black'
              : 'bg-gray-200 text-gray-600 border-2 border-transparent hover:bg-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <div className="flex flex-col">
              <div className="w-3 h-2 bg-blue-600 mb-0.5"></div>
              <div className="w-3 h-0.5 bg-red-500"></div>
            </div>
            <span className="ml-1">Multi</span>
          </div>
        </button>
        <button
          onClick={() => updateCustomization({ accentType: 'image' })}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            customization.accentType === 'image'
              ? 'bg-white text-black border-2 border-black'
              : 'bg-gray-200 text-gray-600 border-2 border-transparent hover:bg-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-300 rounded-sm mr-1" style={{
              backgroundImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
              backgroundSize: '8px 8px'
            }}></div>
            <span>Image</span>
          </div>
        </button>
      </div>

      {/* Color Palettes for Multi accent mode */}
      {customization.accentType === 'multi' && (
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {colorPalettes.map((palette, index) => (
              <button
                key={index}
                onClick={() => updateCustomization({ 
                  selectedPalette: palette.name,
                  theme: {
                    ...customization.theme,
                    textColor: palette.text,
                    accentColor: palette.accent
                  }
                })}
                className={`p-2 rounded border transition-all duration-200 ${
                  customization.selectedPalette === palette.name
                    ? 'border-black border-2'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-6 h-3 mb-1 rounded-sm" style={{ backgroundColor: palette.text }}></div>
                  <div className="w-6 h-0.5 rounded-sm" style={{ backgroundColor: palette.accent }}></div>
                </div>
              </button>
            ))}
            <button
              onClick={() => updateCustomization({ selectedPalette: 'custom' })}
              className={`p-2 rounded border transition-all duration-200 ${
                customization.selectedPalette === 'custom'
                  ? 'border-black border-2'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-xs font-medium text-gray-700">Custom</div>
            </button>
          </div>
        </div>
      )}

      {/* Individual Color Pickers */}
      {customization.accentType === 'multi' && (
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Text</div>
              <input
                type="color"
                value={customization.theme.textColor}
                onChange={(e) => updateCustomization({
                  theme: { ...customization.theme, textColor: e.target.value }
                })}
                className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Background</div>
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer bg-white"
                onClick={() => {
                  const colorPicker = document.createElement('input');
                  colorPicker.type = 'color';
                  colorPicker.value = customization.theme.backgroundColor;
                  colorPicker.onchange = (e: any) => updateCustomization({
                    theme: { ...customization.theme, backgroundColor: e.target.value }
                  });
                  colorPicker.click();
                }}
              ></div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Accent</div>
              <input
                type="color"
                value={customization.theme.accentColor}
                onChange={(e) => updateCustomization({
                  theme: { ...customization.theme, accentColor: e.target.value }
                })}
                className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Predefined Color Palette */}
      {customization.accentType === 'accent' && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {predefinedColors.map((color, index) => (
              <button
                key={index}
                onClick={() => updateCustomization({
                  theme: { ...customization.theme, accentColor: color }
                })}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  customization.theme.accentColor === color
                    ? 'border-gray-800 scale-110 shadow-md ring-2 ring-gray-300'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Apply accent color section */}
      <div className="border-t pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Apply accent color</h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customization.applyAccentTo?.name || false}
                onChange={(e) => updateCustomization({
                  applyAccentTo: { ...customization.applyAccentTo, name: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-600">Name</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customization.applyAccentTo?.headings || false}
                onChange={(e) => updateCustomization({
                  applyAccentTo: { ...customization.applyAccentTo, headings: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-600">Headings</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customization.applyAccentTo?.headerIcons || false}
                onChange={(e) => updateCustomization({
                  applyAccentTo: { ...customization.applyAccentTo, headerIcons: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-600">Header icons</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customization.applyAccentTo?.dotsBarsBubbles || false}
                onChange={(e) => updateCustomization({
                  applyAccentTo: { ...customization.applyAccentTo, dotsBarsBubbles: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-600">Dots/Bars/Bubbles</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customization.applyAccentTo?.dates || false}
                onChange={(e) => updateCustomization({
                  applyAccentTo: { ...customization.applyAccentTo, dates: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-600">Dates</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={customization.applyAccentTo?.linkIcons || false}
                onChange={(e) => updateCustomization({
                  applyAccentTo: { ...customization.applyAccentTo, linkIcons: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-xs text-gray-600">Link icons</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorCustomizationPanel;

