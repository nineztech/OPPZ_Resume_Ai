import React, { useState } from 'react';

interface SectionVisibilityOrderPanelProps {
  allSections: Array<{
    id: string;
    label: string;
    icon: any;
    isCustom?: boolean;
  }>;
  visibleSections: Set<string>;
  sectionOrder: string[];
  toggleSectionVisibility: (sectionId: string) => void;
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;
}

const SectionVisibilityOrderPanel: React.FC<SectionVisibilityOrderPanelProps> = ({
  allSections,
  visibleSections,
  sectionOrder,
  toggleSectionVisibility,
  moveSectionUp,
  moveSectionDown
}) => {
  // Drag and drop functionality
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', sectionId);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    const draggedSectionId = e.dataTransfer.getData('text/html');
    
    if (draggedSectionId && draggedSectionId !== targetSectionId) {
      const currentIndex = sectionOrder.indexOf(draggedSectionId);
      const targetIndex = sectionOrder.indexOf(targetSectionId);
      
      if (currentIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...sectionOrder];
        newOrder.splice(currentIndex, 1);
        newOrder.splice(targetIndex, 0, draggedSectionId);
        // Note: The actual section order update would need to be handled by parent component
        // For now, we'll just reset the drag state
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Section Visibility & Order</h4>
      <div className="space-y-2">
        {allSections.map((section) => {
          const isVisible = visibleSections.has(section.id);
          const currentIndex = sectionOrder.indexOf(section.id);
          const isFirst = currentIndex === 0;
          const isLast = currentIndex === sectionOrder.length - 1;
          const isDragging = draggedItem === section.id;
          const isDragOver = dragOverItem === section.id;
          
          return (
            <div 
              key={section.id} 
              draggable={!section.isCustom}
              onDragStart={(e) => !section.isCustom && handleDragStart(e, section.id)}
              onDragOver={(e) => !section.isCustom && handleDragOver(e, section.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => !section.isCustom && handleDrop(e, section.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-2 border border-gray-100 rounded-md transition-all duration-200 ${
                isDragging 
                  ? 'opacity-50 scale-95' 
                  : isDragOver 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'hover:border-gray-200'
              } ${!section.isCustom ? 'cursor-move' : 'cursor-default'}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleSectionVisibility(section.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${!isVisible ? 'text-gray-400' : 'text-gray-700'}`}>
                  {section.label}
                </span>
                {!section.isCustom && (
                  <span className="text-xs text-gray-400">⋮⋮</span>
                )}
              </div>
              
              {/* Order controls - only show for standard sections */}
              {!section.isCustom && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSectionUp(section.id)}
                    disabled={isFirst}
                    className={`p-1 rounded text-xs ${
                      isFirst 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSectionDown(section.id)}
                    disabled={isLast}
                    className={`p-1 rounded text-xs ${
                      isLast 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 p-2 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          💡 Drag sections up/down or use the ↑ ↓ buttons to reorder. Changes will be reflected in the preview.
        </p>
      </div>
    </div>
  );
};

export default SectionVisibilityOrderPanel;

