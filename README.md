# handsontable-editor

A reusable npm library providing Handsontable components and utilities for React projects. This library includes custom renderers for select dropdowns, date pickers, and common column types.

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
- `zustand` ^4.0.0

## Features

- **Select Column Renderer**: Custom select dropdown with search, add new option, and dependent filtering
- **Date Picker Renderer**: Custom date picker with Vietnamese locale support
- **Common Column Types**: Text, numeric, boolean, action, and common column creators
- **Table Configuration**: Pre-configured Handsontable settings
- **Utilities**: Helper functions for date formatting, sorting, and more

## Usage

### Basic Setup

```tsx
import { HotTable } from '@handsontable/react-wrapper';
import { createTableSettings, createTextColumn, createSelectSimpleColumn } from 'handsontable-editor';
import 'handsontable-editor/dist/styles.css';

function MyTable() {
  const data = [
    { id: 1, name: 'John', status: 'active' },
    { id: 2, name: 'Jane', status: 'inactive' },
  ];

  const columns = [
    createTextColumn({
      data: 'name',
      title: 'Name',
      width: 200,
    }),
    // ... more columns
  ];

  const settings = createTableSettings({
    data,
    columns,
    afterChange: (changes) => {
      console.log('Changes:', changes);
    },
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

  // Numeric column
  createNumericColumn('price', 'Price', 150),

  // Boolean column
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

