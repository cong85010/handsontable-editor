import { create } from 'zustand';
import { SelectOption } from '../types';

export interface SelectOptionsRegistry {
  [columnKey: string]: {
    getOptions?: (parentValue?: string | number) => Promise<SelectOption[]>;
    disabled?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    idField?: string;
    onChange?: (instance: any, row: number, value?: string, options?: any) => void;
    allowAddNew?: boolean;
    dependentOn?: string;
  };
}

export interface SelectOptionsStore {
  registry: SelectOptionsRegistry;
  registerColumn: (columnKey: string, config: SelectOptionsRegistry[string]) => void;
  unregisterColumn: (columnKey: string) => void;
  getColumnConfig: (columnKey: string) => SelectOptionsRegistry[string] | undefined;
}

export const useSelectOptionsStore = create<SelectOptionsStore>((set, get) => ({
  registry: {},
  registerColumn: (columnKey, config) => {
    set((state) => ({
      registry: {
        ...state.registry,
        [columnKey]: config,
      },
    }));
  },
  unregisterColumn: (columnKey) => {
    set((state) => {
      const { [columnKey]: removed, ...rest } = state.registry;
      return { registry: rest };
    });
  },
  getColumnConfig: (columnKey) => {
    return get().registry[columnKey];
  },
}));

