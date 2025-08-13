import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddCustomSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sectionData: any) => void;
}

const AddCustomSectionModal = ({ isOpen, onClose, onAdd }: AddCustomSectionModalProps) => {
  const [sectionData, setSectionData] = useState({
    title: '',
    type: 'list' as const,
    content: {
      text: '',
      items: []
    },
    styling: {
      showBullets: true,
      showDates: true,
      showLocation: true,
      showLinks: true,
      showTags: false,
      layout: 'vertical' as 'vertical' | 'horizontal' | 'grid'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sectionData.title.trim()) {
      onAdd(sectionData);
      setSectionData({
        title: '',
        type: 'list',
        content: {
          text: '',
          items: []
        },
        styling: {
          showBullets: true,
          showDates: true,
          showLocation: true,
          showLinks: true,
          showTags: false,
          layout: 'vertical'
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Custom Section</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Title */}
          <div>
            <Label htmlFor="sectionTitle">Section Title</Label>
            <Input
              id="sectionTitle"
              value={sectionData.title}
              onChange={(e) => setSectionData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Awards & Recognition, Publications, Volunteer Work"
              required
            />
          </div>

          {/* Section Type */}
          <div>
            <Label htmlFor="sectionType">Section Type</Label>
            <select
              id="sectionType"
              value={sectionData.type}
              onChange={(e) => setSectionData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="text">Text Only - Simple paragraph content</option>
              <option value="list">List Items - Bullet points or numbered list</option>
              <option value="timeline">Timeline - Chronological items with dates</option>
              <option value="grid">Grid Layout - Items in columns</option>
              <option value="mixed">Mixed Content - Combination of different content types</option>
            </select>
          </div>

          {/* Layout Options */}
          <div>
            <Label>Layout Options</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="layout"
                  value="vertical"
                  checked={sectionData.styling.layout === 'vertical'}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, layout: e.target.value as 'vertical' | 'horizontal' | 'grid' }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Vertical</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="layout"
                  value="horizontal"
                  checked={sectionData.styling.layout === 'horizontal'}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, layout: e.target.value as 'vertical' | 'horizontal' | 'grid' }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Horizontal</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="layout"
                  value="grid"
                  checked={sectionData.styling.layout === 'grid'}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, layout: e.target.value as 'vertical' | 'horizontal' | 'grid' }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Grid</span>
              </label>
            </div>
          </div>

          {/* Styling Options */}
          <div>
            <Label>Display Options</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sectionData.styling.showBullets}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, showBullets: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Show Bullet Points</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sectionData.styling.showDates}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, showDates: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Show Dates</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sectionData.styling.showLocation}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, showLocation: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Show Location</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sectionData.styling.showLinks}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, showLinks: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Show Links</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sectionData.styling.showTags}
                  onChange={(e) => setSectionData(prev => ({ 
                    ...prev, 
                    styling: { ...prev.styling, showTags: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Show Tags</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-gray-700 mb-2">Preview</Label>
            <div className="text-sm text-gray-600">
              <p><strong>{sectionData.title || 'Section Title'}</strong></p>
              <p className="text-xs text-gray-500 mt-1">
                Type: {sectionData.type} | Layout: {sectionData.styling.layout}
              </p>
              <p className="text-xs text-gray-500">
                Options: {Object.entries(sectionData.styling)
                  .filter(([key, value]) => key !== 'layout' && value)
                  .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
                  .join(', ')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!sectionData.title.trim()}>
              Add Section
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomSectionModal;

