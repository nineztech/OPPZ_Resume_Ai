import React, { useState, useRef, useEffect } from 'react';

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
  '#ffffff', '#0f766e', '#0d9488', '#14b8a6', '#0f766e', '#64748b', '#3b82f6', '#2563eb', '#1d4ed8', '#3b82f6', '#93c5fd', '#1e40af', '#7c3aed', '#a21caf', '#ec4899', '#f97316', '#000000', 'multi'
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Helper functions for color conversion
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
              ? 'bg-gray-200 text-black border-2 border-black'
              : 'bg-gray-200 text-gray-600 border-2 border-transparent hover:bg-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-sm mr-1"></div>
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
        <div className="mb-6 relative">
          <div className="flex flex-wrap gap-2 justify-left">
            {predefinedColors.map((color, index) => {
              if (color === 'multi') {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!showColorPicker) {
                        // Initialize color picker with current accent color
                        const currentAccentColor = customization.theme.accentColor;
                        if (currentAccentColor && currentAccentColor !== 'transparent') {
                          const hsl = hexToHsl(currentAccentColor);
                          setHue(hsl.h);
                          setSaturation(hsl.s);
                          setLightness(hsl.l);
                          setCurrentColor(currentAccentColor);
                        }
                      }
                      setShowColorPicker(!showColorPicker);
                      setSelectedColorIndex(index);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      showColorPicker && selectedColorIndex === index
                        ? 'border-gray-800 scale-110 shadow-md ring-2 ring-gray-300'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    title="Color picker"
                  >
                    <div className="w-full h-full rounded-full" style={{
                      background: 'conic-gradient(from 0deg, red 0deg, orange 60deg, yellow 120deg, green 180deg, blue 240deg, indigo 300deg, violet 360deg)'
                    }}></div>
                  </button>
                );
              } else {
                return (
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
                );
              }
            })}
          </div>
          
          {/* Color Picker Dropdown */}
          {showColorPicker && (
            <div 
              ref={colorPickerRef}
              className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
              style={{ 
                left: '50%', 
                transform: 'translateX(-50%)',
                top: '100%'
              }}
            >
              <div className="w-64">
                {/* Color Spectrum Square */}
                <div className="mb-3">
                  <div className="w-full h-32 rounded border border-gray-300 cursor-pointer relative overflow-hidden"
                       style={{
                         background: `linear-gradient(to bottom, transparent 0%, black 100%), linear-gradient(to right, hsl(${hue}, 100%, 50%) 0%, hsl(${hue}, 100%, 50%) 100%)`
                       }}
                       onMouseDown={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const updateColor = (clientX: number, clientY: number) => {
                           const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
                           const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
                           const newSaturation = Math.round((x / rect.width) * 100);
                           const newLightness = Math.round(100 - (y / rect.height) * 100);
                           setSaturation(newSaturation);
                           setLightness(newLightness);
                           const hexColor = hslToHex(hue, newSaturation, newLightness);
                           setCurrentColor(hexColor);
                           updateCustomization({
                             theme: { ...customization.theme, accentColor: hexColor }
                           });
                         };
                         
                         updateColor(e.clientX, e.clientY);
                         
                         const handleMouseMove = (moveEvent: MouseEvent) => {
                           updateColor(moveEvent.clientX, moveEvent.clientY);
                         };
                         
                         const handleMouseUp = () => {
                           document.removeEventListener('mousemove', handleMouseMove);
                           document.removeEventListener('mouseup', handleMouseUp);
                         };
                         
                         document.addEventListener('mousemove', handleMouseMove);
                         document.addEventListener('mouseup', handleMouseUp);
                       }}>
                    {/* Color picker handle */}
                    <div 
                      className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
                      style={{
                        left: `${saturation}%`,
                        top: `${100 - lightness}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Hue Slider */}
                <div className="mb-3">
                  <div className="w-full h-4 rounded border border-gray-300 cursor-pointer relative"
                       style={{
                         background: 'linear-gradient(to right, red 0%, yellow 16.66%, lime 33.33%, cyan 50%, blue 66.66%, magenta 83.33%, red 100%)'
                       }}
                       onMouseDown={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const updateHue = (clientX: number) => {
                           const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
                           const newHue = Math.round((x / rect.width) * 360);
                           setHue(newHue);
                           const hexColor = hslToHex(newHue, saturation, lightness);
                           setCurrentColor(hexColor);
                           updateCustomization({
                             theme: { ...customization.theme, accentColor: hexColor }
                           });
                         };
                         
                         updateHue(e.clientX);
                         
                         const handleMouseMove = (moveEvent: MouseEvent) => {
                           updateHue(moveEvent.clientX);
                         };
                         
                         const handleMouseUp = () => {
                           document.removeEventListener('mousemove', handleMouseMove);
                           document.removeEventListener('mouseup', handleMouseUp);
                         };
                         
                         document.addEventListener('mousemove', handleMouseMove);
                         document.addEventListener('mouseup', handleMouseUp);
                       }}>
                    {/* Hue slider handle */}
                    <div 
                      className="absolute w-2 h-4 border border-white rounded shadow-md pointer-events-none"
                      style={{
                        left: `${(hue / 360) * 100}%`,
                        top: '0',
                        transform: 'translateX(-50%)'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Hex Input */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={currentColor}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                        setCurrentColor(value);
                        const hsl = hexToHsl(value);
                        setHue(hsl.h);
                        setSaturation(hsl.s);
                        setLightness(hsl.l);
                        updateCustomization({
                          theme: { ...customization.theme, accentColor: value }
                        });
                      }
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">HEX</div>
                </div>
              </div>
            </div>
          )}
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

