# 🚀 Quick Start Guide - Handsontable Editor v2.0.0

Get up and running in 5 minutes!

## 📦 Installation

```bash
npm install handsontable-editor handsontable @handsontable/react-wrapper antd dayjs
# or
yarn add handsontable-editor handsontable @handsontable/react-wrapper antd dayjs
# or
pnpm add handsontable-editor handsontable @handsontable/react-wrapper antd dayjs
```

## ⚡ Minimal Setup (30 seconds)

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
    createTextColumn({ data: 'id', title: 'ID', width: 100, readOnly: true }),
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

export default MyTable;
```

**That's it!** You now have a fully functional editable table with add row button. 🎉

---

## 🎨 Add More Features (5 minutes)

### 1. Add Validation

```tsx
import { highlightInvalidCellsBulletproof, type CellError } from 'handsontable-editor';

const validateData = () => {
  const errors: CellError[] = [];
  
  data.forEach((row, index) => {
    if (!row.name) {
      errors.push({ row: index, col: 'name', message: 'Name is required' });
    }
  });
  
  if (errors.length > 0) {
    highlightInvalidCellsBulletproof(hotTableRef.current?.hotInstance, errors);
  }
};

// Add button
<button onClick={validateData}>Validate</button>
```

### 2. Add Column Configuration

```tsx
import { useColumnConfig } from 'handsontable-editor';

const { tableColumns, handleColumnsChange, handleResetColumns } = useColumnConfig({
  baseTableColumns: columns,
  hotTableRef,
  storageKey: 'my-table-columns',
});

// Use tableColumns instead of columns
<TableContainer
  tableColumns={tableColumns}
  onColumnsChange={handleColumnsChange}
  onReset={handleResetColumns}
  // ... other props
/>
```

### 3. Add Row Coloring

```tsx
import { colorSelectedRows } from 'handsontable-editor';

const handleColorChange = (color: string) => {
  colorSelectedRows(hotTableRef.current?.hotInstance, color);
};

<TableContainer
  onColorSelectedRows={handleColorChange}
  // ... other props
/>
```

---

## 📚 Ready-to-Use Examples

Copy and run complete examples from the `/examples` directory:

### Basic Example
```bash
cp node_modules/handsontable-editor/examples/BasicExample.tsx src/
```

### Advanced Example (All Features)
```bash
cp node_modules/handsontable-editor/examples/AdvancedExample.tsx src/
```

### Validation Example
```bash
cp node_modules/handsontable-editor/examples/ValidationExample.tsx src/
```

### Demo App (All Examples in Tabs)
```bash
cp node_modules/handsontable-editor/examples/DemoApp.tsx src/
```

---

## 🎯 Choose Your Path

### Path 1: Start Simple → Add Features Later
1. Use Basic Example
2. Add features one by one as needed
3. Refer to Advanced Example for implementation

### Path 2: Start with Everything
1. Copy Advanced Example
2. Remove features you don't need
3. Customize to your use case

### Path 3: Learn by Doing
1. Run DemoApp
2. Interact with all features
3. Copy code snippets you like

---

## 🔥 Common Use Cases

### Editable Data Grid
```tsx
<TableContainer
  hotTableRef={hotTableRef}
  tableSettings={settings}
  onAddNewRow={handleAdd}
  showDuplicateButton
/>
```

### Read-Only Table with Export
```tsx
const settings = createTableSettings({
  data,
  columns,
  readOnly: true, // Make entire table read-only
});
```

### Table with Validation
```tsx
<TableContainer
  hotTableRef={hotTableRef}
  tableSettings={settings}
  customButtons={
    <button onClick={validateData}>Validate</button>
  }
/>
```

### Table with Custom Actions
```tsx
const customButtons = (
  <>
    <button onClick={handleExport}>Export</button>
    <button onClick={handleImport}>Import</button>
    <button onClick={handleSave}>Save</button>
  </>
);

<TableContainer
  customButtons={customButtons}
  // ... other props
/>
```

---

## 🐛 Troubleshooting

### Issue: Numeric/Checkbox columns not working
**Solution:** Add at top of file:
```tsx
import { registerAllModules } from 'handsontable/registry';
registerAllModules();
```

### Issue: Styles not showing
**Solution:** Import CSS:
```tsx
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';
```

### Issue: TypeScript errors
**Solution:** Install types:
```bash
npm install --save-dev @types/react @types/react-dom
```

---

## 📖 Next Steps

1. ✅ **Explore Examples** - See `/examples` directory
2. 📚 **Read Full Docs** - Check [README.md](./README.md)
3. 🔄 **Migration Guide** - If upgrading from v1.x, see [MIGRATION-2.0.md](./MIGRATION-2.0.md)
4. 🎯 **Feature List** - Full capabilities in [FEATURES-SUMMARY.md](./FEATURES-SUMMARY.md)

---

## 💡 Tips

- **Start small** - Begin with basic features, add complexity later
- **Use TypeScript** - Get better autocomplete and type safety
- **Check examples** - Working code is the best documentation
- **Read comments** - Example files have detailed inline comments
- **Test validation** - Always validate data before saving

---

## 🎉 You're Ready!

You now have everything you need to build powerful editable tables. Happy coding! 🚀

For questions or issues, check out:
- 📖 [Full Documentation](./README.md)
- 💬 [GitHub Issues](https://github.com/yourusername/handsontable-editor/issues)
- 📧 [Contact](mailto:your@email.com)

