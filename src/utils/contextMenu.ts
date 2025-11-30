import { TYPE_ROW } from '../types';

export interface ContextMenuOptions {
  onCreateRow?: (rowIndex: number) => void;
  onDeleteRow?: (rowIndex: number) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  enableCreate?: boolean;
  enableDelete?: boolean;
  enableDuplicate?: boolean;
  typeRowField?: string;
}

interface HandsontableSelection {
  from?: { row: number; col: number };
  to?: { row: number; col: number };
  start?: { row: number; col: number };
  end?: { row: number; col: number };
}

interface HandsontableColumn {
  data?: string;
  [key: string]: any;
}

interface HandsontableInstance {
  getSettings: () => { columns?: HandsontableColumn[] };
  countRows: () => number;
  getDataAtRowProp: (row: number, prop: string) => any;
  loadData: (data: any[]) => void;
  getSelected: () => number[][];
  setDataAtRowProp: (row: number, prop: string, value: any) => void;
  alter?: (action: string, index: number, amount: number) => void;
}

/**
 * Extracts row index from Handsontable selection
 */
const getRowIndexFromSelection = (selection: HandsontableSelection[] | number[][] | null | undefined): number => {
  if (!selection || selection.length === 0) {
    return 0;
  }

  const firstSelection = selection[0];
  
  // Handle array format: [[row, col]]
  if (Array.isArray(firstSelection) && firstSelection.length >= 2) {
    return firstSelection[0];
  }

  // Handle object format: {from: {row, col}, to: {row, col}}
  if (typeof firstSelection === 'object' && firstSelection !== null) {
    const objSelection = firstSelection as HandsontableSelection;
    if (objSelection.from?.row !== undefined) {
      return objSelection.from.row;
    }
    if (objSelection.start?.row !== undefined) {
      return objSelection.start.row;
    }
  }

  return 0;
};

/**
 * Converts Handsontable data to array of objects based on column definitions
 */
const convertTableDataToObjects = (
  instance: HandsontableInstance,
  columns: HandsontableColumn[],
): Record<string, any>[] => {
  const rowCount = instance.countRows();
  const dataAsObjects: Record<string, any>[] = [];

  for (let i = 0; i < rowCount; i++) {
    const rowObj: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.data) {
        try {
          rowObj[col.data] = instance.getDataAtRowProp(i, col.data);
        } catch (error) {
          console.warn(`Error getting data for row ${i}, column ${col.data}:`, error);
          rowObj[col.data] = null;
        }
      }
    });
    dataAsObjects.push(rowObj);
  }

  return dataAsObjects;
};

/**
 * Creates a new row object with default values based on column definitions
 */
const createEmptyRowObject = (
  columns: HandsontableColumn[],
  defaultData: Record<string, any> = {},
  typeRowField: string = 'typeRow',
): Record<string, any> => {
  const newRow: Record<string, any> = {
    ...defaultData,
    [typeRowField]: TYPE_ROW.CREATE,
  };

  // Initialize all column fields with null
  columns.forEach((col) => {
    if (col.data && !(col.data in newRow)) {
      newRow[col.data] = null;
    }
  });

  return newRow;
};

/**
 * Creates a context menu configuration for Handsontable
 * Supports creating, deleting, and duplicating rows
 * 
 * Note: Requires Handsontable ContextMenu plugin to be registered
 * Import and register: import { registerAllPlugins } from 'handsontable/registry';
 * Then call: registerAllPlugins();
 */
export const createContextMenu = ({
  onCreateRow,
  onDeleteRow,
  onDuplicateRow,
  enableCreate = true,
  enableDelete = true,
  enableDuplicate = false,
  typeRowField = 'typeRow',
}: ContextMenuOptions = {}): any => {
  const items: Record<string, any> = {};

  // Create row above
  if (enableCreate && onCreateRow) {
    items.row_above = {
      name: 'Insert row above',
      callback: function (key: string, selection: any) {
        try {
          const rowIndex = getRowIndexFromSelection(selection);
          onCreateRow(rowIndex);
        } catch (error) {
          console.error('Error inserting row above:', error);
        }
      },
    };
  }

  // Create row below
  if (enableCreate && onCreateRow) {
    items.row_below = {
      name: 'Insert row below',
      callback: function (key: string, selection: any) {
        try {
          const rowIndex = getRowIndexFromSelection(selection);
          onCreateRow(rowIndex + 1);
        } catch (error) {
          console.error('Error inserting row below:', error);
        }
      },
    };
  }

  // Duplicate row
  if (enableDuplicate && onDuplicateRow) {
    items.duplicate_row = {
      name: 'Duplicate row',
      callback: function (key: string, selection: any) {
        try {
          const rowIndex = getRowIndexFromSelection(selection);
          onDuplicateRow(rowIndex);
        } catch (error) {
          console.error('Error duplicating row:', error);
        }
      },
    };
  }

  // Delete row
  if (enableDelete && onDeleteRow) {
    items.remove_row = {
      name: 'Remove row',
      callback: function (key: string, selection: any) {
        try {
          const rowIndex = getRowIndexFromSelection(selection);
          onDeleteRow(rowIndex);
        } catch (error) {
          console.error('Error removing row:', error);
        }
      },
      disabled: function () {
        try {
          const instance = this as HandsontableInstance;
          const selection = instance.getSelected();
          
          if (!selection || selection.length === 0) {
            return true;
          }

          const startRow = selection[0]?.[0] ?? 0;
          const typeRowValue = instance.getDataAtRowProp(startRow, typeRowField);
          
          // Disable delete if row is already marked as DELETE
          return typeRowValue === TYPE_ROW.DELETE;
        } catch (error) {
          console.error('Error checking if delete should be disabled:', error);
          return true;
        }
      },
    };
  }

  // Add separator if we have items
  if (Object.keys(items).length > 0) {
    items.sep1 = '---------';
  }

  return { items };
};

/**
 * Helper function to create a new row with default values
 * 
 * @param instance - Handsontable instance
 * @param rowIndex - Index where to insert the new row
 * @param defaultData - Default values for the new row
 * @param typeRowField - Field name for row type (default: 'typeRow')
 * @returns The created row object
 */
export const createNewRow = (
  instance: HandsontableInstance,
  rowIndex: number,
  defaultData: Record<string, any> = {},
  typeRowField: string = 'typeRow',
): Record<string, any> => {
  try {
    const columns = instance.getSettings().columns || [];
    
    if (columns.length === 0) {
      console.warn('No columns defined in Handsontable instance');
      return {};
    }

    // Validate row index
    const rowCount = instance.countRows();
    const validRowIndex = Math.max(0, Math.min(rowIndex, rowCount));

    // Create new row object
    const newRow = createEmptyRowObject(columns, defaultData, typeRowField);

    // Get current data and convert to array of objects
    const dataAsObjects = convertTableDataToObjects(instance, columns);
    
    // Insert the new row
    dataAsObjects.splice(validRowIndex, 0, newRow);
    
    // Update the table with new data
    instance.loadData(dataAsObjects);
    
    return newRow;
  } catch (error) {
    console.error('Error creating new row:', error);
    throw error;
  }
};

/**
 * Helper function to delete a row (marks as DELETE instead of removing)
 * 
 * @param instance - Handsontable instance
 * @param rowIndex - Index of the row to delete
 * @param typeRowField - Field name for row type (default: 'typeRow')
 * @param removePhysicalRow - If true, physically removes the row; otherwise marks as deleted
 */
export const deleteRow = (
  instance: HandsontableInstance,
  rowIndex: number,
  typeRowField: string = 'typeRow',
  removePhysicalRow: boolean = false,
): void => {
  try {
    const rowCount = instance.countRows();
    
    if (rowIndex < 0 || rowIndex >= rowCount) {
      console.warn(`Invalid row index: ${rowIndex}. Row count: ${rowCount}`);
      return;
    }

    if (removePhysicalRow && instance.alter) {
      instance.alter('remove_row', rowIndex, 1);
    } else {
      // Mark row as deleted instead of removing it
      instance.setDataAtRowProp(rowIndex, typeRowField, TYPE_ROW.DELETE);
    }
  } catch (error) {
    console.error('Error deleting row:', error);
    throw error;
  }
};

/**
 * Helper function to duplicate a row
 * 
 * @param instance - Handsontable instance
 * @param rowIndex - Index of the row to duplicate
 * @param typeRowField - Field name for row type (default: 'typeRow')
 * @returns The duplicated row object
 */
export const duplicateRow = (
  instance: HandsontableInstance,
  rowIndex: number,
  typeRowField: string = 'typeRow',
): Record<string, any> => {
  try {
    const columns = instance.getSettings().columns || [];
    const rowCount = instance.countRows();
    
    if (columns.length === 0) {
      console.warn('No columns defined in Handsontable instance');
      return {};
    }

    if (rowIndex < 0 || rowIndex >= rowCount) {
      console.warn(`Invalid row index: ${rowIndex}. Row count: ${rowCount}`);
      return {};
    }

    // Copy all data from the source row
    const duplicatedData: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.data) {
        try {
          duplicatedData[col.data] = instance.getDataAtRowProp(rowIndex, col.data);
        } catch (error) {
          console.warn(`Error getting data for column ${col.data}:`, error);
          duplicatedData[col.data] = null;
        }
      }
    });
    
    // Set typeRow to CREATE for duplicated row
    duplicatedData[typeRowField] = TYPE_ROW.CREATE;
    
    // Reset ID if it exists (so it's a new row)
    if (duplicatedData.id !== undefined) {
      duplicatedData.id = null;
    }

    // Get current data and convert to array of objects
    const dataAsObjects = convertTableDataToObjects(instance, columns);
    
    // Insert the duplicated row
    const insertIndex = rowIndex + 1;
    dataAsObjects.splice(insertIndex, 0, duplicatedData);
    
    // Update the table with new data
    instance.loadData(dataAsObjects);
    
    return duplicatedData;
  } catch (error) {
    console.error('Error duplicating row:', error);
    throw error;
  }
};

/**
 * Helper function to convert Handsontable data to array of objects
 * Useful for syncing with React state
 * 
 * @param instance - Handsontable instance
 * @returns Array of row objects
 */
export const getTableDataAsObjects = (instance: HandsontableInstance): Record<string, any>[] => {
  try {
    const columns = instance.getSettings().columns || [];
    return convertTableDataToObjects(instance, columns);
  } catch (error) {
    console.error('Error getting table data as objects:', error);
    return [];
  }
};
