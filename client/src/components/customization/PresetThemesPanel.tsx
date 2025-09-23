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
              primaryColor: '#1f2937',
              secondaryColor: '#374151',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#1f2937',
              borderColor: '#1f2937',
              headerColor: '#1f2937'
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
              primaryColor: '#dc2626',
              secondaryColor: '#991b1b',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#dc2626',
              borderColor: '#dc2626',
              headerColor: '#dc2626'
            }
          })}
          className="text-xs"
        >
          Creative
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateCustomization({
            theme: {
              primaryColor: '#059669',
              secondaryColor: '#047857',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#059669',
              borderColor: '#059669',
              headerColor: '#059669'
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
              primaryColor: '#7c3aed',
              secondaryColor: '#5b21b6',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#7c3aed',
              borderColor: '#7c3aed',
              headerColor: '#7c3aed'
            }
          })}
          className="text-xs"
        >
          Elegant
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateCustomization({
            theme: {
              primaryColor: '#0891b2',
              secondaryColor: '#0e7490',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#0891b2',
              borderColor: '#0891b2',
              headerColor: '#0891b2'
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
              primaryColor: '#ea580c',
              secondaryColor: '#c2410c',
              textColor: '#000000',
              backgroundColor: '#ffffff',
              accentColor: '#ea580c',
              borderColor: '#ea580c',
              headerColor: '#ea580c'
            }
          })}
          className="text-xs"
        >
          Vibrant
        </Button>
      </div>
    </div>
  );
};

export default PresetThemesPanel;

