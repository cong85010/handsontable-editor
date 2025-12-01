# handsontable-editor

A reusable npm library providing Handsontable components and utilities for React projects. This library includes custom renderers for select dropdowns, date pickers, and common column types.

**✨ Easy to use - Just install and start coding!**

## Installation

```bash
npm install handsontable-editor
# or
yarn add handsontable-editor
# or
pnpm add handsontable-editor
```

## Peer Dependencies

This library requires the following peer dependencies:

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `handsontable` ^15.0.0
- `@handsontable/react-wrapper` ^15.0.0
- `antd` ^5.0.0
- `dayjs` ^1.11.0

## Initialization

**Important:** You must register Handsontable modules before using cell types like `numeric` or `checkbox`. Add this to your app entry point (e.g., `main.tsx` or `App.tsx`):

```tsx
import { registerAllModules } from 'handsontable/registry';

// Register all Handsontable modules (required for numeric, checkbox, etc.)
registerAllModules();
```

## Features

- **Select Column Renderer**: Custom select dropdown with search, add new option, and dependent filtering
- **Date Picker Renderer**: Custom date picker with Vietnamese locale support
- **Common Column Types**: Text, numeric, boolean, action, and common column creators
- **Table Configuration**: Pre-configured Handsontable settings
- **Utilities**: Helper functions for date formatting, sorting, and more

## Quick Start (Simplest Way)

```tsx
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react-wrapper';
import { createQuickTable, createSelectColumn, ColumnPresets } from 'handsontable-editor';
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';

registerAllModules();

function MyTable() {
  const [data, setData] = useState([
    { id: 1, name: 'Product A', price: 100, statusId: '1', statusName: 'Active' },
  ]);

  const columns = [
    ColumnPresets.id(),
    ColumnPresets.name(),
    ColumnPresets.price(),
    createSelectColumn('statusName', 'statusId', 'Status', [
      { value: '1', label: 'Active' },
      { value: '2', label: 'Inactive' },
    ]),
  ];

  const settings = createQuickTable({
    data,
    columns,
    onDataChange: setData,
    idFieldMap: { statusName: 'statusId' },
  });

  return <HotTable {...settings} />;
}
```

That's it! No complex setup needed.

## Usage

### Basic Setup

```tsx
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react-wrapper';
import { 
  createTableSettings, 
  createTextColumn, 
  createSelectSimpleColumn,
  useAfterChange 
} from 'handsontable-editor';
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';

// Register Handsontable modules (required!)
registerAllModules();

function MyTable() {
  const [data, setData] = useState([
    { id: 1, name: 'John', status: 'active' },
    { id: 2, name: 'Jane', status: 'inactive' },
  ]);

  const columns = [
    createTextColumn({
      data: 'name',
      title: 'Name',
      width: 200,
    }),
    // ... more columns
  ];

  // Simplified afterChange handler - automatically updates data
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

  return <HotTable {...settings} />;
}
```

### Select Column with React Query

```tsx
import { createSelectSimpleColumn } from 'handsontable-editor';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function MyTable() {
  const columns = [
    createSelectSimpleColumn({
      data: 'statusId',
      idField: 'statusId',
      title: 'Status',
      width: 200,
      getOptions: async () => {
        const response = await fetch('/api/statuses');
        const data = await response.json();
        return data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }));
      },
      ReactQueryProvider: QueryClientProvider,
      useQuery: useQuery,
      invalidate: ({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  ];

  // ... rest of your table setup
}
```

### Date Picker Column

```tsx
import { createDatePickerColumn } from 'handsontable-editor';

const columns = [
  createDatePickerColumn({
    data: 'date',
    title: 'Date',
    width: 200,
    format: 'DD/MM/YYYY',
    showTime: false,
    onDateChange: (date, dateString, rowIndex, column) => {
      console.log('Date changed:', date, dateString);
    },
  }),
];
```

### Common Column Types

```tsx
import {
  createTextColumn,
  createNumericColumn,
  createBooleanColumn,
  createActionColumn,
  createCommonColumn,
} from 'handsontable-editor';

const columns = [
  // Text column
  createTextColumn({
    data: 'name',
    title: 'Name',
    width: 200,
    readOnly: false,
  }),

  // Numeric column (requires registerAllModules())
  createNumericColumn('price', 'Price', 150),

  // Boolean column (requires registerAllModules())
  createBooleanColumn('isActive', 'Active', 100),

  // Action column
  createActionColumn({
    data: 'actions',
    title: 'Actions',
    icon: '✏️',
    color: 'blue',
    onClick: (rowIndex) => {
      console.log('Edit row:', rowIndex);
    },
  }),

  // Common column (read-only)
  createCommonColumn('id', 'ID', 100),
];
```

### Table Configuration

```tsx
import { createTableSettings, DEFAULT_TABLE_SETTINGS } from 'handsontable-editor';

const settings = createTableSettings({
  data: myData,
  columns: myColumns,
  afterChange: handleAfterChange,
  beforeValidate: () => true,
  colHeaders: ['Column 1', 'Column 2'],
  classNameMore: 'my-custom-class',
  manualColumnResize: true,
  afterColumnResize: (newSize, column) => {
    console.log('Column resized:', column, newSize);
  },
});
```

### Simplified afterChange Handler

#### `useAfterChange(options)`

React hook that simplifies handling table changes with advanced features like ID field mapping, field dependencies, and validation.

**Options:**
- `columns` (TableColumn[]): Array of column definitions
- `data` (T[]): Current table data
- `setData` (function): State setter function
- `hotInstance` (any, optional): Handsontable instance for advanced features
- `onChange` (function, optional): Callback fired for each change
- `ignoreSources` (ChangeSource[], optional): Sources to ignore (default: ['loadData', 'updateData'])
- `idFieldMap` (IdFieldMap, optional): Map name fields to ID fields (e.g., `{ consigneeName: 'consigneeId' }`)
- `fieldDependencies` (FieldDependencies, optional): Clear related fields when a field changes (e.g., `{ forwarderName: ['driverName', 'truckName'] }`)
- `validations` (Record<string, ValidationFunction>, optional): Custom validation per field
- `useBatchedChanges` (boolean, optional): Use batched changes for better performance (requires hotInstance)
- `onFieldCleared` (function, optional): Callback when a field and its dependencies are cleared

**Basic Example:**
```tsx
const [data, setData] = useState([...]);

const afterChange = useAfterChange({
  columns,
  data,
  setData,
  onChange: (row, prop, oldValue, newValue, updatedData) => {
    console.log(`Changed ${prop} in row ${row}`);
  },
});
```

**Advanced Example with ID Mapping and Dependencies:**
```tsx
const hotTableRef = useRef(null);

const afterChange = useAfterChange({
  columns,
  data,
  setData,
  hotInstance: hotTableRef.current?.hotInstance,
  // Map name fields to ID fields - when name is cleared, ID is also cleared
  idFieldMap: {
    consigneeName: 'consigneeId',
    driverName: 'driverId',
    truckName: 'truckId',
    forwarderName: 'fwdId',
  },
  // When forwarder changes, clear related fields
  fieldDependencies: {
    forwarderName: ['driverName', 'truckName', 'chassisName'],
    consigneeName: ['stuffingPlaceName', 'disbursement'],
  },
  // Custom validation
  validations: {
    containerName: (row, prop, oldValue, newValue, hotInstance) => {
      // Validate container number format
      if (newValue && !/^[A-Z]{4}\d{7}$/.test(newValue)) {
        return 'Invalid container number format';
      }
      return true;
    },
  },
  useBatchedChanges: true, // Better performance
  onFieldCleared: (row, prop, relatedFields) => {
    console.log(`Cleared ${prop} and related fields:`, relatedFields);
  },
});
```

#### `createAfterChangeHandler(options)`

Non-hook version for use outside React components. Supports all the same options as `useAfterChange`.

**Example:**
```tsx
const afterChange = (changes, source) => {
  createAfterChangeHandler({
    changes,
    source,
    columns,
    currentData: data,
    hotInstance: hotTableRef.current?.hotInstance,
    onUpdate: setData,
    idFieldMap: {
      consigneeName: 'consigneeId',
    },
    fieldDependencies: {
      forwarderName: ['driverName', 'truckName'],
    },
    useBatchedChanges: true,
  });
};
```

## API Reference

### Select Column

#### `createSelectSimpleColumn(options)`

Creates a select column configuration.

**Options:**
- `data` (string): Column data key
- `idField` (string): Field name for storing the selected ID
- `title` (string): Column title
- `width` (number, optional): Column width (default: 150)
- `getOptions` (function, optional): Async function to fetch options
- `disabled` (boolean, optional): Whether the column is disabled
- `placeholder` (string, optional): Placeholder text
- `allowClear` (boolean, optional): Allow clearing selection
- `allowAddNew` (boolean, optional): Allow adding new options
- `dependentOn` (string, optional): Field name this column depends on
- `onChange` (function, optional): Callback when value changes
- `ReactQueryProvider` (Component, optional): React Query provider component
- `useQuery` (function, optional): React Query useQuery hook
- `invalidate` (function, optional): React Query invalidate function

### Date Picker Column

#### `createDatePickerColumn(options)`

Creates a date picker column configuration.

**Options:**
- `data` (string): Column data key
- `title` (string): Column title
- `width` (number, optional): Column width (default: 150)
- `format` (string, optional): Date format (default: 'DD/MM/YYYY')
- `showTime` (boolean, optional): Show time picker
- `disabled` (boolean, optional): Whether the column is disabled
- `placeholder` (string, optional): Placeholder text
- `allowClear` (boolean, optional): Allow clearing date
- `disabledDate` (function, optional): Function to disable specific dates
- `onDateChange` (function, optional): Callback when date changes

### Utilities

#### `formatDate(date, format?)`

Formats a date value.

#### `removeAccents(str)`

Removes accents from Vietnamese text.

#### `sortOptions(options, nameField?, order?, field?)`

Sorts options array with enabled items first.

#### `defaultFilterOption(input, option)`

Default filter function for Ant Design Select.

## Styling

The library includes default styles. Import them in your application:

```tsx
import 'handsontable-editor/dist/styles.css';
```

You can override styles using CSS variables or by targeting the class names directly.

## License

MIT
