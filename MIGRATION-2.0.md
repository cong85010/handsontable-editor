# Migration Guide to v2.0.0

This guide helps you upgrade from v1.x to v2.0.0 of handsontable-editor, which includes all advanced features from the container-order implementation.

## What's New in v2.0.0

### 🎨 New UI Components

1. **TableContainer** - Comprehensive table wrapper with toolbar
2. **ColumnConfig** - Column visibility and freeze management
3. **ColorPicker** - Row coloring with preset colors
4. **DuplicateMultiRow** - Multi-row duplication with count selector
5. **SelectCountRow** - Display count of selected rows

### 🔧 New Hooks

1. **useColumnConfig** - Manage column visibility and freezing
2. **useColumnResize** - Persist column widths to localStorage

### ⚡ New Utilities

1. **Validation System** - Cell-level error highlighting with ISO container validation
2. **Bulk Operations** - Efficient batch updates
3. **Autofill Handler** - Advanced autofill with ID field mapping
4. **Row Coloring** - Visual row highlighting

## Breaking Changes

### None!

Version 2.0.0 is fully backward compatible. All existing code will continue to work.

## Quick Migration Path

### Before (v1.x)

```tsx
import { HotTable } from '@handsontable/react-wrapper';
import { createTableSettings, createTextColumn } from 'handsontable-editor';

function MyTable() {
  const [data, setData] = useState([...]);
  
  const columns = [
    createTextColumn({ data: 'name', title: 'Name', width: 200 }),
  ];
  
  const settings = createTableSettings({
    data,
    columns,
    afterChange: handleAfterChange,
  });
  
  return (
    <div>
      <button onClick={handleAddRow}>Add Row</button>
      <HotTable {...settings} />
    </div>
  );
}
```

### After (v2.0.0) - With Advanced Features

```tsx
import { 
  TableContainer, 
  useColumnConfig, 
  useColumnResize,
  createTableSettings, 
  createTextColumn 
} from 'handsontable-editor';

function MyTable() {
  const hotTableRef = useRef(null);
  const [data, setData] = useState([...]);
  
  const baseColumns = [
    createTextColumn({ data: 'name', title: 'Name', width: 200 }),
  ];
  
  // Add column management
  const { 
    tableColumns, 
    handleColumnsChange, 
    handleResetColumns,
    pendingColumns,
    handleApplyChanges,
    handleCancelChanges
  } = useColumnConfig({
    baseTableColumns: baseColumns,
    hotTableRef,
    storageKey: 'my-app-columns'
  });
  
  // Add column resize persistence
  const { 
    manualColumnResize, 
    handleAfterColumnResize, 
    resetColumnWidths 
  } = useColumnResize({
    columnSettings: tableColumns,
    hotTableRef,
    storageKey: 'my-app-widths'
  });
  
  const settings = createTableSettings({
    data,
    columns: tableColumns,
    afterChange: handleAfterChange,
    manualColumnResize,
    afterColumnResize: handleAfterColumnResize,
  });
  
  return (
    <TableContainer
      hotTableRef={hotTableRef}
      tableSettings={settings}
      tableColumns={tableColumns}
      onColumnsChange={handleColumnsChange}
      onReset={() => {
        handleResetColumns();
        resetColumnWidths();
      }}
      onAddNewRow={handleAddRow}
      onColorSelectedRows={handleColorRows}
      pendingColumns={pendingColumns}
      onApplyChanges={handleApplyChanges}
      onCancelChanges={handleCancelChanges}
    />
  );
}
```

## Feature Adoption Guide

### 1. Add Validation

```tsx
import { 
  highlightInvalidCellsBulletproof, 
  validateContainerISO,
  type CellError 
} from 'handsontable-editor';

const validateData = (data: any[]) => {
  const errors: CellError[] = [];
  
  data.forEach((row, rowIndex) => {
    // Required field validation
    if (!row.name) {
      errors.push({ 
        row: rowIndex, 
        col: 'name', 
        message: 'Name is required' 
      });
    }
    
    // Container ISO validation
    if (row.containerNo && !validateContainerISO(row.containerNo)) {
      errors.push({ 
        row: rowIndex, 
        col: 'containerNo', 
        message: 'Invalid container number (ISO 6346)' 
      });
    }
  });
  
  if (errors.length > 0) {
    highlightInvalidCellsBulletproof(hotInstance, errors);
    return false;
  }
  
  return true;
};
```

### 2. Add Bulk Operations

```tsx
import { 
  batchUpdateCells, 
  colorSelectedRows,
  getSelectedRowsData 
} from 'handsontable-editor';

// Batch update
const handleBatchUpdate = () => {
  batchUpdateCells(hotInstance, [
    [0, 'status', 'Active'],
    [1, 'status', 'Active'],
    [2, 'status', 'Active'],
  ]);
};

// Color selected rows
const handleHighlight = () => {
  colorSelectedRows(hotInstance, '#ffcccc');
};

// Get selected data
const handleExport = () => {
  const selectedData = getSelectedRowsData(hotInstance);
  console.log(selectedData);
};
```

### 3. Add Advanced Autofill

```tsx
import { createAutofillHandler } from 'handsontable-editor';

const settings = createTableSettings({
  // ... other settings
  afterAutofill: createAutofillHandler({
    hotInstance,
    idFieldMap: {
      customerName: 'customerId',
      driverName: 'driverId',
    },
    fieldDependencies: {
      forwarderName: ['driverName', 'truckName'],
    },
    useBatchedChanges: true,
  }),
});
```

### 4. Add Column Management

```tsx
import { useColumnConfig } from 'handsontable-editor';

const { 
  tableColumns,
  tableSettings,
  handleColumnsChange,
  handleResetColumns,
} = useColumnConfig({
  baseTableColumns: columns,
  hotTableRef,
  storageKey: `columns-${userId}`, // User-specific
});
```

### 5. Add Custom UI Components

```tsx
import { 
  ColorPicker, 
  DuplicateMultiRow, 
  SelectCountRow 
} from 'handsontable-editor';

<div className="toolbar">
  <SelectCountRow hotInstance={hotInstance} />
  <DuplicateMultiRow hotTableRef={hotTableRef} />
  <ColorPicker onChange={handleColorChange} />
</div>
```

## Performance Improvements

Version 2.0.0 includes several performance optimizations:

1. **Batch Operations** - Use `handleBulkOperations` to batch multiple changes
2. **Memoized Components** - UI components are memoized to prevent unnecessary re-renders
3. **Efficient Updates** - `batchUpdateCells` reduces table re-renders
4. **Cached Validation** - Validation functions use cached date parsing

## TypeScript Support

All new features include comprehensive TypeScript definitions:

```tsx
import type {
  TableContainerProps,
  ColorPickerProps,
  CellError,
  ValidationResult,
  AutofillHandlerOptions,
} from 'handsontable-editor';
```

## Need Help?

- Check the [README](./README.md) for comprehensive examples
- Review the [CLAUDE.md](./CLAUDE.md) for architecture details
- Open an issue on GitHub for bug reports or feature requests

## Version Compatibility

- **v1.x to v2.0.0** - ✅ Fully compatible, no breaking changes
- **Peer Dependencies** - Same as v1.x (React 18, Handsontable 15, Ant Design 5)

