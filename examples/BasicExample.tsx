import React, { useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import {
  TableContainer,
  createTableSettings,
  createTextColumn,
  createNumericColumn,
  createSelectSimpleColumn,
  createDatePickerColumn,
  useAfterChange,
  type SelectOption,
} from 'handsontable-editor';
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';

// Register Handsontable modules (required!)
registerAllModules();

interface Product {
  id: string;
  name: string;
  price: number;
  statusId: string;
  statusName: string;
  category: string;
  stockDate: string;
}

const statusOptions: SelectOption[] = [
  { value: '1', label: 'Active' },
  { value: '2', label: 'Inactive' },
  { value: '3', label: 'Out of Stock' },
];

export const BasicExample: React.FC = () => {
  const hotTableRef = useRef<any>(null);
  
  const [data, setData] = useState<Product[]>([
    {
      id: '1',
      name: 'Product A',
      price: 100,
      statusId: '1',
      statusName: 'Active',
      category: 'Electronics',
      stockDate: '2024-12-02',
    },
    {
      id: '2',
      name: 'Product B',
      price: 200,
      statusId: '2',
      statusName: 'Inactive',
      category: 'Furniture',
      stockDate: '2024-12-01',
    },
  ]);

  // Define columns
  const columns = [
    createTextColumn({
      data: 'id',
      title: 'ID',
      width: 100,
      readOnly: true,
    }),
    createTextColumn({
      data: 'name',
      title: 'Product Name',
      width: 200,
    }),
    createNumericColumn('price', 'Price ($)', 150),
    createSelectSimpleColumn({
      data: 'statusName',
      idField: 'statusId',
      title: 'Status',
      width: 150,
      getOptions: async () => statusOptions,
    }),
    createTextColumn({
      data: 'category',
      title: 'Category',
      width: 150,
    }),
    createDatePickerColumn({
      data: 'stockDate',
      title: 'Stock Date',
      width: 150,
      format: 'DD/MM/YYYY',
    }),
  ];

  // Simple afterChange handler
  const afterChange = useAfterChange({
    columns,
    data,
    setData,
    idFieldMap: {
      statusName: 'statusId',
    },
  });

  // Table settings
  const settings = createTableSettings({
    data,
    columns,
    afterChange,
    beforeValidate: () => true,
  });

  // Handle add new row
  const handleAddNewRow = () => {
    const newRow: Product = {
      id: `${Date.now()}`,
      name: '',
      price: 0,
      statusId: '',
      statusName: '',
      category: '',
      stockDate: '',
    };
    setData([...data, newRow]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Basic Example - Simple Table with TableContainer</h1>
      <p>This example shows basic usage with add row functionality.</p>
      
      <TableContainer
        hotTableRef={hotTableRef}
        tableSettings={settings}
        onAddNewRow={handleAddNewRow}
        showDuplicateButton={false}
        showColorPicker={false}
        showColumnConfig={false}
      />
    </div>
  );
};

export default BasicExample;

