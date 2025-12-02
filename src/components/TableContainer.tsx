import React from 'react';
import { HotTable } from '@handsontable/react-wrapper';
import { Button } from 'antd';
import { Plus } from 'lucide-react';
import { ColumnConfig } from './ColumnConfig';
import { ColorPicker } from './ColorPicker';
import { DuplicateMultiRow } from './DuplicateMultiRow';
import { SelectCountRow } from './SelectCountRow';

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

export interface TableContainerProps {
  hotTableRef: React.RefObject<any>;
  tableSettings: any;
  isPending?: boolean;
  tableColumns?: TableColumn[];
  onColumnsChange?: (newColumns: TableColumn[]) => void;
  onReset?: () => void;
  onAddNewRow?: () => void;
  onColorSelectedRows?: (color: string) => void;
  onFreezeColumn?: (columnKey: string) => void;
  onUnfreezeColumn?: (columnKey: string) => void;
  pendingColumns?: TableColumn[] | null;
  onApplyChanges?: () => void;
  onCancelChanges?: () => void;
  
  // Permission controls
  showAddButton?: boolean;
  showDuplicateButton?: boolean;
  showColorPicker?: boolean;
  showColumnConfig?: boolean;
  showSelectCount?: boolean;
  
  // Custom buttons
  customButtons?: React.ReactNode;
  
  // Loading component
  loadingComponent?: React.ReactNode;
  
  // Labels
  addButtonText?: string;
  
  // Container styles
  containerClassName?: string;
  headerClassName?: string;
}

const DefaultLoadingComponent = () => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1890ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  </div>
);

// Cached HotTable to prevent unnecessary re-renders
const HotTableCached = React.memo(
  ({ hotTableRef, tableSettings }: { hotTableRef: React.RefObject<any>; tableSettings: any }) => {
    return <HotTable ref={hotTableRef} {...tableSettings} />;
  },
);

HotTableCached.displayName = 'HotTableCached';

/**
 * TableContainer - Comprehensive container component for Handsontable
 * Includes toolbar with actions, column configuration, and loading state
 */
export const TableContainer: React.FC<TableContainerProps> = React.memo(
  ({
    hotTableRef,
    tableSettings,
    isPending = false,
    onAddNewRow,
    onColorSelectedRows,
    tableColumns,
    onColumnsChange,
    onReset,
    onFreezeColumn,
    onUnfreezeColumn,
    pendingColumns,
    onApplyChanges,
    onCancelChanges,
    showAddButton = true,
    showDuplicateButton = true,
    showColorPicker = true,
    showColumnConfig = true,
    showSelectCount = true,
    customButtons,
    loadingComponent,
    addButtonText = 'Thêm mới',
    containerClassName = 'border rounded-lg overflow-hidden hot ht-theme-main',
    headerClassName = 'flex justify-between items-center',
  }) => {
    return (
      <div className={containerClassName} style={{ position: 'relative' }}>
        {/* Header with actions */}
        <div className={headerClassName}>
          <div className='flex items-center gap-2 pl-1'>
            {showSelectCount && <SelectCountRow hotInstance={hotTableRef.current?.hotInstance} />}
          </div>
          
          <div className='flex justify-end p-2 gap-2 border-b border-gray-200 bg-gray-50'>
            {/* Custom buttons */}
            {customButtons}
            
            {/* Duplicate button */}
            {showDuplicateButton && <DuplicateMultiRow hotTableRef={hotTableRef} />}
            
            {/* Color picker */}
            {showColorPicker && onColorSelectedRows && (
              <ColorPicker value='#ffffff' onChange={onColorSelectedRows} size='middle' />
            )}
            
            {/* Add new row button */}
            {showAddButton && onAddNewRow && (
              <Button type='primary' onClick={onAddNewRow}>
                {addButtonText}
                <Plus size={20} />
              </Button>
            )}
            
            {/* Column configuration */}
            {showColumnConfig && tableColumns && onColumnsChange && (
              <ColumnConfig
                tableColumns={tableColumns}
                onChange={onColumnsChange}
                onReset={onReset}
                onFreezeColumn={onFreezeColumn}
                onUnfreezeColumn={onUnfreezeColumn}
                pendingColumns={pendingColumns}
                onApplyChanges={onApplyChanges}
                onCancelChanges={onCancelChanges}
              />
            )}
          </div>
        </div>
        
        {/* Loading overlay */}
        {isPending && (loadingComponent || <DefaultLoadingComponent />)}
        
        {/* Handsontable */}
        <HotTableCached hotTableRef={hotTableRef} tableSettings={tableSettings} />
        
        {/* Add keyframe animation for loading spinner */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  },
);

TableContainer.displayName = 'TableContainer';

