import { Dayjs } from 'dayjs';

export interface DatePickerColumnConfig {
  format?: string;
  showTime?: boolean;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  disabledDate?: (current: Dayjs) => boolean;
  onDateChange?: (date: Dayjs | null, dateString: string, rowIndex: number, column: string) => void;
}

/**
 * Module-level registry for date picker column configurations
 * This stores configuration for each date picker column by its data key
 */
const datePickerColumnConfigs: Record<string, DatePickerColumnConfig> = {};

/**
 * Register a date picker column configuration
 */
export const registerColumn = (columnName: string, config: DatePickerColumnConfig): void => {
  datePickerColumnConfigs[columnName] = config;
};

/**
 * Get configuration for a date picker column
 */
export const getColumnConfig = (columnName: string): DatePickerColumnConfig | undefined => {
  return datePickerColumnConfigs[columnName];
};

/**
 * Store interface for backwards compatibility
 * @deprecated Use the direct functions instead
 */
export const useDatePickerStore = {
  getState: () => ({
    columnConfigs: datePickerColumnConfigs,
    registerColumn,
    getColumnConfig,
  }),
};

