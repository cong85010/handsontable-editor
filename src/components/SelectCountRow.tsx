import React, { useEffect, useState } from 'react';

export interface SelectCountRowProps {
  hotInstance?: any;
  label?: string;
}

export const SelectCountRow: React.FC<SelectCountRowProps> = ({ 
  hotInstance,
  label = 'Selected' 
}) => {
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    if (!hotInstance) return;

    const updateSelectedCount = () => {
      try {
        const selectedRanges = hotInstance.getSelectedRange();
        if (!selectedRanges || selectedRanges.length === 0) {
          setSelectedCount(0);
          return;
        }

        const rowIndices = new Set<number>();
        selectedRanges.forEach((range: any) => {
          const startRow = Math.min(range.from.row, range.to.row);
          const endRow = Math.max(range.from.row, range.to.row);
          
          for (let row = startRow; row <= endRow; row++) {
            rowIndices.add(row);
          }
        });

        setSelectedCount(rowIndices.size);
      } catch (error) {
        console.error('Error counting selected rows:', error);
        setSelectedCount(0);
      }
    };

    // Update on selection change
    hotInstance.addHook('afterSelection', updateSelectedCount);
    hotInstance.addHook('afterDeselect', updateSelectedCount);

    return () => {
      hotInstance.removeHook('afterSelection', updateSelectedCount);
      hotInstance.removeHook('afterDeselect', updateSelectedCount);
    };
  }, [hotInstance]);

  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        padding: '4px 12px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#595959',
        fontWeight: 500,
      }}
    >
      {label}: {selectedCount} {selectedCount === 1 ? 'row' : 'rows'}
    </div>
  );
};

