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
      callback: function (key: string, selection: any) {
        const instance = this;
        const startRow = selection[0]?.start?.row ?? selection[0]?.[0] ?? 0;
        onCreateRow(startRow);
      },
    };
  }

  if (enableCreate && onCreateRow) {
    items.row_below = {
      name: 'Insert row below',
      callback: function (key: string, selection: any) {
        const instance = this;
        const startRow = selection[0]?.start?.row ?? selection[0]?.[0] ?? 0;
        onCreateRow(startRow + 1);
      },
    };
  }

  if (enableDuplicate && onDuplicateRow) {
    items.duplicate_row = {
      name: 'Duplicate row',
      callback: function (key: string, selection: any) {
        const instance = this;
        const startRow = selection[0]?.start?.row ?? selection[0]?.[0] ?? 0;
        onDuplicateRow(startRow);
      },
    };
  }

  if (enableDelete && onDeleteRow) {
    items.remove_row = {
      name: 'Remove row',
      callback: function (key: string, selection: any) {
        const instance = this;
        const startRow = selection[0]?.start?.row ?? selection[0]?.[0] ?? 0;
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
  const currentData = instance.getData();
  const newRow: Record<string, any> = {
    ...defaultData,
    [typeRowField]: TYPE_ROW.CREATE,
  };

  // Copy structure from existing row if available
  if (currentData.length > 0 && currentData[0]) {
    Object.keys(currentData[0]).forEach((key) => {
      if (!(key in newRow)) {
        newRow[key] = null;
      }
    });
  }

  instance.alter('insert_row', rowIndex, 1);
  instance.setDataAtRow(rowIndex, Object.values(newRow));
  
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
  const rowData = instance.getDataAtRow(rowIndex);
  const newRowData = [...rowData];
  
  // Set typeRow to CREATE for duplicated row
  const typeRowColIndex = instance.propToCol(typeRowField);
  if (typeRowColIndex !== null && typeRowColIndex !== -1) {
    newRowData[typeRowColIndex] = TYPE_ROW.CREATE;
  }

  instance.alter('insert_row', rowIndex + 1, 1);
  instance.setDataAtRow(rowIndex + 1, newRowData);
  
  return newRowData;
};

