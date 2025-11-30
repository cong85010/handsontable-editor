export enum TYPE_ROW {
  EDITING = 'EDITING',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
}

export interface TableConfig {
  readonly height: number | 'auto';
  readonly licenseKey: string;
}

export interface KeyValueOption {
  key: string;
  value: string;
  description?: string;
}

export interface ProvinceType {
  value: string;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectOptionProps {
  rowIndex: number;
  column: string;
  options: SelectOption[];
  title: string;
  api?: () => Promise<SelectOption[]>;
  dependentOn?: string;
  getOptions?: (parentValue?: string | number) => Promise<SelectOption[]> | SelectOption[];
}

export interface SelectCellProps {
  value: any;
  row: number;
  prop: string;
  instance: any;
  data: string;
  title: string;
  options: any[];
  onCustomSelect: (data: any) => void;
  isLoading: boolean;
  disabled: boolean;
  dependentOn?: string;
  getOptions?: (parentValue?: string | number) => Promise<any[]> | any[];
  allowAddNew?: boolean;
  idField: string;
}

export interface SelectColumnProps {
  data: string;
  title: string;
  width: number;
  options: SelectOption[];
  onCustomSelect: (data: any) => void;
  isLoading: boolean;
  getOptions?: (parentValue?: string | number) => Promise<any[]> | any[];
  disabled?: boolean;
  dependentOn?: string;
  allowAddNew?: boolean;
  idField: string;
}

export interface CreateTableSettingsProps {
  data: any[];
  columns: any[];
  afterChange: any;
  beforeValidate: any;
  nestedHeaders?: any[];
  colHeaders?: any[];
  afterGetColHeader?: any;
  afterColumnMove?: (
    movedColumns: number[],
    finalIndex: number,
    dropIndex: number | undefined,
    movePossible: boolean,
    orderChanged: boolean,
  ) => void;
  afterAutofill?: (fillData: any[][], sourceRange: any, targetRange: any, direction: string) => void;
  classNameMore?: string;
  manualColumnResize?: boolean | number[];
  afterColumnResize?: (newSize: number, column: number) => void;
}

export interface CustomBorders {
  row: number;
  col: number;
  start?: { width: number; color: string };
  end?: { width: number; color: string };
  top?: { width: number; color: string };
  bottom?: { width: number; color: string };
}

export interface ActionColumnProps {
  data: string;
  title: string;
  icon: string;
  color: string;
  onClick: (rowIndex: number) => void;
  isPhysicalRow?: boolean;
}

