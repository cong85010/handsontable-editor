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

export interface ContextMenuConfig {
  items: {
    key: string;
    name: string;
    callback: (key: string, selection: any) => void;
    disabled?: () => boolean;
  };
}

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
  const items: any = {};

  if (enableCreate && onCreateRow) {
    items.row_above = {
      name: 'Insert row above',
      callback: function (key: string, selection: any, clickEvent: MouseEvent) {
        const instance = this;
        // Handsontable context menu selection format: [{from: {row, col}, to: {row, col}}]
        let startRow = 0;
        if (selection && selection.length > 0) {
          if (selection[0].from) {
            startRow = selection[0].from.row;
          } else if (selection[0].start) {
            startRow = selection[0].start.row;
          } else if (Array.isArray(selection[0])) {
            startRow = selection[0][0];
          }
        }
        onCreateRow(startRow);
      },
    };
  }

  if (enableCreate && onCreateRow) {
    items.row_below = {
      name: 'Insert row below',
      callback: function (key: string, selection: any, clickEvent: MouseEvent) {
        const instance = this;
        let startRow = 0;
        if (selection && selection.length > 0) {
          if (selection[0].from) {
            startRow = selection[0].from.row;
          } else if (selection[0].start) {
            startRow = selection[0].start.row;
          } else if (Array.isArray(selection[0])) {
            startRow = selection[0][0];
          }
        }
        onCreateRow(startRow + 1);
      },
    };
  }

  if (enableDuplicate && onDuplicateRow) {
    items.duplicate_row = {
      name: 'Duplicate row',
      callback: function (key: string, selection: any, clickEvent: MouseEvent) {
        const instance = this;
        let startRow = 0;
        if (selection && selection.length > 0) {
          if (selection[0].from) {
            startRow = selection[0].from.row;
          } else if (selection[0].start) {
            startRow = selection[0].start.row;
          } else if (Array.isArray(selection[0])) {
            startRow = selection[0][0];
          }
        }
        onDuplicateRow(startRow);
      },
    };
  }

  if (enableDelete && onDeleteRow) {
    items.remove_row = {
      name: 'Remove row',
      callback: function (key: string, selection: any, clickEvent: MouseEvent) {
        const instance = this;
        let startRow = 0;
        if (selection && selection.length > 0) {
          if (selection[0].from) {
            startRow = selection[0].from.row;
          } else if (selection[0].start) {
            startRow = selection[0].start.row;
          } else if (Array.isArray(selection[0])) {
            startRow = selection[0][0];
          }
        }
        onDeleteRow(startRow);
      },
      disabled: function () {
        const instance = this;
        const selection = instance.getSelected();
        if (!selection || selection.length === 0) return true;

        const startRow = selection[0]?.[0] ?? 0;
        const typeRowValue = instance.getDataAtRowProp(startRow, typeRowField);
        
        // Disable delete if row is marked as DELETE (already deleted)
        return typeRowValue === TYPE_ROW.DELETE;
      },
    };
  }

  // Add separator if we have items
  if (Object.keys(items).length > 0) {
    items.sep1 = '---------';
  }

  return {
    items,
  };
};

/**
 * Helper function to create a new row with default values
 */
export const createNewRow = (
  instance: any,
  rowIndex: number,
  defaultData: Record<string, any> = {},
  typeRowField: string = 'typeRow',
) => {
  const columns = instance.getSettings().columns || [];
  const newRow: Record<string, any> = {
    ...defaultData,
    [typeRowField]: TYPE_ROW.CREATE,
  };

  // Initialize all column fields with null
  columns.forEach((col: any) => {
    if (col.data && !(col.data in newRow)) {
      newRow[col.data] = null;
    }
  });

  // Get current data - Handsontable with columns uses array of objects
  const currentData = instance.getData();
  const rowCount = instance.countRows();
  
  // Convert current data to array of objects
  const dataAsObjects: Record<string, any>[] = [];
  for (let i = 0; i < rowCount; i++) {
    const rowObj: Record<string, any> = {};
    columns.forEach((col: any) => {
      if (col.data) {
        rowObj[col.data] = instance.getDataAtRowProp(i, col.data);
      }
    });
    dataAsObjects.push(rowObj);
  }
  
  // Insert the new row
  dataAsObjects.splice(rowIndex, 0, newRow);
  
  // Update the table with new data
  instance.loadData(dataAsObjects);
  
  return newRow;
};

/**
 * Helper function to delete a row (marks as DELETE instead of removing)
 */
export const deleteRow = (
  instance: any,
  rowIndex: number,
  typeRowField: string = 'typeRow',
  removePhysicalRow: boolean = false,
) => {
  if (removePhysicalRow) {
    instance.alter('remove_row', rowIndex, 1);
  } else {
    // Mark row as deleted instead of removing it
    instance.setDataAtRowProp(rowIndex, typeRowField, TYPE_ROW.DELETE);
  }
};

/**
 * Helper function to duplicate a row
 */
export const duplicateRow = (
  instance: any,
  rowIndex: number,
  typeRowField: string = 'typeRow',
) => {
  const columns = instance.getSettings().columns || [];
  const duplicatedData: Record<string, any> = {};
  
  // Copy all data from the source row
  columns.forEach((col: any) => {
    if (col.data) {
      duplicatedData[col.data] = instance.getDataAtRowProp(rowIndex, col.data);
    }
  });
  
  // Set typeRow to CREATE for duplicated row
  duplicatedData[typeRowField] = TYPE_ROW.CREATE;
  
  // Reset ID if it exists (so it's a new row)
  if (duplicatedData.id !== undefined) {
    duplicatedData.id = null;
  }

  // Get current data and convert to array of objects
  const rowCount = instance.countRows();
  const dataAsObjects: Record<string, any>[] = [];
  for (let i = 0; i < rowCount; i++) {
    const rowObj: Record<string, any> = {};
    columns.forEach((col: any) => {
      if (col.data) {
        rowObj[col.data] = instance.getDataAtRowProp(i, col.data);
      }
    });
    dataAsObjects.push(rowObj);
  }
  
  // Insert the duplicated row
  const insertIndex = rowIndex + 1;
  dataAsObjects.splice(insertIndex, 0, duplicatedData);
  
  // Update the table with new data
  instance.loadData(dataAsObjects);
  
  return duplicatedData;
};

