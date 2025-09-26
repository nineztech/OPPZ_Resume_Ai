import React from 'react';

interface NameCustomizationPanelProps {
  nameCustomization: {
    size: 'xs' | 's' | 'm' | 'l' | 'xl';
    bold: boolean;
    font: 'body' | 'creative';
    fontWeight?: number;
    fontSize?: number;
  };
  updateNameCustomization: (updates: any) => void;
}

const NameCustomizationPanel: React.FC<NameCustomizationPanelProps> = ({
  nameCustomization,
  updateNameCustomization
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Name</h4>
      
      {/* Size Options */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Size</label>
        <div className="flex gap-2">
          {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateNameCustomization({ size })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                nameCustomization.size === size
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bold Checkbox */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={nameCustomization.bold}
            onChange={(e) => updateNameCustomization({ bold: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="ml-2 text-sm text-gray-700">Name bold</span>
        </label>
      </div>

      {/* Boldness Dropdown */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Font Weight</label>
        <select
          value={nameCustomization.fontWeight || 700}
          onChange={(e) => updateNameCustomization({ fontWeight: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="400">Normal (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi Bold (600)</option>
          <option value="700">Bold (700)</option>
          <option value="800">Extra Bold (800)</option>
        </select>
      </div>


      {/* Font Options */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">Font</label>
        <div className="flex gap-2">
          {(['body', 'creative'] as const).map((font) => (
            <button
              key={font}
              onClick={() => updateNameCustomization({ font })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                nameCustomization.font === font
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {font === 'body' ? 'Body Font' : 'Creative'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NameCustomizationPanel;

