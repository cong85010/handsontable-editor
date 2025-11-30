import { ActionColumnProps } from '../types';

export const createCommonColumn = (data: string, title: string, width: number, options: any = {}) => ({
  data,
  title,
  width,
  className: 'htCenter',
  readOnly: true,
  editor: false,
  filter: false,
  allowInvalid: false,
  ...options,
});

export const createActionColumn = ({ data, title, icon, color, onClick, isPhysicalRow = false }: ActionColumnProps) => {
  return {
    data,
    type: 'text',
    width: 40,
    className: 'htCenter',
    renderer: (instance: any, td: any, row: number) => {
      td.innerHTML = `<button title="${title}" class="text-${color}-500 text-lg bg-transparent border-none cursor-pointer text-center w-full h-full">${icon}</button>`;
      td.onclick = (e: any) => {
        e.stopPropagation();
        let realRow = -1;
        if (isPhysicalRow && instance?.toPhysicalRow) {
          try {
            realRow = instance.toPhysicalRow(row);
          } catch (error) {
            console.warn('Failed to convert to physical index, using visual index:', error);
          }
        } else {
          realRow = row;
        }

        onClick(realRow);
      };
      return td;
    },
    filter: false,
    readOnly: true,
    editor: false,
    title,
    allowInvalid: false,
  };
};

export const createTextColumn = ({
  data,
  title,
  width = 150,
  readOnly,
  editor = 'text',
  allowInvalid = true,
  renderer,
  className = '',
}: {
  data: string;
  title: string;
  width?: number;
  readOnly?: boolean | undefined;
  editor?: string | boolean;
  allowInvalid?: boolean;
  renderer?: (instance: any, td: any, row: number, col: number, prop: any, value: any) => void;
  className?: string;
}) => ({
  data,
  type: 'text',
  width,
  className,
  title,
  editor,
  allowInvalid,
  readOnly,
  renderer,
});

export const createNumericColumn = (data: string, title: string, width: number = 120) => ({
  data,
  type: 'numeric',
  width,
  className: 'htNumeric',
  title,
  editor: 'numeric',
  numericFormat: {
    pattern: '#,##0',
    culture: 'en-US',
  },
  allowInvalid: true,
  allowEmpty: true,
});

export const createBooleanColumn = (data: string, title: string, width: number = 100) => ({
  data,
  type: 'checkbox',
  width,
  className: 'htCenter',
  title,
  allowInvalid: true,
});

