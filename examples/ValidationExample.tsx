import React, { useCallback, useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import { Button, message, Space } from 'antd';
import {
  TableContainer,
  createTableSettings,
  createTextColumn,
  createNumericColumn,
  createDatePickerColumn,
  useAfterChange,
  highlightInvalidCellsBulletproof,
  clearCellHighlights,
  validateContainerISO,
  validateDate,
  validateNumericValue,
  isEmpty,
  type CellError,
} from 'handsontable-editor';
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';

// Register Handsontable modules (required!)
registerAllModules();

interface ValidationData {
  id: string;
  name: string;
  containerNo: string;
  date: string;
  weight: number;
  price: number;
}

export const ValidationExample: React.FC = () => {
  const hotTableRef = useRef<any>(null);
  
  const [data, setData] = useState<ValidationData[]>([
    {
      id: '1',
      name: 'Valid Entry',
      containerNo: 'ABCD1234567',
      date: '2024-12-10',
      weight: 1000,
      price: 5000,
    },
    {
      id: '2',
      name: '', // Invalid: empty
      containerNo: 'INVALID123', // Invalid: wrong format
      date: '2024-11-01', // Invalid: past date
      weight: -500, // Invalid: negative
      price: -1000, // Invalid: negative
    },
  ]);

  const columns = [
    createTextColumn({
      data: 'id',
      title: 'ID',
      width: 80,
      readOnly: true,
    }),
    createTextColumn({
      data: 'name',
      title: 'Name * (Required)',
      width: 200,
    }),
    createTextColumn({
      data: 'containerNo',
      title: 'Container No * (ISO 6346)',
      width: 200,
    }),
    createDatePickerColumn({
      data: 'date',
      title: 'Date * (Not in past)',
      width: 150,
      format: 'DD/MM/YYYY',
    }),
    createNumericColumn('weight', 'Weight (kg) * (>0)', 150),
    createNumericColumn('price', 'Price ($) * (>0)', 150),
  ];

  const afterChange = useAfterChange({
    columns,
    data,
    setData,
  });

  const settings = createTableSettings({
    data,
    columns,
    afterChange,
    beforeValidate: () => true,
  });

  // Comprehensive validation
  const validateAllData = useCallback(() => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return false;

    const errors: CellError[] = [];
    let errorCount = 0;

    data.forEach((row, rowIndex) => {
      // Required field validation
      if (isEmpty(row.name)) {
        errors.push({ 
          row: rowIndex, 
          col: 'name', 
          message: 'Name is required' 
        });
        errorCount++;
      }

      // Container ISO validation
      if (isEmpty(row.containerNo)) {
        errors.push({ 
          row: rowIndex, 
          col: 'containerNo', 
          message: 'Container number is required' 
        });
        errorCount++;
      } else if (!validateContainerISO(row.containerNo)) {
        errors.push({ 
          row: rowIndex, 
          col: 'containerNo', 
          message: 'Invalid container number. Must be 4 letters + 7 digits (e.g., ABCD1234567)' 
        });
        errorCount++;
      }

      // Date validation
      if (isEmpty(row.date)) {
        errors.push({ 
          row: rowIndex, 
          col: 'date', 
          message: 'Date is required' 
        });
        errorCount++;
      } else {
        const dateErrors = validateDate(row.date, 'planDate');
        if (dateErrors.length > 0) {
          errors.push({ 
            row: rowIndex, 
            col: 'date', 
            message: dateErrors[0] 
          });
          errorCount++;
        }
      }

      // Weight validation
      const weightErrors = validateNumericValue(row.weight, 0, 'Weight must be positive');
      if (weightErrors.length > 0) {
        errors.push({ 
          row: rowIndex, 
          col: 'weight', 
          message: weightErrors[0] 
        });
        errorCount++;
      }

      // Price validation
      const priceErrors = validateNumericValue(row.price, 0, 'Price must be positive');
      if (priceErrors.length > 0) {
        errors.push({ 
          row: rowIndex, 
          col: 'price', 
          message: priceErrors[0] 
        });
        errorCount++;
      }
    });

    if (errors.length > 0) {
      highlightInvalidCellsBulletproof(hotInstance, errors);
      message.error({
        content: (
          <div>
            <strong>Validation Failed!</strong>
            <br />
            Found {errorCount} error(s) in {data.length} row(s).
            <br />
            Check highlighted cells for details.
          </div>
        ),
        duration: 5,
      });
      return false;
    }

    clearCellHighlights(hotInstance);
    message.success('✅ All validation passed! Data is valid.');
    return true;
  }, [data]);

  const clearErrors = useCallback(() => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;
    
    clearCellHighlights(hotInstance);
    message.info('Cleared all error highlights');
  }, []);

  const handleAddNewRow = () => {
    const newRow: ValidationData = {
      id: `${Date.now()}`,
      name: '',
      containerNo: '',
      date: '',
      weight: 0,
      price: 0,
    };
    setData([...data, newRow]);
  };

  const customButtons = (
    <Space>
      <Button type="primary" onClick={validateAllData}>
        Validate All
      </Button>
      <Button onClick={clearErrors}>
        Clear Errors
      </Button>
    </Space>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Validation Example - Comprehensive Validation Demo</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e6f7ff', borderRadius: '4px', border: '1px solid #91d5ff' }}>
        <h3>Validation Rules:</h3>
        <ul>
          <li>✅ <strong>Name:</strong> Required field</li>
          <li>✅ <strong>Container No:</strong> Required, must follow ISO 6346 format (4 letters + 7 digits)</li>
          <li>✅ <strong>Date:</strong> Required, cannot be in the past</li>
          <li>✅ <strong>Weight:</strong> Must be positive number</li>
          <li>✅ <strong>Price:</strong> Must be positive number</li>
        </ul>
        
        <p><strong>Try this:</strong></p>
        <ol>
          <li>Click "Validate All" button to see validation in action</li>
          <li>Row 2 has multiple errors - observe the error highlighting</li>
          <li>Fix the errors and validate again</li>
          <li>Hover over highlighted cells to see error messages</li>
        </ol>
      </div>
      
      <TableContainer
        hotTableRef={hotTableRef}
        tableSettings={settings}
        onAddNewRow={handleAddNewRow}
        customButtons={customButtons}
        showDuplicateButton={false}
        showColorPicker={false}
        showColumnConfig={false}
      />
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff7e6', borderRadius: '4px', border: '1px solid #ffd591' }}>
        <h3>Example Valid Values:</h3>
        <ul>
          <li><strong>Container No:</strong> ABCD1234567, MEDU9876543, CSQU1111111</li>
          <li><strong>Date:</strong> Any future date</li>
          <li><strong>Weight:</strong> Any positive number</li>
          <li><strong>Price:</strong> Any positive number</li>
        </ul>
        
        <h3>Example Invalid Values:</h3>
        <ul>
          <li><strong>Container No:</strong> ABC123 (too short), ABCD12345678 (too long), 1234567890 (no letters)</li>
          <li><strong>Date:</strong> 2024-11-01 (past date)</li>
          <li><strong>Weight:</strong> -100 (negative)</li>
          <li><strong>Price:</strong> -50 (negative)</li>
        </ul>
      </div>
    </div>
  );
};

export default ValidationExample;

