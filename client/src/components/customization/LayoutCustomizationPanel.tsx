import React from 'react';

interface LayoutCustomizationPanelProps {
  customization: {
    theme: any;
    colorMode?: string;
    accentType?: string;
    selectedPalette?: string | null;
    applyAccentTo?: any;
    typography: any;
    layout: {
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
      sectionSpacing: number;
      lineHeight: number;
    };
  };
  updateCustomization: (updates: any) => void;
}

const LayoutCustomizationPanel: React.FC<LayoutCustomizationPanelProps> = ({
  customization,
  updateCustomization
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Layout & Spacing</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Line Height ({customization.layout.lineHeight})</label>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={customization.layout.lineHeight}
            onChange={(e) => updateCustomization({
              layout: { ...customization.layout, lineHeight: parseFloat(e.target.value) }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Section Spacing ({customization.layout.sectionSpacing}px)</label>
          <input
            type="range"
            min="0"
            max="32"
            value={customization.layout.sectionSpacing}
            onChange={(e) => updateCustomization({
              layout: { ...customization.layout, sectionSpacing: parseInt(e.target.value) }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Top Margin ({customization.layout.margins.top}px)</label>
          <input
            type="range"
            min="0"
            max="40"
            value={customization.layout.margins.top}
            onChange={(e) => updateCustomization({
              layout: { 
                ...customization.layout, 
                margins: { ...customization.layout.margins, top: parseInt(e.target.value) }
              }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Bottom Margin ({customization.layout.margins.bottom}px)</label>
          <input
            type="range"
            min="0"
            max="40"
            value={customization.layout.margins.bottom}
            onChange={(e) => updateCustomization({
              layout: { 
                ...customization.layout, 
                margins: { ...customization.layout.margins, bottom: parseInt(e.target.value) }
              }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Left Margin ({customization.layout.margins.left}px)</label>
          <input
            type="range"
            min="0"
            max="40"
            value={customization.layout.margins.left}
            onChange={(e) => updateCustomization({
              layout: { 
                ...customization.layout, 
                margins: { ...customization.layout.margins, left: parseInt(e.target.value) }
              }
            })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Right Margin ({customization.layout.margins.right}px)</label>
          <input
            type="range"
            min="0"
            max="40"
            value={customization.layout.margins.right}
            onChange={(e) => updateCustomization({
              layout: { 
                ...customization.layout, 
                margins: { ...customization.layout.margins, right: parseInt(e.target.value) }
              }
            })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default LayoutCustomizationPanel;

