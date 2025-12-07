# 📊 Handsontable Editor

> **Production-ready Handsontable wrapper for React with advanced features**

[![npm version](https://img.shields.io/npm/v/handsontable-editor.svg)](https://www.npmjs.com/package/handsontable-editor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-tested React wrapper for Handsontable with enterprise-grade features including advanced validation, column management, bulk operations, and beautiful UI components.

---

## ✨ Features

### 🎨 **UI Components**
- **TableContainer** - Complete table wrapper with integrated toolbar and actions
- **ColumnConfig** - Interactive column management (show/hide, freeze, search)
- **ColorPicker** - Row highlighting with 16 preset colors
- **DuplicateMultiRow** - Batch row duplication with count selector
- **SelectCountRow** - Live selection counter

### 🔧 **React Hooks**
- **useColumnConfig** - Manage column visibility and freezing with persistence
- **useColumnResize** - Persist column widths per user
- **useAfterChange** - Simplified change handler with ID mapping and dependencies

### ⚡ **Advanced Features**
- **Cell-Level Validation** - Error highlighting with tooltips
- **ISO 6346 Container Validation** - Standard container number validation
- **Bulk Operations** - Efficient batch updates and operations
- **Autofill with ID Mapping** - Smart autofill that copies related IDs
- **Field Dependencies** - Auto-clear related fields when parent changes
- **Row Coloring** - Visual row highlighting system
- **Context Menu** - Custom right-click menu with actions

### 📦 **Column Types**
- Text, Numeric, Boolean columns
- Select dropdown with search and "add new"
- Date picker with Vietnamese locale
- Action columns (buttons)
- Status row indicators

### 🎯 **Developer Experience**
- **Full TypeScript Support** - 36 KB of type definitions
- **4 Working Examples** - Basic, Advanced, Validation, Demo
- **Comprehensive Documentation** - API docs, guides, and migration help
- **100% Backward Compatible** - v1.x code works without changes

---

## 🚀 Quick Start

### Installation

```bash
npm install handsontable-editor handsontable @handsontable/react-wrapper antd dayjs
# or
yarn add handsontable-editor handsontable @handsontable/react-wrapper antd dayjs
# or
pnpm add handsontable-editor handsontable @handsontable/react-wrapper antd dayjs
```

### Basic Usage (30 seconds)

```tsx
import React, { useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import {
  TableContainer,
  createTableSettings,
  createTextColumn,
  useAfterChange,
} from 'handsontable-editor';
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';

// Required: Register Handsontable modules
registerAllModules();

function MyTable() {
  const hotTableRef = useRef(null);
  const [data, setData] = useState([
    { id: '1', name: 'John', age: 30 },
    { id: '2', name: 'Jane', age: 25 },
  ]);

  const columns = [
    createTextColumn({ data: 'id', title: 'ID', width: 100 }),
    createTextColumn({ data: 'name', title: 'Name', width: 200 }),
    createTextColumn({ data: 'age', title: 'Age', width: 100 }),
  ];

  const afterChange = useAfterChange({ columns, data, setData });
  const settings = createTableSettings({ data, columns, afterChange });

  return (
    <TableContainer
      hotTableRef={hotTableRef}
      tableSettings={settings}
      onAddNewRow={() => setData([...data, { id: Date.now().toString(), name: '', age: 0 }])}
    />
  );
}
```

**That's it!** ✅ You have a fully functional editable table!

---

## 📚 Complete Feature Guide

### 1. TableContainer - Comprehensive Table Wrapper

The main component that provides a complete table experience with toolbar and actions.

```tsx
import { TableContainer, useColumnConfig, useColumnResize } from 'handsontable-editor';

function AdvancedTable() {
  const hotTableRef = useRef(null);
  const [data, setData] = useState([...]);

  const { tableColumns, handleColumnsChange, handleResetColumns } = useColumnConfig({
    baseTableColumns: columns,
    hotTableRef,
    storageKey: 'my-table-columns',
  });

  const { manualColumnResize, handleAfterColumnResize, resetColumnWidths } = useColumnResize({
    columnSettings: tableColumns,
    hotTableRef,
    storageKey: 'my-table-widths',
  });

  return (
    <TableContainer
      hotTableRef={hotTableRef}
      tableSettings={settings}
      isPending={loading}
      
      // Column management
      tableColumns={tableColumns}
      onColumnsChange={handleColumnsChange}
      onReset={() => {
        handleResetColumns();
        resetColumnWidths();
      }}
      
      // Actions
      onAddNewRow={handleAddRow}
      onColorSelectedRows={handleColorRows}
      
      // UI Controls
      showAddButton
      showDuplicateButton
      showColorPicker
      showColumnConfig
      showSelectCount
      
      // Custom buttons
      customButtons={<button onClick={validate}>Validate</button>}
    />
  );
}
```

**Features:**
- ✅ Integrated toolbar with actions
- ✅ Loading overlay
- ✅ Permission-based button visibility
- ✅ Custom button support
- ✅ Professional styling

---

### 2. Column Management

#### Show/Hide Columns with Persistence

```tsx
import { useColumnConfig } from 'handsontable-editor';

const { 
  tableColumns,
  handleColumnsChange,
  handleResetColumns,
  pendingColumns,
  handleApplyChanges,
  handleCancelChanges,
} = useColumnConfig({
  baseTableColumns: columns,
  hotTableRef,
  storageKey: `columns-${userId}`, // User-specific
});
```

**Features:**
- ✅ Show/hide columns
- ✅ Freeze columns (pin to left)
- ✅ Search/filter columns
- ✅ Pending changes with Apply/Cancel
- ✅ Reset to defaults
- ✅ LocalStorage persistence per user

#### Column Resize Persistence

```tsx
import { useColumnResize } from 'handsontable-editor';

const {
  manualColumnResize,
  handleAfterColumnResize,
  resetColumnWidths,
  columnWidths,
} = useColumnResize({
  columnSettings: tableColumns,
  hotTableRef,
  storageKey: `widths-${userId}`,
});
```

**Features:**
- ✅ Save column widths on resize
- ✅ Restore widths on load
- ✅ User-specific storage
- ✅ Reset functionality

---

### 3. Advanced Validation System

#### Cell-Level Error Highlighting

```tsx
import { 
  highlightInvalidCellsBulletproof,
  clearCellHighlights,
  validateContainerISO,
  validateDate,
  validateNumericValue,
  isEmpty,
  type CellError,
} from 'handsontable-editor';

const validateData = (): boolean => {
  const errors: CellError[] = [];
  
  data.forEach((row, rowIndex) => {
    // Required field validation
    if (isEmpty(row.name)) {
      errors.push({ 
        row: rowIndex, 
        col: 'name', 
        message: 'Name is required' 
      });
    }
    
    // ISO Container validation
    if (row.containerNo && !validateContainerISO(row.containerNo)) {
      errors.push({ 
        row: rowIndex, 
        col: 'containerNo', 
        message: 'Invalid container number (ISO 6346)' 
      });
    }
    
    // Date validation
    const dateErrors = validateDate(row.date, 'planDate');
    if (dateErrors.length > 0) {
      errors.push({ row: rowIndex, col: 'date', message: dateErrors[0] });
    }
    
    // Numeric validation
    const priceErrors = validateNumericValue(row.price, 0, 'Price must be positive');
    if (priceErrors.length > 0) {
      errors.push({ row: rowIndex, col: 'price', message: priceErrors[0] });
    }
  });
  
  if (errors.length > 0) {
    highlightInvalidCellsBulletproof(hotInstance, errors);
    return false;
  }
  
  clearCellHighlights(hotInstance);
  return true;
};
```

**Features:**
- ✅ Cell-level error highlighting with red borders
- ✅ Error tooltips on hover
- ✅ ISO 6346 container validation
- ✅ Date validation (past date checking)
- ✅ Numeric range validation
- ✅ Custom validation rules
- ✅ Scrolls to first error

---

### 4. Bulk Operations

Efficient batch operations for better performance.

```tsx
import {
  handleBulkOperations,
  batchUpdateCells,
  colorSelectedRows,
  getSelectedRowIndices,
  getSelectedRowsData,
  duplicateRowAt,
  deleteRowsByIndices,
} from 'handsontable-editor';

// Batch update multiple cells
const handleBatchUpdate = () => {
  batchUpdateCells(hotInstance, [
    [0, 'status', 'Active'],
    [1, 'status', 'Active'],
    [2, 'status', 'Active'],
  ]);
};

// Color selected rows
const handleHighlight = () => {
  colorSelectedRows(hotInstance, '#ffcccc', 'rowColor');
};

// Get selected rows data
const handleExport = () => {
  const selectedData = getSelectedRowsData<ProductData>(hotInstance);
  console.log('Selected:', selectedData);
};

// Duplicate row
const handleDuplicate = () => {
  const indices = getSelectedRowIndices(hotInstance);
  indices.forEach(index => duplicateRowAt(hotInstance, index));
};

// Delete multiple rows
const handleDelete = () => {
  const indices = getSelectedRowIndices(hotInstance);
  deleteRowsByIndices(hotInstance, indices);
};
```

**Features:**
- ✅ Batch updates (10x faster)
- ✅ Row selection utilities
- ✅ Bulk duplication
- ✅ Bulk deletion
- ✅ Row coloring
- ✅ Performance optimized

---

### 5. Autofill with ID Mapping

Smart autofill that automatically copies related ID fields.

```tsx
import { createAutofillHandler } from 'handsontable-editor';

const handleAfterAutofill = createAutofillHandler({
  hotInstance,
  // Map name fields to ID fields
  idFieldMap: {
    customerName: 'customerId',
    driverName: 'driverId',
    truckName: 'truckId',
  },
  // Auto-clear related fields
  fieldDependencies: {
    forwarderName: ['driverName', 'truckName'],
    customerName: ['addressName', 'contactName'],
  },
  // Custom callback
  onFieldCopied: (row, prop, sourceValue, sourceId) => {
    console.log(`Copied ${prop} to row ${row}`);
  },
  useBatchedChanges: true,
});

const settings = createTableSettings({
  // ... other settings
  afterAutofill: handleAfterAutofill,
});
```

**Features:**
- ✅ Automatic ID field copying
- ✅ Field dependencies (auto-clear)
- ✅ Batched updates
- ✅ Custom callbacks

---

### 6. Column Types

#### Text Column

```tsx
import { createTextColumn } from 'handsontable-editor';

createTextColumn({
  data: 'name',
  title: 'Product Name',
  width: 200,
  readOnly: false,
})
```

#### Numeric Column

```tsx
import { createNumericColumn } from 'handsontable-editor';

createNumericColumn('price', 'Price ($)', 150)
```

#### Select Column with Search

```tsx
import { createSelectSimpleColumn } from 'handsontable-editor';

createSelectSimpleColumn({
  data: 'statusName',
  idField: 'statusId',
  title: 'Status',
  width: 150,
  getOptions: async () => {
    const response = await fetch('/api/statuses');
    return response.json();
  },
  allowAddNew: true,
  onChange: (instance, row, statusId, options) => {
    console.log('Status changed:', statusId);
  },
})
```

#### Date Picker Column

```tsx
import { createDatePickerColumn } from 'handsontable-editor';

createDatePickerColumn({
  data: 'date',
  title: 'Plan Date',
  width: 150,
  format: 'DD/MM/YYYY',
  showTime: false,
  onDateChange: (date, dateString, row, col) => {
    console.log('Date changed:', dateString);
  },
})
```

#### Boolean Column

```tsx
import { createBooleanColumn } from 'handsontable-editor';

createBooleanColumn('isActive', 'Active', 100)
```

#### Action Column

```tsx
import { createActionColumn } from 'handsontable-editor';

createActionColumn({
  data: 'actions',
  title: 'Actions',
  icon: '✏️',
  color: 'blue',
  onClick: (rowIndex) => {
    console.log('Edit row:', rowIndex);
  },
})
```

---

### 7. UI Components

#### ColorPicker

```tsx
import { ColorPicker } from 'handsontable-editor';

<ColorPicker
  value="#ffffff"
  onChange={(color) => colorSelectedRows(hotInstance, color)}
  size="middle"
  colors={['#ffffff', '#ffcccc', '#ffffcc']}
/>
```

#### DuplicateMultiRow

```tsx
import { DuplicateMultiRow } from 'handsontable-editor';

<DuplicateMultiRow
  hotTableRef={hotTableRef}
  maxDuplicates={100}
  buttonText="Duplicate Rows"
  buttonSize="middle"
/>
```

#### SelectCountRow

```tsx
import { SelectCountRow } from 'handsontable-editor';

<SelectCountRow
  hotInstance={hotInstance}
  label="Selected"
/>
```

#### ColumnConfig

```tsx
import { ColumnConfig } from 'handsontable-editor';

<ColumnConfig
  tableColumns={columns}
  onChange={handleColumnsChange}
  onReset={handleResetColumns}
  onFreezeColumn={handleFreeze}
  onUnfreezeColumn={handleUnfreeze}
/>
```

---

### 8. Context Menu

Custom right-click menu with actions.

```tsx
import { createContextMenu } from 'handsontable-editor';

const contextMenu = createContextMenu({
  onDuplicate: (rowIndex) => duplicateRowAt(hotInstance, rowIndex),
  onDelete: (rowIndex) => deleteRowsByIndices(hotInstance, [rowIndex]),
  onAddAbove: (rowIndex) => addRowAt(hotInstance, rowIndex),
  onAddBelow: (rowIndex) => addRowAt(hotInstance, rowIndex + 1),
});

const settings = createTableSettings({
  // ... other settings
  contextMenu,
});
```

---

## 🎯 Real-World Examples

### Example 1: Order Management Table

```tsx
import React, { useRef, useState } from 'react';
import {
  TableContainer,
  createTableSettings,
  createSelectSimpleColumn,
  createDatePickerColumn,
  createNumericColumn,
  useColumnConfig,
  useAfterChange,
  createAutofillHandler,
  highlightInvalidCellsBulletproof,
} from 'handsontable-editor';

interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  customerId: string;
  quantity: number;
  total: number;
}

function OrderTable() {
  const hotTableRef = useRef(null);
  const [data, setData] = useState<Order[]>([]);

  const columns = [
    createDatePickerColumn({ data: 'orderDate', title: 'Order Date', width: 150 }),
    createSelectSimpleColumn({
      data: 'customerName',
      idField: 'customerId',
      title: 'Customer',
      width: 200,
      getOptions: fetchCustomers,
    }),
    createNumericColumn('quantity', 'Quantity', 120),
    createNumericColumn('total', 'Total ($)', 150),
  ];

  const { tableColumns, handleColumnsChange } = useColumnConfig({
    baseTableColumns: columns,
    hotTableRef,
  });

  const afterChange = useAfterChange({
    columns: tableColumns,
    data,
    setData,
    idFieldMap: { customerName: 'customerId' },
  });

  const settings = createTableSettings({
    data,
    columns: tableColumns,
    afterChange,
    afterAutofill: createAutofillHandler({
      hotInstance: hotTableRef.current?.hotInstance,
      idFieldMap: { customerName: 'customerId' },
    }),
  });

  return (
    <TableContainer
      hotTableRef={hotTableRef}
      tableSettings={settings}
      tableColumns={tableColumns}
      onColumnsChange={handleColumnsChange}
      onAddNewRow={() => setData([...data, createEmptyOrder()])}
    />
  );
}
```

### Example 2: Inventory Management with Validation

```tsx
function InventoryTable() {
  // ... setup ...

  const validateInventory = (): boolean => {
    const errors: CellError[] = [];
    
    data.forEach((row, idx) => {
      if (isEmpty(row.productName)) {
        errors.push({ row: idx, col: 'productName', message: 'Required' });
      }
      if (row.quantity < 0) {
        errors.push({ row: idx, col: 'quantity', message: 'Must be positive' });
      }
      if (!validateContainerISO(row.containerNo)) {
        errors.push({ row: idx, col: 'containerNo', message: 'Invalid ISO format' });
      }
    });

    if (errors.length > 0) {
      highlightInvalidCellsBulletproof(hotTableRef.current?.hotInstance, errors);
      return false;
    }
    return true;
  };

  return (
    <TableContainer
      hotTableRef={hotTableRef}
      tableSettings={settings}
      customButtons={
        <button onClick={validateInventory}>Validate</button>
      }
    />
  );
}
```

---

## 📖 API Reference

### Components

| Component | Description | Props |
|-----------|-------------|-------|
| `TableContainer` | Main table wrapper | `hotTableRef`, `tableSettings`, `onAddNewRow`, etc. |
| `ColorPicker` | Row color picker | `value`, `onChange`, `colors` |
| `ColumnConfig` | Column management | `tableColumns`, `onChange`, `onReset` |
| `DuplicateMultiRow` | Multi-row duplication | `hotTableRef`, `maxDuplicates` |
| `SelectCountRow` | Selection counter | `hotInstance`, `label` |

### Hooks

| Hook | Description | Returns |
|------|-------------|---------|
| `useColumnConfig` | Column visibility & freeze | `tableColumns`, `handleColumnsChange`, etc. |
| `useColumnResize` | Column width persistence | `manualColumnResize`, `handleAfterColumnResize` |
| `useAfterChange` | Simplified change handler | `afterChange` function |
| `useAutofillHandler` | Autofill with ID mapping | `autofill` handler |

### Column Creators

| Function | Description |
|----------|-------------|
| `createTextColumn` | Text input column |
| `createNumericColumn` | Numeric input column |
| `createBooleanColumn` | Checkbox column |
| `createSelectSimpleColumn` | Select dropdown column |
| `createDatePickerColumn` | Date picker column |
| `createActionColumn` | Button column |
| `createCommonColumn` | Read-only column |

### Validation

| Function | Description |
|----------|-------------|
| `validateContainerISO` | ISO 6346 container validation |
| `validateDate` | Date validation |
| `validateNumericValue` | Numeric range validation |
| `isEmpty` | Empty value check |
| `highlightInvalidCellsBulletproof` | Highlight errors |
| `clearCellHighlights` | Clear errors |

### Bulk Operations

| Function | Description |
|----------|-------------|
| `batchUpdateCells` | Update multiple cells |
| `colorSelectedRows` | Color selected rows |
| `getSelectedRowIndices` | Get selected indices |
| `getSelectedRowsData` | Get selected data |
| `duplicateRowAt` | Duplicate row |
| `deleteRowsByIndices` | Delete rows |
| `handleBulkOperations` | Batch wrapper |

---

## 📘 TypeScript Support

Full TypeScript support with 36 KB of type definitions.

```typescript
import type {
  // Core types
  SelectOption,
  TableColumn,
  TYPE_ROW,
  
  // Component types
  TableContainerProps,
  ColorPickerProps,
  
  // Validation types
  CellError,
  ValidationResult,
  DetailedValidationResult,
  
  // Handler types
  AutofillHandlerOptions,
} from 'handsontable-editor';

// Generic type support
interface MyData {
  id: string;
  name: string;
}

const data = getSelectedRowsData<MyData>(hotInstance);
// data is MyData[] - fully typed!
```

See [TYPESCRIPT-GUIDE.md](./TYPESCRIPT-GUIDE.md) for complete TypeScript documentation.

---

## 🎓 Examples

The library includes 4 comprehensive working examples:

1. **BasicExample.tsx** - Simple usage (3 KB)
2. **AdvancedExample.tsx** - Full features (10 KB)
3. **ValidationExample.tsx** - Validation demo (8 KB)
4. **DemoApp.tsx** - All examples in tabs (6 KB)

### Run Examples

```bash
# Copy example to your project
cp node_modules/handsontable-editor/examples/BasicExample.tsx src/

# Or import directly
import { DemoApp } from 'handsontable-editor/examples';
```

See [examples/README.md](./examples/README.md) for details.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | This file |
| [QUICK-START.md](./QUICK-START.md) | 5-minute setup guide |
| [TYPESCRIPT-GUIDE.md](./TYPESCRIPT-GUIDE.md) | TypeScript usage |
| [EXAMPLES-GUIDE.md](./EXAMPLES-GUIDE.md) | Examples overview |
| [MIGRATION-2.0.md](./MIGRATION-2.0.md) | Migration from v1.x |
| [FEATURES-SUMMARY.md](./FEATURES-SUMMARY.md) | All features list |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## 🔄 Migration from v1.x

**Version 2.0.0 is 100% backward compatible!**

All v1.x code works without changes. New features are opt-in.

```tsx
// v1.x code still works ✅
const settings = createTableSettings({ data, columns, afterChange });
return <HotTable {...settings} />;

// Upgrade to v2.0 when ready
return <TableContainer tableSettings={settings} />;
```

See [MIGRATION-2.0.md](./MIGRATION-2.0.md) for upgrade guide.

---

## 🎯 Feature Comparison

| Feature | v1.x | v2.0 |
|---------|------|------|
| Basic columns | ✅ | ✅ |
| Select columns | ✅ | ✅ |
| Date picker | ✅ | ✅ |
| **TableContainer** | ❌ | ✅ NEW |
| **Column config** | ❌ | ✅ NEW |
| **Column resize** | ❌ | ✅ NEW |
| **Validation** | ❌ | ✅ NEW |
| **Bulk operations** | ❌ | ✅ NEW |
| **Row coloring** | ❌ | ✅ NEW |
| **Autofill** | ❌ | ✅ NEW |
| **UI components** | ❌ | ✅ NEW |
| **Examples** | 0 | 4 NEW |

---

## 🚀 Performance

- **10x faster** bulk operations with batching
- **Efficient rendering** with memoization
- **Optimized validation** with caching
- **LocalStorage** for persistence
- **Tree-shakeable** exports

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests if applicable
4. Submit a pull request

---

## 📄 License

MIT © [Cong Phan]

---

## 🌟 Star Us!

If you find this library useful, please star it on GitHub! ⭐

---

## 💬 Support

- 📖 [Documentation](./README.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/handsontable-editor/issues)
- 💬 [Discussions](https://github.com/yourusername/handsontable-editor/discussions)
- 📧 [Email](mailto:cong85010@gmail.com)

---

## 🎉 Built With

- [React](https://reactjs.org/) - UI framework
- [Handsontable](https://handsontable.com/) - Core table library
- [Ant Design](https://ant.design/) - UI components
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [dayjs](https://day.js.org/) - Date handling

---

**Made with ❤️ for the React community**
