import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Button, Checkbox, Flex, Input, List, Popover, Tooltip } from 'antd';
import { ChevronDown, Info, RotateCcw } from 'lucide-react';
import { removeAccents } from '../utils';

// Define the column structure for Handsontable
interface TableColumn {
  data: string;
  title?: string;
  width?: number;
  className?: string;
  hidden?: boolean;
  frozen?: boolean;
  fixed?: 'left' | 'right' | boolean | undefined;
  [key: string]: any;
}

type ColumnConfigProps = {
  tableColumns: TableColumn[];
  onChange: (newColumns: TableColumn[]) => void;
  onReset?: () => void;
  onFreezeColumn?: (columnKey: string) => void;
  onUnfreezeColumn?: (columnKey: string) => void;
  pendingColumns?: TableColumn[] | null;
  onApplyChanges?: () => void;
  onCancelChanges?: () => void;
};

const replaceRequiredTitle = (title: string) => {
  return title.replace(/<span style="color: red;">.*?<\/span>/g, '*');
};

export const ColumnConfig: React.FC<ColumnConfigProps> = ({
  tableColumns,
  onChange,
  onReset,
  onFreezeColumn,
  onUnfreezeColumn,
  pendingColumns,
  onApplyChanges,
  onCancelChanges,
}) => {
  const id = useId();

  // Columns shown in the UI: prefer pending if exists
  const displayedColumns = useMemo(
    () => (pendingColumns ?? tableColumns).map((col) => ({ ...col, title: replaceRequiredTitle(col?.title || '') })),
    [pendingColumns, tableColumns],
  );

  // Update checkAll state based on current columns
  const [checkAll, setCheckAll] = useState(() => {
    return displayedColumns.every((col) => !col.hidden);
  });

  // Add state for filter
  const [filter, setFilter] = useState('');

  // Add filtered columns
  const filteredColumns = useMemo(() => {
    if (!filter) return displayedColumns;

    const normalizedInput = removeAccents(filter.toLowerCase());
    return displayedColumns.filter((column) => {
      const normalizedTitle = removeAccents(column?.title?.toString()?.toLowerCase() || '');
      return normalizedTitle.includes(normalizedInput);
    });
  }, [displayedColumns, filter]);

  const handleShowHideColumn = useCallback(
    (key: string, checked: boolean) => {
      let newColumns = [] as TableColumn[];

      if (key === `${id}-columns-all`) {
        // When clicking "All", set all columns to the same visibility state
        newColumns = displayedColumns.map((column) => ({
          ...column,
          hidden: !checked,
        }));
        setCheckAll(checked);
      } else {
        newColumns = displayedColumns.map((column) => ({
          ...column,
          hidden: column.data === key ? !checked : column.hidden,
        }));
        // Update checkAll based on whether all columns are now visible
        setCheckAll(newColumns.every((col) => !col.hidden));
      }

      onChange(newColumns);
    },
    [displayedColumns, onChange, id],
  );

  // Handle freezing/unfreezing a column
  const handleFreezeColumn = useCallback(
    (key: string, frozen: boolean) => {
      const newColumns = displayedColumns.map((column) => {
        if (column.data === key) {
          return {
            ...column,
            frozen,
          };
        }
        return column;
      });

      onChange(newColumns);

      // Call the freeze/unfreeze handlers
      if (frozen && onFreezeColumn) {
        onFreezeColumn(key);
      } else if (!frozen && onUnfreezeColumn) {
        onUnfreezeColumn(key);
      }
    },
    [displayedColumns, onChange, onFreezeColumn, onUnfreezeColumn],
  );

  const renderListItem = useCallback(
    (item: TableColumn) => {
      // Check if the original title contains asterisk (from makeLabelHybrid with required: true)
      const hasAsterisk = item.title?.includes('*');
      const titleNotRequired = hasAsterisk ? item.title?.replace(/\*/g, '').trim() : item.title;
      const displayTitle = titleNotRequired || item.data;

      return (
        <List.Item className='flex justify-between items-center gap-2'>
          <Checkbox
            id={`${id}-columns-${item.data}`}
            checked={!item.hidden}
            onChange={(e) => handleShowHideColumn(item.data, e.target.checked)}
          />
          <label htmlFor={`${id}-columns-${item.data}`} className='w-full hover:cursor-pointer'>
            {displayTitle}
            {hasAsterisk && <span className='text-red-500 ml-1'>*</span>}
          </label>
          <div className='flex gap-1 ml-auto'>
            <Checkbox
              id={`columns-frozen-${item.data}`}
              checked={item.frozen === true}
              onChange={(e) => handleFreezeColumn(item.data, e.target.checked)}
              disabled={item.hidden}
              title='Ghim cột'
            />
          </div>
        </List.Item>
      );
    },
    [id, handleShowHideColumn, handleFreezeColumn],
  );

  const ColumnSettings = useMemo(
    () => (
      <div className='flex flex-col w-[300px]'>
        <div className='p-2 border-b border-gray-200'>
          <Input
            type='text'
            className='w-full px-2 py-1 border rounded'
            placeholder='Tìm kiếm cột...'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            allowClear
          />
        </div>
        <List
          dataSource={filteredColumns}
          className='overflow-y-auto columns-setting-list'
          style={{ maxHeight: '400px' }}
          header={
            <List.Item className='flex justify-between items-center gap-2 !py-0'>
              <Flex gap={8} align='center'>
                <Checkbox
                  id={`${id}-columns-all`}
                  checked={checkAll}
                  onChange={(e) => handleShowHideColumn(`${id}-columns-all`, e.target.checked)}
                />
                <label htmlFor={`${id}-columns-all`} className='w-full hover:cursor-pointer'>
                  Tất cả
                </label>
              </Flex>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500'>Ghim trái</span>
                <Tooltip title='Ghim cột cần phải tải lại trang để áp dụng' placement='topRight'>
                  <Info size={16} />
                </Tooltip>
              </div>
            </List.Item>
          }
          renderItem={renderListItem}
        />
        <div className='p-2 border-t border-gray-200 space-y-2'>
          {onReset && (
            <Button type='default' size='small' onClick={onReset} icon={<RotateCcw size={14} />} className='w-full'>
              Khôi phục mặc định
            </Button>
          )}
          {pendingColumns && (
            <div className='flex gap-2'>
              <Button type='primary' size='small' onClick={onApplyChanges} className='flex-1'>
                Áp dụng
              </Button>
              <Button type='default' size='small' onClick={onCancelChanges} className='flex-1'>
                Hủy
              </Button>
            </div>
          )}
        </div>
      </div>
    ),
    [
      filter,
      filteredColumns,
      id,
      checkAll,
      renderListItem,
      onReset,
      handleShowHideColumn,
      pendingColumns,
      onApplyChanges,
      onCancelChanges,
    ],
  );

  // Update checkAll whenever columns change
  useEffect(() => {
    setCheckAll(displayedColumns.every((col) => !col.hidden));
  }, [displayedColumns]);

  return (
    <Popover
      placement='rightTop'
      trigger='click'
      content={ColumnSettings}
      overlayStyle={{
        maxWidth: '320px',
      }}
    >
      <Button type='primary' className='column-config-button'>
        Cột <ChevronDown />
      </Button>
    </Popover>
  );
};

