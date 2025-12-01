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

// Config
export * from './config/tableConfig';

// Helpers - Easy-to-use functions (recommended for most users)
export * from './helpers';

// Initialization
export { initHandsontable } from './init';

// Styles are imported automatically via tableConfig
// Import them in your app: import 'handsontable-editor/dist/styles.css';

