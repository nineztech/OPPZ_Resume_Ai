import React from 'react';
import { Button } from '@/components/ui/button';

interface PresetThemesPanelProps {
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
    colorMode?: string;
    accentType?: string;
    selectedPalette?: string | null;
    applyAccentTo?: any;
    typography: any;
    layout: any;
  };
  updateCustomization: (updates: any) => void;
}

const PresetThemesPanel: React.FC<PresetThemesPanelProps> = ({
  updateCustomization
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Preset Themes</h4>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateCustomization({
            theme: {
              primaryColor: '#1e293b',
              secondaryColor: '#374154',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#1e293b',
              borderColor: '#1e293b',
              headerColor: '#1e293b'
            }
          })}
          className="text-xs"
        >
          Professional
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateCustomization({
            theme: {
              primaryColor: '#374154',
              secondaryColor: '#1e293b',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#374154',
              borderColor: '#374154',
              headerColor: '#374154'
            }
          })}
          className="text-xs"
        >
          Modern
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateCustomization({
            theme: {
              primaryColor: '#2c5282',
              secondaryColor: '#1e40af',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#2c5282',
              borderColor: '#2c5282',
              headerColor: '#2c5282'
            }
          })}
          className="text-xs"
        >
          Corporate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateCustomization({
            theme: {
              primaryColor: '#1e40af',
              secondaryColor: '#2c5282',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#1e40af',
              borderColor: '#1e40af',
              headerColor: '#1e40af'
            }
          })}
          className="text-xs"
        >
          Executive
        </Button>
      </div>
    </div>
  );
};

export default PresetThemesPanel;

