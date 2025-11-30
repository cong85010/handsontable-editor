import { DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/vi_VN';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useRef, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useDatePickerStore } from '../store/datepicker.store';
import { removeSpanTitle } from '../utils';

export interface DatePickerRendererProps {
  data: string;
  title: string;
  width?: number;
  format?: string;
  showTime?: boolean;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  disabledDate?: (current: Dayjs) => boolean;
  onDateChange?: (date: Dayjs | null, dateString: string, rowIndex: number, column: string) => void;
}

export interface DatePickerCellProps {
  value: any;
  row: number;
  prop: string;
  instance: any;
  initialOpen?: boolean;
}

const DATE_ONLY_FORMAT = 'DD/MM/YYYY';
const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';
const DEFAULT_WIDTH = 150;
const DEFAULT_PLACEHOLDER = 'Chọn ngày';
const Z_INDEX = 9999;

const cellStyles = {
  datePicker: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    boxShadow: 'none',
  },
  popup: {
    zIndex: Z_INDEX,
  },
  container: (disabled: boolean) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#edf2fa' : 'transparent',
  }),
} as const;

const MEMOIZED_LOCALE = {
  ...locale,
  lang: {
    ...locale.lang,
    ok: 'Xác nhận',
  },
};

const parseDateValue = (value: any): Dayjs | null => {
  if (!value || value === '') return null;

  const parsedDate = dayjs(value, DATE_ONLY_FORMAT, true);
  if (parsedDate.isValid()) {
    return parsedDate;
  }

  const parsedDateTime = dayjs(value, DATE_TIME_FORMAT, true);
  if (parsedDateTime.isValid()) {
    return parsedDateTime;
  }

  const alternativeFormats = [
    'DD/MM/YYYY HH:mm:ss',
    'DD/MM/YYYY',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD',
    'MM/DD/YYYY HH:mm:ss',
    'MM/DD/YYYY',
  ];

  for (const format of alternativeFormats) {
    const parsed = dayjs(value, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }

  return null;
};

const DatePickerCell = React.memo(
  ({ value, row, prop, instance, initialOpen = false }: DatePickerCellProps) => {
    const columnConfig = useDatePickerStore(useCallback((state) => state.columnConfigs[prop], [prop]));

    const {
      showTime = false,
      disabled = false,
      placeholder = DEFAULT_PLACEHOLDER,
      allowClear = true,
      disabledDate,
      onDateChange,
    } = columnConfig || {};

    const datePickerRef = useRef<any>(null);
    const [isOpen, setIsOpen] = useState(initialOpen);

    const dateFormat = useMemo(() => (showTime ? DATE_TIME_FORMAT : DATE_ONLY_FORMAT), [showTime]);

    const currentValue = useMemo(() => {
      return instance.getDataAtRowProp(row, prop);
    }, [instance, row, prop, value, isOpen]);

    const dateValue = useMemo(() => parseDateValue(currentValue), [currentValue]);

    const handleDateChange = useCallback(
      (date: Dayjs | null, dateString: string | string[]) => {
        const newValue = date ? date.format(dateFormat) : '';
        instance.setDataAtRowProp(row, prop, newValue);

        const currentTypeRow = instance.getDataAtRowProp(row, 'typeRow');
        if (!currentTypeRow) {
          instance.setDataAtRowProp(row, 'typeRow', 'EDITING');
        }

        if (onDateChange) {
          const dateStringValue = Array.isArray(dateString) ? dateString[0] || '' : dateString;
          onDateChange(date, dateStringValue, row, prop);
        }
      },
      [instance, row, prop, dateFormat, onDateChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && allowClear) {
            handleDateChange(null, '');
          }
        }
      },
      [disabled, allowClear, handleDateChange, isOpen],
    );

    const datePickerProps = useMemo(
      () => ({
        ref: datePickerRef,
        value: dateValue,
        onChange: handleDateChange,
        format: dateFormat,
        showTime,
        disabled,
        placeholder,
        allowClear: allowClear,
        disabledDate,
        style: cellStyles.datePicker,
        popupStyle: cellStyles.popup,
        locale: MEMOIZED_LOCALE,
        inputReadOnly: true,
        suffixIcon: null,
        clearIcon: null,
      }),
      [dateValue, handleDateChange, dateFormat, showTime, disabled, placeholder, disabledDate, allowClear],
    );

    const handleOpenChange = useCallback((open: boolean) => {
      if (!open) {
        setIsOpen(false);
      }
    }, []);

    return (
      <div style={cellStyles.container(disabled)} onKeyDown={handleKeyDown} tabIndex={disabled ? -1 : 0}>
        <DatePicker {...datePickerProps} open={isOpen} onOpenChange={handleOpenChange} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.row === nextProps.row &&
      prevProps.prop === nextProps.prop &&
      prevProps.instance === nextProps.instance &&
      prevProps.initialOpen === nextProps.initialOpen
    );
  },
);

DatePickerCell.displayName = 'DatePickerCell';

export function createDatePickerColumn({
  data,
  title,
  width = DEFAULT_WIDTH,
  format,
  showTime = false,
  disabled = false,
  allowClear = true,
  disabledDate,
  onDateChange,
}: DatePickerRendererProps) {
  useDatePickerStore.getState().registerColumn(data, {
    format,
    showTime,
    disabled,
    placeholder: `Chọn ${removeSpanTitle(title)}`,
    allowClear,
    disabledDate,
    onDateChange,
  });

  return {
    data,
    type: 'text',
    width,
    className: '',
    readOnly: disabled,
    editor: false,
    title,
    renderer: (instance: any, td: any, row: number, _col: number, prop: any, value: any) => {
      if (!td._isActive) {
        td.innerHTML = '';
        td.style.position = 'relative';
        td.style.cursor = disabled ? 'not-allowed' : 'pointer';
        td.style.backgroundColor = disabled ? '#edf2fa' : 'transparent';

        if (!value) {
          const placeholderText = `Chọn ${removeSpanTitle(title)}`;
          const placeholderSpan = document.createElement('span');
          placeholderSpan.textContent = placeholderText;
          placeholderSpan.style.color = '#bfbfbf';
          placeholderSpan.style.fontStyle = 'normal';
          td.appendChild(placeholderSpan);
        } else {
          const textNode = document.createTextNode(value);
          td.appendChild(textNode);
        }

        const handleDoubleClick = () => {
          if (disabled) return;

          td._isActive = true;
          td.innerHTML = '';

          const container = document.createElement('div');
          container.style.width = '100%';
          container.style.height = '100%';
          td.appendChild(container);

          const root = createRoot(container);
          root.render(<DatePickerCell value={value} row={row} prop={prop} instance={instance} initialOpen={true} />);

          td._datePickerRoot = root;
        };

        td.removeEventListener('dblclick', td._handleDoubleClick);
        td._handleDoubleClick = handleDoubleClick;
        td.addEventListener('dblclick', handleDoubleClick);

        return td;
      }

      if (td._datePickerRoot) {
        td._datePickerRoot.render(<DatePickerCell value={value} row={row} prop={prop} instance={instance} />);
      }

      return td;
    },
    afterDestroy: (_instance: any, td: any) => {
      if (td) {
        if (td._datePickerRoot) {
          td._datePickerRoot.unmount();
          delete td._datePickerRoot;
        }
        if (td._handleDoubleClick) {
          td.removeEventListener('dblclick', td._handleDoubleClick);
          delete td._handleDoubleClick;
        }
        delete td._isActive;
      }
    },
  };
}

export const formatDateForDisplay = (value: any, format: string = DATE_ONLY_FORMAT): string => {
  if (!value) return '';

  const date = dayjs(value);
  return date.isValid() ? date.format(format) : '';
};

export const validateDateInput = (value: any): boolean => {
  if (!value) return true;
  return dayjs(value).isValid();
};

