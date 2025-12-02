import dayjs, { Dayjs } from 'dayjs';

// ==========================================
// Constants
// ==========================================
export const ERROR_CELL_CLASS = 'invalid-container-cell';

// ==========================================
// Utility Functions - Error Class Management
// ==========================================

/**
 * Adds error class to existing className (prevents duplicates)
 * @param existingClassName - Current className from cell meta
 * @returns New className with error class appended
 * @example
 * addErrorClass('htCenter') → 'htCenter invalid-container-cell'
 * addErrorClass('htCenter invalid-container-cell') → 'htCenter invalid-container-cell' (no duplicate)
 */
export function addErrorClass(existingClassName: string): string {
  if (!existingClassName) return ERROR_CELL_CLASS;
  if (existingClassName.includes(ERROR_CELL_CLASS)) return existingClassName;
  return `${existingClassName} ${ERROR_CELL_CLASS}`;
}

/**
 * Removes error class from className and normalizes spaces
 * @param className - Current className
 * @returns Cleaned className without error class
 * @example
 * removeErrorClass('htCenter invalid-container-cell') → 'htCenter'
 * removeErrorClass('invalid-container-cell htNumeric') → 'htNumeric'
 */
export function removeErrorClass(className: string): string {
  if (!className || !className.includes(ERROR_CELL_CLASS)) return className;
  return className.replace(ERROR_CELL_CLASS, '').replace(/\s+/g, ' ').trim();
}

/**
 * Clears error highlighting from a single cell
 * - Removes ERROR_CELL_CLASS from cell meta className
 * - Preserves other classes (htCenter, htNumeric, etc.)
 * - Does NOT remove tooltip (tooltip is temporary, not in cell meta)
 * @param hotInstance - Handsontable instance
 * @param row - Row index (must be >= 0)
 * @param col - Column index (must be >= 0)
 * @returns true if error was cleared, false if no error existed
 */
export function clearCellError(hotInstance: any, row: number, col: number): boolean {
  // Validate inputs: Handsontable requires non-negative indices
  if (!hotInstance || row < 0 || col < 0) return false;

  const className = hotInstance.getCellMeta(row, col)?.className || '';
  if (!className.includes(ERROR_CELL_CLASS)) return false;

  const newClassName = removeErrorClass(className);
  if (newClassName) {
    hotInstance.setCellMeta(row, col, 'className', newClassName);
  } else {
    hotInstance.removeCellMeta(row, col, 'className');
  }

  return true;
}

/**
 * Clears error highlighting from a range of cells (used for autofill)
 * @param hotInstance - Handsontable instance
 * @param fromRow - Start row index
 * @param toRow - End row index
 * @param fromCol - Start column index
 * @param toCol - End column index
 * @returns true if any errors were cleared, false otherwise
 */
export function clearCellErrorRange(hotInstance: any, fromRow: number, toRow: number, fromCol: number, toCol: number): boolean {
  if (!hotInstance) return false;

  let hasErrorCleared = false;
  for (let row = fromRow; row <= toRow; row++) {
    for (let col = fromCol; col <= toCol; col++) {
      if (clearCellError(hotInstance, row, col)) {
        hasErrorCleared = true;
      }
    }
  }

  return hasErrorCleared;
}

// Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  invalidRows?: number[];
}

export interface CellError {
  row: number;
  col: string;
  message: string;
}

export interface DetailedValidationResult {
  isValid: boolean;
  errors: string[];
  invalidRows: number[];
  cellErrors: CellError[];
}

// Performance optimization: Pre-compiled date formats
const DATE_FORMATS = ['YYYY-MM-DDTHH:mm:ss.SSS[Z]', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'DD/MM/YYYY'];

// Performance optimization: Cached date parsing
const parseDate = (dateString: string | null | undefined): Dayjs | null => {
  if (!dateString) return null;
  return dayjs(dateString, DATE_FORMATS, true);
};

// Performance optimization: Cached today date
const getTodayStart = (): Dayjs => dayjs().startOf('day');

// Validate date
export const validateDate = (dateString: string | null | undefined, fieldName?: string): string[] => {
  if (!dateString) return [];

  const parsedDate = parseDate(dateString);
  if (!parsedDate?.isValid()) {
    return ['Invalid date format'];
  }

  if (fieldName === 'planDate') {
    const today = getTodayStart();
    if (parsedDate.isBefore(today)) {
      return ['Date cannot be in the past'];
    }
  }

  return [];
};

// Validate numeric value
export const validateNumericValue = (value: number | null | undefined, minValue: number, message: string): string[] => {
  if (value === null || value === undefined) return [];

  if (isNaN(value)) {
    return ['Invalid numeric value'];
  }

  if (value < minValue) {
    return [message];
  }

  return [];
};

// Bulletproof column resolution
export const getColumnIndexBulletproof = (hotInstance: any, fieldName: string): number | null => {
  if (!hotInstance) {
    return null;
  }

  try {
    // Get current table state
    const settings = hotInstance.getSettings();
    if (!settings) {
      return null;
    }

    const columns = settings.columns || [];
    if (!columns.length) {
      return null;
    }

    // Try multiple field name variations
    const fieldVariations = [
      fieldName,
      fieldName.replace('Id', 'Name'),
      fieldName.replace('Id', 'Code'),
      fieldName.replace('Id', ''),
    ];

    // Try exact match first
    let columnIndex = columns.findIndex((col: any) => {
      return fieldVariations.includes(col.data);
    });

    // If not found, try case-insensitive match
    if (columnIndex === -1) {
      columnIndex = columns.findIndex((col: any) => {
        const match = fieldVariations.some((variation) => col.data?.toLowerCase() === variation.toLowerCase());
        return match;
      });
    }

    // If still not found, try partial match
    if (columnIndex === -1) {
      columnIndex = columns.findIndex((col: any) => {
        const match = fieldVariations.some((variation) => col.data?.includes(variation) || variation.includes(col.data));
        return match;
      });
    }

    if (columnIndex === -1) {
      return null;
    }

    return columnIndex;
  } catch (error) {
    return null;
  }
};

/**
 * Highlights invalid cells with error class and tooltips
 * - Adds ERROR_CELL_CLASS to cell meta (persists through re-renders via afterRenderer)
 * - Sets tooltips on DOM elements (may be lost on re-render, but error class persists)
 * - Scrolls to first error cell
 */
export const highlightInvalidCellsBulletproof = (hotInstance: any, cellErrors: CellError[]): void => {
  if (!hotInstance || !cellErrors.length) {
    return;
  }

  clearCellHighlights(hotInstance);

  // Temporary map for tooltips and scrolling (not stored in cell meta)
  const errorMap = new Map<string, string>();

  cellErrors.forEach(({ row, col, message }) => {
    try {
      // Use bulletproof column resolution
      const colIndex = getColumnIndexBulletproof(hotInstance, col);

      if (colIndex !== null && colIndex >= 0) {
        // Get existing className from cell meta or column settings
        const cellMeta = hotInstance.getCellMeta(row, colIndex);
        const existingClassName = cellMeta?.className || '';

        // Add error class using utility function
        const newClassName = addErrorClass(existingClassName);

        // Set cell meta for persistent highlighting (className persists via afterRenderer)
        hotInstance.setCellMeta(row, colIndex, 'className', newClassName);

        // Track error message for tooltip (temporary, for initial display only)
        errorMap.set(`${row}-${colIndex}`, message);
      }
    } catch (error) {
      // Silent error handling
    }
  });

  // Render once to apply all cell meta changes
  hotInstance.render();

  // Apply tooltips to DOM elements after render
  errorMap.forEach((message, key) => {
    const [row, col] = key.split('-').map(Number);
    const cellElement = hotInstance.getCell(row, col);
    if (cellElement) {
      cellElement.title = message;
    }
  });

  // Scroll to first error
  if (errorMap.size > 0) {
    const firstKey = Array.from(errorMap.keys())[0];
    const [row, col] = firstKey.split('-').map(Number);
    const cellElement = hotInstance.getCell(row, col);
    if (cellElement) {
      cellElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }
};

export const clearCellHighlights = (hotInstance: any): void => {
  if (!hotInstance) return;

  try {
    const rowCount = hotInstance.countRows();
    const colCount = hotInstance.countCols();
    const settings = hotInstance.getSettings();
    const columns = settings?.columns || [];

    // Track cells that had errors (for DOM cleanup after render)
    const cellsWithErrors: Array<{ row: number; col: number }> = [];

    // Clear cell meta for error highlighting
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const cellMeta = hotInstance.getCellMeta(row, col);
        const currentClassName = cellMeta?.className || '';

        // Remove error class but keep other classes
        if (currentClassName.includes(ERROR_CELL_CLASS)) {
          // Track this cell for DOM cleanup
          cellsWithErrors.push({ row, col });

          // Get original className from column definition
          const columnDef = columns[col];
          const originalClassName = columnDef?.className || '';

          // Restore original className or remove if none
          if (originalClassName) {
            hotInstance.setCellMeta(row, col, 'className', originalClassName);
          } else {
            hotInstance.removeCellMeta(row, col, 'className');
          }
        }
      }
    }

    // Re-render once to apply all cell meta changes
    hotInstance.render();

    // Clear inline styles and tooltips only for cells that had errors
    cellsWithErrors.forEach(({ row, col }) => {
      const cellElement = hotInstance.getCell(row, col);
      if (cellElement) {
        cellElement.style.backgroundColor = '';
        cellElement.style.border = '';
        cellElement.title = '';
      }
    });
  } catch (error) {
    console.warn('Could not clear cell highlights:', error);
  }
};

/**
 * Highlight rows with errors by row IDs/UUIDs
 * Sets rowColorError for frontend display (not submitted to backend)
 */
export const highlightRowErrorById = (hotInstance: any, rowIds: string[], rowColor: string = '#ffcccc'): void => {
  if (!hotInstance || !rowIds.length) return;

  clearCellHighlights(hotInstance);

  const sourceData = hotInstance.getSourceData();

  hotInstance.batch(() => {
    sourceData.forEach((row: any, index: number) => {
      if (rowIds.includes(row.id) || rowIds.includes(row.uuid)) {
        // Set rowColorError (frontend only)
        hotInstance.setDataAtRowProp(index, 'rowColorError', rowColor);
      }
    });
  });

  hotInstance.render();
};

/**
 * Helper to validate if value is empty
 */
export const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '');
};

/**
 * Container ISO validation
 * Validates container number against ISO 6346 standard
 */
export const validateContainerISO = (containerNumber: string): boolean => {
  if (!containerNumber || typeof containerNumber !== 'string') return false;
  
  // ISO 6346 format: 4 letters + 6 digits + 1 check digit
  const pattern = /^[A-Z]{4}\d{7}$/;
  if (!pattern.test(containerNumber.trim().toUpperCase())) return false;
  
  // Additional check digit validation could be added here
  return true;
};

