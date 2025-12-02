// Types
export * from './types';

// Constants
export * from './constants';

// Stores - use namespaced exports to avoid conflicts
export {
  useSelectOptionsStore,
  registerColumn as registerSelectColumn,
  unregisterColumn as unregisterSelectColumn,
  getColumnConfig as getSelectColumnConfig,
  type SelectColumnConfig,
  type SelectOptionsRegistry,
} from './store/select.store';
export {
  useDatePickerStore,
  registerColumn as registerDatePickerColumn,
  getColumnConfig as getDatePickerColumnConfig,
  type DatePickerColumnConfig,
} from './store/datepicker.store';

// Utils
export * from './utils';
export * from './utils/afterChange';
export {
  createContextMenu,
  createNewRow,
  deleteRow,
  duplicateRow,
  getTableDataAsObjects,
  type ContextMenuOptions,
} from './utils/contextMenu';

// Validation utilities
export {
  clearCellError,
  clearCellErrorRange,
  clearCellHighlights,
  highlightInvalidCellsBulletproof,
  highlightRowErrorById,
  validateDate,
  validateNumericValue,
  validateContainerISO,
  isEmpty,
  addErrorClass,
  removeErrorClass,
  getColumnIndexBulletproof,
  ERROR_CELL_CLASS,
  type ValidationResult,
  type CellError,
  type DetailedValidationResult,
} from './utils/validation';

// Bulk operations utilities
export {
  handleBulkOperations,
  createEmptyRow,
  clearRowField,
  clearRowFields,
  batchUpdateCells,
  duplicateRowAt,
  deleteRowsByIndices,
  getSelectedRowIndices,
  getSelectedRowsData,
  colorSelectedRows,
} from './utils/bulkOperations';

// Autofill handler
export {
  createAutofillHandler,
  useAutofillHandler,
  type AutofillHandlerOptions,
} from './utils/autofillHandler';

// Hooks
export {
  useColumnConfig,
  useColumnResize,
} from './hooks';

// Components
export * from './components/common';
export {
  createSelectSimpleColumn,
  type SelectCellProps,
  type SelectSimpleRendererProps,
} from './components/selectSimpleRender';
export {
  createDatePickerColumn,
  formatDateForDisplay,
  validateDateInput,
  type DatePickerRendererProps,
  type DatePickerCellProps,
} from './components/datePickerRenderer';
export {
  createStatusRowColumn,
  setRowStatus,
  getRowStatus,
} from './components/statusRow';
export type { StatusRowColumnProps } from './components/statusRow';

// UI Components
export { TableContainer, type TableContainerProps } from './components/TableContainer';
export { ColumnConfig } from './components/ColumnConfig';
export { ColorPicker, type ColorPickerProps } from './components/ColorPicker';
export { DuplicateMultiRow, type DuplicateMultiRowProps } from './components/DuplicateMultiRow';
export { SelectCountRow, type SelectCountRowProps } from './components/SelectCountRow';

// Config
export * from './config/tableConfig';

// Helpers - Easy-to-use functions (recommended for most users)
export * from './helpers';

// Initialization
export { initHandsontable } from './init';

// Styles are imported automatically via tableConfig
// Import them in your app: import 'handsontable-editor/dist/styles.css';

