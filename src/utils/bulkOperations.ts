/**
 * Bulk operations helper for Handsontable
 * Batches multiple operations for better performance
 */
export const handleBulkOperations = async (hotInstance: any, operation: () => void) => {
  if (!hotInstance) {
    console.warn('Handsontable instance not available for bulk operations');
    return;
  }

  try {
    hotInstance.batch(() => {
      operation();
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
  }
};

/**
 * Create empty row with default values
 */
export const createEmptyRow = <T extends Record<string, any>>(defaults?: Partial<T>): T => {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...defaults,
  } as unknown as T;
};

/**
 * Clear specific field in a row
 */
export const clearRowField = (hotInstance: any, rowIndex: number, fieldName: string) => {
  if (!hotInstance) return;
  hotInstance.setDataAtRowProp(rowIndex, fieldName, null);
};

/**
 * Clear multiple fields in a row
 */
export const clearRowFields = (hotInstance: any, rowIndex: number, fieldNames: string[]) => {
  if (!hotInstance) return;
  
  handleBulkOperations(hotInstance, () => {
    fieldNames.forEach(fieldName => {
      hotInstance.setDataAtRowProp(rowIndex, fieldName, null);
    });
  });
};

/**
 * Update multiple cells in batch
 */
export const batchUpdateCells = (
  hotInstance: any, 
  updates: Array<[row: number, prop: string, value: any]>
) => {
  if (!hotInstance || !updates.length) return;
  
  handleBulkOperations(hotInstance, () => {
    hotInstance.setDataAtRowProp(updates, 'batchUpdate');
  });
};

/**
 * Duplicate row at specific index
 */
export const duplicateRowAt = (hotInstance: any, rowIndex: number): void => {
  if (!hotInstance) return;
  
  const rowData = hotInstance.getSourceDataAtRow(rowIndex);
  if (!rowData) return;
  
  // Create copy without ID (will be regenerated)
  const { id, uuid, ...dataCopy } = rowData;
  const newRow = createEmptyRow(dataCopy);
  
  handleBulkOperations(hotInstance, () => {
    hotInstance.alter('insert_row_below', rowIndex, 1);
    const newRowIndex = rowIndex + 1;
    
    // Set all properties
    Object.keys(newRow).forEach((key) => {
      hotInstance.setDataAtRowProp(newRowIndex, key, newRow[key]);
    });
  });
};

/**
 * Delete rows by indices
 */
export const deleteRowsByIndices = (hotInstance: any, rowIndices: number[]): void => {
  if (!hotInstance || !rowIndices.length) return;
  
  // Sort in descending order to avoid index shifting
  const sortedIndices = [...rowIndices].sort((a, b) => b - a);
  
  handleBulkOperations(hotInstance, () => {
    sortedIndices.forEach(index => {
      hotInstance.alter('remove_row', index, 1);
    });
  });
};

/**
 * Get selected row indices
 */
export const getSelectedRowIndices = (hotInstance: any): number[] => {
  if (!hotInstance) return [];
  
  const selectedRanges = hotInstance.getSelectedRange();
  if (!selectedRanges || selectedRanges.length === 0) return [];
  
  const rowIndices = new Set<number>();
  
  selectedRanges.forEach((range: any) => {
    const startRow = Math.min(range.from.row, range.to.row);
    const endRow = Math.max(range.from.row, range.to.row);
    
    for (let row = startRow; row <= endRow; row++) {
      rowIndices.add(row);
    }
  });
  
  return Array.from(rowIndices).sort((a, b) => a - b);
};

/**
 * Get selected rows data
 */
export const getSelectedRowsData = <T = any>(hotInstance: any): T[] => {
  if (!hotInstance) return [];
  
  const rowIndices = getSelectedRowIndices(hotInstance);
  return rowIndices.map(index => hotInstance.getSourceDataAtRow(index));
};

/**
 * Set row color for selected rows
 */
export const colorSelectedRows = (hotInstance: any, color: string, colorField: string = 'rowColor'): void => {
  if (!hotInstance) return;
  
  const selectedRanges = hotInstance.getSelectedRange();
  if (!selectedRanges || selectedRanges.length === 0) return;
  
  handleBulkOperations(hotInstance, () => {
    selectedRanges.forEach((range: any) => {
      const startRow = Math.min(range.from.row, range.to.row);
      const endRow = Math.max(range.from.row, range.to.row);
      
      for (let visualRow = startRow; visualRow <= endRow; visualRow++) {
        const rowData = hotInstance.getSourceDataAtRow(visualRow);
        if (rowData?.id) {
          hotInstance.setDataAtRowProp(visualRow, colorField, color);
        }
      }
    });
  });
};

