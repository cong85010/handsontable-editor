import { SelectOption } from '../types';
import { OPTIONS_ADD_NEW_PREFIX } from '../constants';
import { Button, Divider, Flex, Form, Input, Select, Spin, Tooltip, Typography } from 'antd';
import { ChevronDown, ChevronUp, List, Plus, RefreshCcw, Search, X } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSelectOptionsStore } from '../store/select.store';
import { defaultFilterOption, removeSpanTitle, sortOptions } from '../utils';

export interface SelectCellProps {
  value: string | undefined;
  row: number;
  prop: string;
  instance: any;
  initialOpen?: boolean;
  ReactQueryProvider?: React.ComponentType<{ children: React.ReactNode }>;
  useQuery?: (options: {
    queryKey: any[];
    queryFn: () => Promise<SelectOption[]>;
    enabled?: boolean;
    staleTime?: number;
    defaultValue?: any[];
    select?: (data: any) => any;
  }) => {
    data: any;
    isFetching: boolean;
    isLoading: boolean;
  };
  invalidate?: (options: { queryKey: any[] }) => void;
}

export interface SelectSimpleRendererProps {
  data: string;
  idField: string;
  title: string;
  width?: number;
  getOptions?: () => Promise<SelectOption[]>;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  allowAddNew?: boolean;
  dependentOn?: string;
  onChange?: (instance: any, row: number, value?: string, options?: SelectOption[]) => void;
  ReactQueryProvider?: React.ComponentType<{ children: React.ReactNode }>;
  useQuery?: (options: {
    queryKey: any[];
    queryFn: () => Promise<SelectOption[]>;
    enabled?: boolean;
    staleTime?: number;
    defaultValue?: any[];
    select?: (data: any) => any;
  }) => {
    data: any;
    isFetching: boolean;
    isLoading: boolean;
  };
  invalidate?: (options: { queryKey: any[] }) => void;
}

const DEFAULT_WIDTH = 150;
const DEFAULT_PLACEHOLDER = 'Chọn';
const Z_INDEX = 9999;

const cellStyles = {
  container: (disabled: boolean) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#edf2fa' : 'transparent',
  }),
  select: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    boxShadow: 'none',
  },
  popup: {
    zIndex: Z_INDEX,
  },
};

const SelectCell = React.memo(
  ({ value: labelShow, row, prop, instance, initialOpen = false, ReactQueryProvider, useQuery, invalidate }: SelectCellProps) => {
    const getColumnConfig = useSelectOptionsStore((state) => state.getColumnConfig);
    const columnConfig = getColumnConfig(prop);
    const [form] = Form.useForm<{ newLabel: string }>();

    const {
      getOptions,
      disabled = false,
      placeholder = DEFAULT_PLACEHOLDER,
      allowClear = false,
      idField,
      allowAddNew,
      dependentOn,
      onChange,
    } = columnConfig || {};
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadAll, setIsLoadAll] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const selectRef = useRef<any>(null);
    const inputRef = useRef<any>(null);
    const searchInputRef = useRef<any>(null);

    const idValue = useMemo(() => {
      return instance.getDataAtRowProp(row, idField);
    }, [instance, row, idField, isOpen, refreshKey, labelShow]);

    const currentDisplayValue = useMemo(() => {
      return instance.getDataAtRowProp(row, prop);
    }, [instance, row, prop, isOpen, refreshKey, labelShow]);

    const parentValue = useMemo(() => {
      if (!dependentOn) return undefined;
      return instance.getDataAtRowProp(row, dependentOn);
    }, [instance, row, dependentOn, isOpen, refreshKey]);

    const CORE_QUERY_KEY = useMemo(() => ['select-options', String(row), String(prop)], [row, prop]);

    const queryKey = useMemo(() => [...CORE_QUERY_KEY, 'all'], [CORE_QUERY_KEY]);

    // Use provided useQuery hook or fallback to simple fetch
    const queryResult = useQuery
      ? useQuery({
          queryKey,
          queryFn: () => {
            return getOptions?.() || Promise.resolve([]);
          },
          enabled: !!getOptions && isOpen,
          staleTime: 60 * 1000,
          defaultValue: [],
          select: (data: any) => sortOptions(data),
        })
      : {
          data: [],
          isFetching: false,
          isLoading: false,
        };

    const { data: allOptions = [], isFetching, isLoading } = queryResult;

    const displayValue = useMemo(() => {
      if (idValue && String(idValue).startsWith(OPTIONS_ADD_NEW_PREFIX)) {
        return idValue;
      }
      if (allOptions && allOptions.length > 0 && idValue) {
        const optionExists = allOptions.some((opt: SelectOption) => opt.value === idValue);
        return optionExists ? idValue : currentDisplayValue || undefined;
      }
      return currentDisplayValue || undefined;
    }, [idValue, allOptions, currentDisplayValue]);

    const totalOptions = useMemo(() => {
      let processedOptions = (allOptions || []).map((opt: SelectOption & { fwdShortName?: string; fwdId?: string | number }) => {
        let label = opt.label;
        if (isLoadAll && opt.fwdShortName) {
          label = `${opt.label} (${opt.fwdShortName})`;
        }
        return {
          ...opt,
          label,
        };
      });

      if (dependentOn && parentValue && !isLoadAll) {
        processedOptions = processedOptions.filter((opt: any) => {
          return String(opt.fwdId) === String(parentValue) || String(opt.value) === String(idValue);
        });
      }

      const uniqueOptions = processedOptions.filter(
        (opt: SelectOption, index: number, arr: SelectOption[]) =>
          arr.findIndex((item: SelectOption) => String(item.value) === String(opt.value)) === index,
      );

      let newlyAddedOption: SelectOption | null = null;
      if (idValue && currentDisplayValue) {
        const isNewlyAdded = String(idValue).startsWith(OPTIONS_ADD_NEW_PREFIX);
        const existsInOptions = (allOptions || []).some((opt: SelectOption) => String(opt.value) === String(idValue));

        if (isNewlyAdded || (dependentOn && !existsInOptions)) {
          let label = currentDisplayValue;
          if (isNewlyAdded) {
            label = `${currentDisplayValue} (Mới)`;
          } else if (!existsInOptions) {
            label = `${currentDisplayValue} (Nhà xe khác)`;
          }

          newlyAddedOption = {
            value: idValue,
            label,
            disabled: false,
          };
        }
      }

      const filteredOptions = newlyAddedOption
        ? uniqueOptions.filter((opt: SelectOption) => String(opt.value) !== String(newlyAddedOption!.value))
        : uniqueOptions;

      return newlyAddedOption ? [newlyAddedOption, ...filteredOptions] : filteredOptions;
    }, [allOptions, idValue, currentDisplayValue, isLoadAll, dependentOn, parentValue]);

    const options = useMemo(() => {
      if (!searchQuery.trim()) return totalOptions;
      return totalOptions.filter((option: SelectOption) => defaultFilterOption(searchQuery, option));
    }, [totalOptions, searchQuery]);

    const handleChange = useCallback(
      (newValue: string | undefined) => {
        try {
          const originalOption = (allOptions || []).find((opt: SelectOption) => String(opt.value) === String(newValue));
          const label = originalOption?.label || options?.find((opt: SelectOption) => opt.value === newValue)?.label;

          instance.batch(() => {
            instance.setDataAtRowProp(row, idField, newValue);
            instance.setDataAtRowProp(row, prop, label || null);
          });

          if (onChange) {
            onChange(instance, row, newValue, options);
          }
        } catch (error) {
          console.error('Error setting data at row prop:', error);
        }
      },
      [instance, row, prop, options, allOptions, idField, onChange],
    );

    const handleDropdownClose = useCallback(() => {
      setIsOpen(false);
      setSearchQuery('');
      setIsLoadAll(false);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen) return;
        const target = e.target as HTMLElement | null;
        const isCreateNewInput = target?.tagName === 'INPUT' && (target as HTMLInputElement).name === 'newLabel';
        const isSearchInput = target?.tagName === 'INPUT' && (target as HTMLInputElement).name === 'searchQuery';

        if (e.key === 'Enter') {
          if (isCreateNewInput || isSearchInput) {
            e.stopPropagation();
            return;
          }
          e.preventDefault();
          return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          const tag = target?.tagName;
          const isInputLike = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;

          if (isInputLike) {
            const inputValue = (target as HTMLInputElement).value ?? '';
            if (!disabled && allowClear && inputValue.length === 0 && !isSearchInput) {
              e.preventDefault();
              e.stopPropagation();
              handleChange(undefined);
              return;
            }
            e.stopPropagation();
            return;
          }

          e.preventDefault();
          e.stopPropagation();
        }
      },
      [disabled, allowClear, handleChange, isOpen],
    );

    const handleClearValue = useCallback(() => {
      handleChange(undefined);
    }, [handleChange]);

    const selectProps = useMemo(
      () => ({
        ref: selectRef,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        options,
        disabled,
        placeholder,
        allowClear: false,
        defaultActiveFirstOption: false,
        showSearch: false,
        onClear: handleClearValue,
        filterOption: false,
        style: cellStyles.select,
        popupStyle: cellStyles.popup,
        className: 'select-input-custom group',
      }),
      [handleChange, handleKeyDown, options, disabled, placeholder, allowClear, handleClearValue],
    );

    const maxLabelLength = useMemo(() => {
      return (
        totalOptions?.reduce((max: number, option: SelectOption) => {
          const label = typeof option.label === 'string' ? option.label : '';
          return Math.max(max, label.length);
        }, 0) || 0
      );
    }, [totalOptions]);

    const dropdownWidth = useMemo(() => {
      const baseWidth = maxLabelLength * 9 + 40;
      return Math.max(200, Math.min(600, baseWidth));
    }, [maxLabelLength]);

    const handleRefreshOptions = useCallback(() => {
      if (invalidate) {
        invalidate({ queryKey: CORE_QUERY_KEY });
      }
      setSearchQuery('');
    }, [invalidate, CORE_QUERY_KEY]);

    const handleLoadAll = useCallback(() => {
      setIsLoadAll((prev) => !prev);
      setSearchQuery('');
    }, []);

    const handleAddNewOption = useCallback(
      (values: { newLabel: string }) => {
        const newLabel = values.newLabel?.trim();
        if (allowAddNew && newLabel) {
          try {
            const newOptionValue = OPTIONS_ADD_NEW_PREFIX + newLabel;
            instance.batch(() => {
              instance.setDataAtRowProp(row, prop, newLabel);
              instance.setDataAtRowProp(row, idField, newOptionValue);
            });
            setRefreshKey((prev) => prev + 1);
            form.resetFields();
          } catch (error) {
            console.error('Error adding new option:', error);
          }
        }
      },
      [allowAddNew, idField, instance, prop, row, form],
    );

    const cellContent = (
      <div style={cellStyles.container(disabled)} onKeyDown={handleKeyDown} tabIndex={disabled ? -1 : 0} data-id={idField}>
        <Select
          {...selectProps}
          value={displayValue}
          open={isOpen}
          onOpenChange={handleDropdownClose}
          loading={isLoading}
          onDropdownVisibleChange={(open) => {
            if (!open) {
              setIsOpen(false);
            }
          }}
          styles={{
            popup: {
              root: {
                right: 0,
                minWidth: dropdownWidth,
              },
            },
          }}
          suffixIcon={
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', pointerEvents: 'auto' }}>
              {allowClear && (
                <X
                  className='text-gray-400 cursor-pointer hover:text-gray-600 transition-colors !hidden group-hover:!block bg-gray-50 rounded-full'
                  size={14}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearValue();
                  }}
                />
              )}
              {isOpen ? (
                <ChevronUp
                  className='text-gray-500 cursor-pointer hover:text-gray-700 transition-colors rounded-full '
                  size={16}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                />
              ) : (
                <ChevronDown
                  className='text-gray-500 cursor-pointer hover:text-gray-700 transition-colors rounded-full '
                  size={16}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                />
              )}
            </div>
          }
          popupRender={(menu) => (
            <Spin spinning={isFetching}>
              <Input
                ref={searchInputRef}
                placeholder='Tìm kiếm...'
                name='searchQuery'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<Search className='text-gray-400' size={16} />}
                suffix={
                  searchQuery && (
                    <X
                      className='text-gray-400 cursor-pointer hover:text-gray-600 transition-colors'
                      size={14}
                      onClick={() => setSearchQuery('')}
                    />
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    e.preventDefault();
                  }
                }}
                autoFocus
              />
              <Divider style={{ margin: '8px 0' }} />
              <Flex justify='between' align='center' gap={8}>
                <div className='flex flex-col flex-1 text-sm px-2'>
                  {isLoadAll && dependentOn && <span className='text-xs text-blue-600 font-medium'>Tất cả danh sách</span>}
                  <Typography.Text>
                    Danh sách ({options?.length || 0}/{totalOptions?.length || 0})
                  </Typography.Text>
                </div>
                <Flex gap={4}>
                  {dependentOn && parentValue && (
                    <Tooltip title='Tất cả danh sách'>
                      <Button
                        type='text'
                        size='small'
                        icon={<List className='text-green-600 size-4' />}
                        onClick={handleLoadAll}
                        className={isLoadAll ? 'bg-green-50' : ''}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title='Làm mới dữ liệu'>
                    <Button
                      type='text'
                      size='small'
                      icon={<RefreshCcw className='text-blue-600 size-4' />}
                      onClick={handleRefreshOptions}
                    />
                  </Tooltip>
                </Flex>
              </Flex>
              <Divider style={{ margin: '8px 0' }} />
              {menu}
              {allowAddNew && (
                <Form form={form} onFinish={handleAddNewOption}>
                  <Divider style={{ margin: '8px 0' }} />
                  <Form.Item name='newLabel' className='!m-0'>
                    <Input
                      placeholder={`${placeholder.replace('Chọn', 'Nhập')} mới`}
                      name='newLabel'
                      prefix={
                        <Tooltip title='Nhấn enter để thêm mới'>
                          <Plus className='text-blue-600' />
                        </Tooltip>
                      }
                      ref={inputRef}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          e.preventDefault();
                          form.submit();
                        }
                      }}
                    />
                  </Form.Item>
                </Form>
              )}
            </Spin>
          )}
        />
      </div>
    );

    return ReactQueryProvider ? <ReactQueryProvider>{cellContent}</ReactQueryProvider> : cellContent;
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

SelectCell.displayName = 'SelectCell';

export function createSelectSimpleColumn({
  data,
  title,
  width = DEFAULT_WIDTH,
  getOptions,
  disabled = false,
  placeholder,
  allowClear = true,
  idField,
  allowAddNew = false,
  dependentOn,
  onChange,
  ReactQueryProvider,
  useQuery,
  invalidate,
}: SelectSimpleRendererProps) {
  useSelectOptionsStore.getState().registerColumn(data, {
    getOptions,
    disabled,
    placeholder: placeholder || `Chọn ${removeSpanTitle(title)}`,
    allowClear,
    idField,
    allowAddNew,
    dependentOn,
    onChange,
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
          const placeholderText = placeholder || `Chọn ${removeSpanTitle(title)}`;
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
          root.render(
            <SelectCell
              value={value}
              row={row}
              prop={prop}
              instance={instance}
              initialOpen={true}
              ReactQueryProvider={ReactQueryProvider}
              useQuery={useQuery}
              invalidate={invalidate}
            />
          );

          td._selectRoot = root;
        };

        td.removeEventListener('dblclick', td._handleDoubleClick);
        td._handleDoubleClick = handleDoubleClick;
        td.addEventListener('dblclick', handleDoubleClick);

        return td;
      }

      if (td._selectRoot) {
        td._selectRoot.render(
          <SelectCell
            value={value}
            row={row}
            prop={prop}
            instance={instance}
            ReactQueryProvider={ReactQueryProvider}
            useQuery={useQuery}
            invalidate={invalidate}
          />
        );
      }

      return td;
    },
    afterDestroy: (_instance: any, td: any) => {
      if (td) {
        if (td._selectRoot) {
          td._selectRoot.unmount();
          delete td._selectRoot;
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

