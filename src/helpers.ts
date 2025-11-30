/**
 * Helper functions to make the library easier to use
 */

import { SelectOption } from './types';
import { createSelectSimpleColumn, SelectSimpleRendererProps } from './components/selectSimpleRender';
import { createDatePickerColumn } from './components/datePickerRenderer';
import {
  createTextColumn,
  createNumericColumn,
  createBooleanColumn,
  createCommonColumn,
  createActionColumn,
} from './components/common';
import { createTableSettings } from './config/tableConfig';
import { useAfterChange, UseAfterChangeOptions } from './utils/afterChange';

/**
 * Simplified select column - just pass options array
 */
export const createSelectColumn = (
  data: string,
  idField: string,
  title: string,
  options: SelectOption[] | (() => Promise<SelectOption[]>),
  width: number = 150
) => {
  const getOptions = Array.isArray(options) 
    ? async () => options 
    : options;

  return createSelectSimpleColumn({
    data,
    idField,
    title,
    width,
    getOptions,
    allowClear: true,
  });
};

/**
 * Simplified date column
 */
export const createDateColumn = (
  data: string,
  title: string,
  width: number = 150,
  format: string = 'DD/MM/YYYY',
  showTime: boolean = false
) => {
  return createDatePickerColumn({
    data,
    title,
    width,
    format,
    showTime,
    allowClear: true,
  });
};

/**
 * Quick table setup - everything in one function
 */
export interface QuickTableOptions<T = any> {
  data: T[];
  columns: any[];
  onDataChange?: (newData: T[]) => void;
  idFieldMap?: Record<string, string>;
  fieldDependencies?: Record<string, string[]>;
  hotInstanceRef?: { current?: { hotInstance?: any } };
  [key: string]: any;
}

export const createQuickTable = <T extends Record<string, any>>({
  data,
  columns,
  onDataChange,
  idFieldMap,
  fieldDependencies,
  hotInstanceRef,
  ...restSettings
}: QuickTableOptions<T>) => {
  const afterChange = useAfterChange({
    columns,
    data,
    setData: onDataChange || (() => {}),
    hotInstance: hotInstanceRef?.current?.hotInstance,
    idFieldMap,
    fieldDependencies,
    useBatchedChanges: !!hotInstanceRef,
  });

  return createTableSettings({
    data,
    columns,
    afterChange,
    beforeValidate: () => true,
    ...restSettings,
  });
};

/**
 * Column presets for common use cases
 */
export const ColumnPresets = {
  /**
   * ID column (read-only)
   */
  id: (data: string = 'id', title: string = 'ID', width: number = 80) =>
    createCommonColumn(data, title, width),

  /**
   * Name column (editable text)
   */
  name: (data: string = 'name', title: string = 'Name', width: number = 200) =>
    createTextColumn({
      data,
      title,
      width,
      readOnly: false,
    }),

  /**
   * Price column (numeric with formatting)
   */
  price: (data: string = 'price', title: string = 'Price', width: number = 120) =>
    createNumericColumn(data, title, width),

  /**
   * Quantity column (numeric)
   */
  quantity: (data: string = 'quantity', title: string = 'Quantity', width: number = 120) =>
    createNumericColumn(data, title, width),

  /**
   * Active/Status column (checkbox)
   */
  active: (data: string = 'isActive', title: string = 'Active', width: number = 100) =>
    createBooleanColumn(data, title, width),

  /**
   * Created date column
   */
  createdDate: (data: string = 'createdDate', title: string = 'Created Date', width: number = 150) =>
    createDateColumn(data, title, width, 'DD/MM/YYYY', false),

  /**
   * Updated date column (with time)
   */
  updatedDate: (data: string = 'updatedDate', title: string = 'Updated Date', width: number = 180) =>
    createDateColumn(data, title, width, 'DD/MM/YYYY HH:mm', true),
};

/**
 * Common column combinations
 */
export const ColumnGroups = {
  /**
   * Basic CRUD columns: ID, Name, Active
   */
  basic: (nameField: string = 'name', idField: string = 'id') => [
    ColumnPresets.id(idField),
    ColumnPresets.name(nameField),
    ColumnPresets.active(),
  ],

  /**
   * Product columns: ID, Name, Price, Quantity, Active
   */
  product: (nameField: string = 'name', priceField: string = 'price', quantityField: string = 'quantity') => [
    ColumnPresets.id(),
    ColumnPresets.name(nameField),
    ColumnPresets.price(priceField),
    ColumnPresets.quantity(quantityField),
    ColumnPresets.active(),
  ],

  /**
   * Timestamp columns: Created Date, Updated Date
   */
  timestamps: (createdField: string = 'createdDate', updatedField: string = 'updatedDate') => [
    ColumnPresets.createdDate(createdField),
    ColumnPresets.updatedDate(updatedField),
  ],
};

// Re-export everything for convenience (excluding types to avoid conflicts)
export * from './components/common';
export {
  createSelectSimpleColumn,
  type SelectSimpleRendererProps,
} from './components/selectSimpleRender';
export {
  createDatePickerColumn,
  type DatePickerRendererProps,
} from './components/datePickerRenderer';
export * from './config/tableConfig';
export * from './utils/afterChange';
export * from './constants';
export * from './utils';

