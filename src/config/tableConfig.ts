import { HotTableProps } from '@handsontable/react-wrapper';
import { TABLE_CONFIG } from '../constants';
import { CreateTableSettingsProps } from '../types';

export interface TableSettingsConfig {
  height: number | 'auto';
  licenseKey: string;
  stretchH: 'all' | 'none';
  filters: boolean;
  columnSorting: boolean;
  search: boolean;
  rowHeights: number;
  autoWrapCol: boolean;
  autoWrapRow: boolean;
  manualColumnResize: boolean;
  manualColumnMove: boolean;
  autoRowSize: boolean;
  autoColumnSize: boolean;
  renderAllColumns: boolean;
  renderAllRows: boolean;
  preventOverflow: 'horizontal' | 'vertical';
  outsideClickDeselects: boolean;
  minSpareRows: number;
  minSpareCols: number;
  columnHeaderHeight: number;
}

export const DEFAULT_TABLE_SETTINGS: TableSettingsConfig = {
  height: TABLE_CONFIG.height,
  licenseKey: TABLE_CONFIG.licenseKey,
  stretchH: 'all',
  filters: true,
  columnSorting: true,
  search: false,
  rowHeights: 40,
  autoWrapCol: false,
  autoWrapRow: false,
  manualColumnResize: true,
  manualColumnMove: false,
  autoRowSize: false,
  autoColumnSize: false,
  renderAllColumns: true,
  renderAllRows: false,
  preventOverflow: 'horizontal',
  outsideClickDeselects: false,
  minSpareRows: 0,
  minSpareCols: 0,
  columnHeaderHeight: 40,
};

export const createTableSettings = ({
  data,
  columns,
  afterChange,
  beforeValidate,
  nestedHeaders,
  colHeaders,
  afterGetColHeader,
  afterColumnMove,
  afterAutofill,
  classNameMore,
  manualColumnResize,
  afterColumnResize,
  contextMenu,
}: CreateTableSettingsProps): HotTableProps => ({
  ...(nestedHeaders ? { nestedHeaders } : { colHeaders }),
  data,
  columns: columns || [],
  rowHeaders: false,
  height: DEFAULT_TABLE_SETTINGS.height,
  licenseKey: DEFAULT_TABLE_SETTINGS.licenseKey,
  afterChange,
  stretchH: DEFAULT_TABLE_SETTINGS.stretchH,
  filters: DEFAULT_TABLE_SETTINGS.filters,
  columnSorting: DEFAULT_TABLE_SETTINGS.columnSorting,
  width: '100%',
  search: DEFAULT_TABLE_SETTINGS.search,
  rowHeights: DEFAULT_TABLE_SETTINGS.rowHeights,
  autoWrapCol: DEFAULT_TABLE_SETTINGS.autoWrapCol,
  autoWrapRow: DEFAULT_TABLE_SETTINGS.autoWrapRow,
  manualColumnResize: manualColumnResize !== undefined ? manualColumnResize : DEFAULT_TABLE_SETTINGS.manualColumnResize,
  manualColumnMove: DEFAULT_TABLE_SETTINGS.manualColumnMove,
  manualColumnFreeze: true,
  autoRowSize: DEFAULT_TABLE_SETTINGS.autoRowSize,
  fillHandle: { direction: 'vertical' as const },
  className: `custom-table-advanced ${classNameMore || ''}`,
  columnHeaderHeight: DEFAULT_TABLE_SETTINGS.columnHeaderHeight,
  outsideClickDeselects: DEFAULT_TABLE_SETTINGS.outsideClickDeselects,
  minSpareRows: DEFAULT_TABLE_SETTINGS.minSpareRows,
  minSpareCols: DEFAULT_TABLE_SETTINGS.minSpareCols,
  autoColumnSize: DEFAULT_TABLE_SETTINGS.autoColumnSize,
  renderAllColumns: DEFAULT_TABLE_SETTINGS.renderAllColumns,
  renderAllRows: DEFAULT_TABLE_SETTINGS.renderAllRows,
  viewportRowRenderingOffset: 'auto',
  viewportColumnRenderingOffset: 'auto',
  beforeValidate,
  dropdownMenu: ['filter_by_value', 'filter_action_bar'],
  afterGetColHeader,
  afterColumnMove,
  afterAutofill,
  afterColumnResize,
  hiddenColumns: {
    copyPasteEnabled: true,
    indicators: false,
    columns: [],
  },
  currentRowClassName: 'current-row',
  ...(contextMenu ? { contextMenu } : {}),
});

