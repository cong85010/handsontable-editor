import React from 'react';
import dayjs, { Dayjs } from 'dayjs';

// Yield to main thread utility based on web.dev optimization guidelines
export const yieldToMain = () => {
  if ((globalThis as any).scheduler?.yield) {
    return (globalThis as any).scheduler.yield();
  }

  // Fall back to yielding with setTimeout
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

// Custom renderer for action column
export const renderTypeRow = (
  instance: any,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: string | null,
) => {
  switch (value) {
    case 'CREATE':
      td.innerHTML = `
        <span class="flex items-center gap-1 justify-center" title="Tạo mới">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </span>
      `;
      break;
    case 'EDITING':
      td.innerHTML = `
        <span class="flex items-center gap-1 justify-center" title="Chỉnh sửa">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </span>
      `;
      break;
    case 'DELETE':
      td.innerHTML = `
        <span class="flex items-center gap-1 justify-center" title="Xóa">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
      `;
      break;
    default:
      td.innerHTML = '';
  }

  td.onkeydown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      instance.setDataAtRowProp(row, prop, null);
    }
  };
  return td;
};

export const renderCustomSelectCell = (
  label: string,
  valueId: string | number,
  placeholder: string,
  onClick: (e: any) => void,
) => {
  return (td: any) => {
    td.innerHTML = label || placeholder;
    td.setAttribute('data-value', valueId);
    td.ondblclick = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    };
    return td;
  };
};

export const removeColumnMenuButton = (
  col: number,
  TH: { querySelector: (value: string) => any; textContent?: string | null },
) => {
  const headerText = TH.textContent?.trim();
  if (headerText && col > 0) return;

  const button = TH.querySelector('.changeType');
  if (button) {
    button.parentElement?.removeChild(button);
  }
};

export const makeLabelHybrid = (label: string, { required }: { required?: boolean } = {}) => {
  if (required) {
    return ` ${label} <span style="color: red;">*</span>`;
  }
  return label;
};

// Tooltip event handlers
export const createTooltipHandlers = (hotTableRef: React.RefObject<any>) => {
  let tooltip: HTMLElement = document.querySelector('.handsontable-tooltip') as HTMLElement;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const afterOnCellMouseOver = (e: any, coords: any, TD: HTMLElement) => {
    if (coords.row < 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const instance = hotTableRef.current?.hotInstance;
      if (!instance) {
        console.warn('Handsontable instance not found');
        return;
      }

      const column = instance.getSettings()?.columns?.[coords.col];
      let tooltipText = column?.title;

      if (tooltipText) {
        timeoutId = setTimeout(() => {
          if (tooltip) {
            tooltip.innerHTML = tooltipText;
            tooltip.style.visibility = 'visible';

            const rect = TD.getBoundingClientRect();
            tooltip.style.left = `${rect.left + 10}px`;
            tooltip.style.top = `${rect.top - 30}px`;
          }
        }, 500);
      }
    }
  };

  const afterOnCellMouseOut = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (tooltip) {
      tooltip.style.visibility = 'hidden';
    }
  };

  return {
    afterOnCellMouseOver,
    afterOnCellMouseOut,
  };
};

export const unlistenKeyboardEvent = (hotTableRef: React.RefObject<any>) => {
  if (!hotTableRef?.current?.hotInstance) return;
  const hotInstance = hotTableRef.current.hotInstance;
  hotInstance.unlisten();
};

export const listenKeyboardEvent = (hotTableRef: React.RefObject<any>) => {
  if (!hotTableRef?.current?.hotInstance) return;
  const hotInstance = hotTableRef.current.hotInstance;
  hotInstance.listen();
};

// Date formatting utilities
const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY HH:mm:ss';
const DATE_FULL_TIME_ISO = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

export const formatDate = (date?: string | null | Dayjs, format: string = DEFAULT_DATE_FORMAT) => {
  try {
    if (!date) {
      return '-';
    }

    if (typeof date === 'string') {
      if (!dayjs(date, DATE_FULL_TIME_ISO).isValid()) {
        return '-';
      }
      return dayjs(date, DATE_FULL_TIME_ISO).format(format);
    }

    if (typeof date === 'object') {
      return date?.format(format);
    }

    return '-';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

// Remove accents from Vietnamese text
export const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Sort options utility
export const sortOptionsByField = <T extends { [key: string]: any }>(
  options: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc',
) => {
  return options.sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export function sortOptions<T extends { [key: string]: any }>(
  options: T[],
  nameField: keyof T = 'label',
  order: 'asc' | 'desc' = 'asc',
  field: keyof T = 'disabled',
): T[] {
  if (!Array.isArray(options)) return [];
  const enabled = sortOptionsByField(
    options.filter((opt) => !opt[field]),
    nameField,
    order,
  );
  const disabled = sortOptionsByField(
    options.filter((opt) => !!opt[field]),
    nameField,
    order,
  );
  return [...enabled, ...disabled];
}

// Default filter option for Ant Design Select
export const defaultFilterOption = (input: string, option: any) => {
  if (!option?.label) return false;
  const normalizedInput = removeAccents(input.toLowerCase());
  const normalizedLabel = typeof option.label === 'string' ? removeAccents(option.label.toLowerCase()) : '';
  return normalizedLabel.includes(normalizedInput);
};

// Remove span tags from title
export const removeSpanTitle = (title: string) => {
  return title.replace(/<span.*?<\/span>/g, '');
};

