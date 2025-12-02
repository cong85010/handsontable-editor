import React, { useCallback, useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import { message } from 'antd';
import {
  TableContainer,
  createTableSettings,
  createTextColumn,
  createNumericColumn,
  createSelectSimpleColumn,
  createDatePickerColumn,
  createBooleanColumn,
  useColumnConfig,
  useColumnResize,
  useAfterChange,
  createAutofillHandler,
  highlightInvalidCellsBulletproof,
  clearCellHighlights,
  validateContainerISO,
  isEmpty,
  colorSelectedRows,
  type SelectOption,
  type CellError,
} from 'handsontable-editor';
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';

// Register Handsontable modules (required!)
registerAllModules();

interface OrderData {
  id: string;
  planDate: string;
  customerName: string;
  customerId: string;
  forwarderName: string;
  forwarderId: string;
  driverName: string;
  driverId: string;
  truckName: string;
  truckId: string;
  containerNo: string;
  quantity: number;
  price: number;
  isUrgent: boolean;
  notes: string;
  rowColor?: string;
}

// Mock options
const customerOptions: SelectOption[] = [
  { value: '1', label: 'Customer A' },
  { value: '2', label: 'Customer B' },
  { value: '3', label: 'Customer C' },
];

const forwarderOptions: SelectOption[] = [
  { value: '1', label: 'Forwarder X' },
  { value: '2', label: 'Forwarder Y' },
];

const driverOptions: SelectOption[] = [
  { value: '1', label: 'Driver John' },
  { value: '2', label: 'Driver Jane' },
];

const truckOptions: SelectOption[] = [
  { value: '1', label: 'TRUCK-001' },
  { value: '2', label: 'TRUCK-002' },
];

export const AdvancedExample: React.FC = () => {
  const hotTableRef = useRef<any>(null);
  
  const [data, setData] = useState<OrderData[]>([
    {
      id: '1',
      planDate: '2024-12-05',
      customerName: 'Customer A',
      customerId: '1',
      forwarderName: 'Forwarder X',
      forwarderId: '1',
      driverName: 'Driver John',
      driverId: '1',
      truckName: 'TRUCK-001',
      truckId: '1',
      containerNo: 'ABCD1234567',
      quantity: 100,
      price: 5000,
      isUrgent: false,
      notes: 'Normal delivery',
    },
  ]);

  // Base columns
  const baseColumns = [
    createTextColumn({
      data: 'id',
      title: 'ID',
      width: 80,
      readOnly: true,
    }),
    createDatePickerColumn({
      data: 'planDate',
      title: 'Plan Date *',
      width: 150,
      format: 'DD/MM/YYYY',
    }),
    createSelectSimpleColumn({
      data: 'customerName',
      idField: 'customerId',
      title: 'Customer *',
      width: 200,
      getOptions: async () => customerOptions,
    }),
    createSelectSimpleColumn({
      data: 'forwarderName',
      idField: 'forwarderId',
      title: 'Forwarder',
      width: 200,
      getOptions: async () => forwarderOptions,
    }),
    createSelectSimpleColumn({
      data: 'driverName',
      idField: 'driverId',
      title: 'Driver',
      width: 200,
      getOptions: async () => driverOptions,
    }),
    createSelectSimpleColumn({
      data: 'truckName',
      idField: 'truckId',
      title: 'Truck',
      width: 150,
      getOptions: async () => truckOptions,
    }),
    createTextColumn({
      data: 'containerNo',
      title: 'Container No *',
      width: 150,
    }),
    createNumericColumn('quantity', 'Quantity', 120),
    createNumericColumn('price', 'Price ($)', 150),
    createBooleanColumn('isUrgent', 'Urgent', 100),
    createTextColumn({
      data: 'notes',
      title: 'Notes',
      width: 300,
    }),
  ];

  // Column configuration hook
  const {
    tableColumns,
    handleColumnsChange,
    handleResetColumns,
    pendingColumns,
    handleApplyChanges,
    handleCancelChanges,
  } = useColumnConfig({
    baseTableColumns: baseColumns,
    hotTableRef,
    storageKey: 'advanced-example-columns',
  });

  // Column resize hook
  const { manualColumnResize, handleAfterColumnResize, resetColumnWidths } = useColumnResize({
    columnSettings: tableColumns,
    hotTableRef,
    storageKey: 'advanced-example-widths',
  });

  // AfterChange handler with ID mapping and dependencies
  const afterChange = useAfterChange({
    columns: tableColumns,
    data,
    setData,
    hotInstance: hotTableRef.current?.hotInstance,
    idFieldMap: {
      customerName: 'customerId',
      forwarderName: 'forwarderId',
      driverName: 'driverId',
      truckName: 'truckId',
    },
    fieldDependencies: {
      forwarderName: ['driverName', 'truckName'],
    },
    useBatchedChanges: true,
  });

  // Autofill handler
  const handleAfterAutofill = useCallback(
    (fillData: any[][], sourceRange: any, targetRange: any, direction: string) => {
      const handler = createAutofillHandler({
        hotInstance: hotTableRef.current?.hotInstance,
        idFieldMap: {
          customerName: 'customerId',
          forwarderName: 'forwarderId',
          driverName: 'driverId',
          truckName: 'truckId',
        },
        fieldDependencies: {
          forwarderName: ['driverName', 'truckName'],
        },
        useBatchedChanges: true,
      });
      
      handler(fillData, sourceRange, targetRange, direction);
    },
    [],
  );

  // Validation
  const validateData = useCallback(() => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return false;

    const errors: CellError[] = [];
    
    data.forEach((row, rowIndex) => {
      // Required fields
      if (isEmpty(row.planDate)) {
        errors.push({ row: rowIndex, col: 'planDate', message: 'Plan Date is required' });
      }
      
      if (isEmpty(row.customerId)) {
        errors.push({ row: rowIndex, col: 'customerName', message: 'Customer is required' });
      }
      
      if (isEmpty(row.containerNo)) {
        errors.push({ row: rowIndex, col: 'containerNo', message: 'Container No is required' });
      } else if (!validateContainerISO(row.containerNo)) {
        errors.push({ 
          row: rowIndex, 
          col: 'containerNo', 
          message: 'Invalid container number (must follow ISO 6346 format)' 
        });
      }
      
      // Validate quantity
      if (row.quantity < 0) {
        errors.push({ row: rowIndex, col: 'quantity', message: 'Quantity must be positive' });
      }
    });

    if (errors.length > 0) {
      highlightInvalidCellsBulletproof(hotInstance, errors);
      message.error(`Found ${errors.length} validation errors. Please check highlighted cells.`);
      return false;
    }

    clearCellHighlights(hotInstance);
    message.success('All data is valid!');
    return true;
  }, [data]);

  // Table settings
  const settings = createTableSettings({
    data,
    columns: tableColumns,
    afterChange,
    beforeValidate: () => true,
    manualColumnResize,
    afterColumnResize: handleAfterColumnResize,
    afterAutofill: handleAfterAutofill,
  });

  // Handle add new row
  const handleAddNewRow = () => {
    const newRow: OrderData = {
      id: `${Date.now()}`,
      planDate: '',
      customerName: '',
      customerId: '',
      forwarderName: '',
      forwarderId: '',
      driverName: '',
      driverId: '',
      truckName: '',
      truckId: '',
      containerNo: '',
      quantity: 0,
      price: 0,
      isUrgent: false,
      notes: '',
    };
    setData([...data, newRow]);
  };

  // Handle color selected rows
  const handleColorSelectedRows = (color: string) => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
    
    colorSelectedRows(hotInstance, color, 'rowColor');
    
    // Update data state
    const selectedRanges = hotInstance.getSelectedRange();
    if (!selectedRanges) return;
    
    const updatedData = [...data];
    selectedRanges.forEach((range: any) => {
      const startRow = Math.min(range.from.row, range.to.row);
      const endRow = Math.max(range.from.row, range.to.row);
      
      for (let row = startRow; row <= endRow; row++) {
        if (updatedData[row]) {
          updatedData[row].rowColor = color;
        }
      }
    });
    
    setData(updatedData);
  };

  // Custom buttons
  const customButtons = (
    <>
      <button
        onClick={validateData}
        style={{
          padding: '4px 15px',
          backgroundColor: '#52c41a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Validate Data
      </button>
    </>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Advanced Example - Full Feature Demo</h1>
      <p>
        This example demonstrates all advanced features:
      </p>
      <ul>
        <li>✅ Column configuration (show/hide, freeze)</li>
        <li>✅ Column resize persistence</li>
        <li>✅ Validation with error highlighting</li>
        <li>✅ ISO container validation</li>
        <li>✅ Row coloring</li>
        <li>✅ Multi-row duplication</li>
        <li>✅ Autofill with ID mapping</li>
        <li>✅ Field dependencies (change forwarder clears driver & truck)</li>
        <li>✅ Custom validation button</li>
      </ul>
      
      <TableContainer
        hotTableRef={hotTableRef}
        tableSettings={settings}
        tableColumns={tableColumns}
        onColumnsChange={handleColumnsChange}
        onReset={() => {
          handleResetColumns();
          resetColumnWidths();
        }}
        onAddNewRow={handleAddNewRow}
        onColorSelectedRows={handleColorSelectedRows}
        pendingColumns={pendingColumns}
        onApplyChanges={handleApplyChanges}
        onCancelChanges={handleCancelChanges}
        customButtons={customButtons}
        showAddButton
        showDuplicateButton
        showColorPicker
        showColumnConfig
        showSelectCount
      />
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Tips:</h3>
        <ul>
          <li>Try changing the Forwarder - it will clear Driver and Truck fields (field dependencies)</li>
          <li>Use autofill (drag cell corner) - IDs are copied automatically</li>
          <li>Enter invalid container number and click "Validate Data"</li>
          <li>Select rows and use the color picker</li>
          <li>Click "Cột" to show/hide or freeze columns</li>
          <li>Resize columns - widths are saved to localStorage</li>
          <li>Use "Nhân bản" to duplicate selected rows multiple times</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedExample;

