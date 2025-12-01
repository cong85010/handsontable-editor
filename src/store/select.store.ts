import { SelectOption } from '../types';

export interface SelectColumnConfig {
  getOptions?: (parentValue?: string | number) => Promise<SelectOption[]>;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  idField?: string;
  onChange?: (instance: any, row: number, value?: string, options?: any) => void;
  allowAddNew?: boolean;
  dependentOn?: string;
}

export interface SelectOptionsRegistry {
  [columnKey: string]: SelectColumnConfig;
}

/**
 * Module-level registry for select column configurations
 * This stores configuration for each select column by its data key
 */
const selectOptionsRegistry: SelectOptionsRegistry = {};

/**
 * Register a select column configuration
 */
export const registerColumn = (columnKey: string, config: SelectColumnConfig): void => {
  selectOptionsRegistry[columnKey] = config;
};

/**
 * Unregister a select column configuration
 */
export const unregisterColumn = (columnKey: string): void => {
  delete selectOptionsRegistry[columnKey];
};

/**
 * Get configuration for a select column
 */
export const getColumnConfig = (columnKey: string): SelectColumnConfig | undefined => {
  return selectOptionsRegistry[columnKey];
};

/**
 * Store interface for backwards compatibility
 * @deprecated Use the direct functions instead
 */
export const useSelectOptionsStore = {
  getState: () => ({
    registry: selectOptionsRegistry,
    registerColumn,
    unregisterColumn,
    getColumnConfig,
  }),
};

