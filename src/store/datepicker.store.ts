import { Dayjs } from 'dayjs';
import { create } from 'zustand';

export interface DatePickerColumnConfig {
  format?: string;
  showTime?: boolean;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  disabledDate?: (current: Dayjs) => boolean;
  onDateChange?: (date: Dayjs | null, dateString: string, rowIndex: number, column: string) => void;
}

interface DatePickerStoreState {
  columnConfigs: Record<string, DatePickerColumnConfig>;
  registerColumn: (columnName: string, config: DatePickerColumnConfig) => void;
  getColumnConfig: (columnName: string) => DatePickerColumnConfig | undefined;
}

export const useDatePickerStore = create<DatePickerStoreState>((set, get) => ({
  columnConfigs: {},
  registerColumn: (columnName: string, config: DatePickerColumnConfig) => {
    set((state) => ({
      columnConfigs: {
        ...state.columnConfigs,
        [columnName]: config,
      },
    }));
  },
  getColumnConfig: (columnName: string) => {
    return get().columnConfigs[columnName];
  },
}));

