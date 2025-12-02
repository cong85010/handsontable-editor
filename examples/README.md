# Handsontable Editor - Examples

This directory contains comprehensive examples demonstrating all features of the handsontable-editor library v2.0.0.

## 📚 Available Examples

### 1. BasicExample.tsx
**Simple usage with essential features**

Features demonstrated:
- ✅ TableContainer component
- ✅ Basic column types (text, numeric, select, datepicker)
- ✅ Simple afterChange handler
- ✅ Add new row functionality
- ✅ ID field mapping

**Use case:** Quick start for simple tables

---

### 2. AdvancedExample.tsx
**Complete feature showcase**

Features demonstrated:
- ✅ TableContainer with all UI components
- ✅ Column configuration (show/hide, freeze)
- ✅ Column resize persistence
- ✅ Row coloring
- ✅ Multi-row duplication
- ✅ Selected row counter
- ✅ Autofill with ID mapping
- ✅ Field dependencies
- ✅ Custom validation button
- ✅ Bulk operations

**Use case:** Production-ready implementation with all advanced features

---

### 3. ValidationExample.tsx
**Comprehensive validation demonstration**

Features demonstrated:
- ✅ Cell-level error highlighting
- ✅ ISO 6346 container validation
- ✅ Date validation (no past dates)
- ✅ Numeric validation (positive numbers)
- ✅ Required field validation
- ✅ Error tooltips
- ✅ Clear errors functionality

**Use case:** Data validation and quality control

---

## 🚀 How to Use These Examples

### In a React Project

1. **Install dependencies:**
```bash
npm install handsontable-editor handsontable @handsontable/react-wrapper antd dayjs react react-dom
```

2. **Copy example file:**
```bash
cp examples/BasicExample.tsx src/
```

3. **Import and use:**
```tsx
import { BasicExample } from './BasicExample';

function App() {
  return <BasicExample />;
}
```

4. **Import required CSS:**
```tsx
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';
```

---

### In a Next.js Project

1. **Create a client component:**
```tsx
// app/components/TableExample.tsx
'use client';

import dynamic from 'next/dynamic';

const BasicExample = dynamic(() => import('./BasicExample'), {
  ssr: false,
});

export default function TableExample() {
  return <BasicExample />;
}
```

2. **Use in page:**
```tsx
// app/page.tsx
import TableExample from './components/TableExample';

export default function Page() {
  return <TableExample />;
}
```

---

### Standalone Demo

Create a new React app and copy an example:

```bash
# Create new app
npx create-react-app my-demo
cd my-demo

# Install dependencies
npm install handsontable-editor handsontable @handsontable/react-wrapper antd dayjs

# Copy example
cp path/to/examples/AdvancedExample.tsx src/App.tsx

# Run
npm start
```

---

## 📖 Example Comparison

| Feature | Basic | Advanced | Validation |
|---------|-------|----------|------------|
| TableContainer | ✅ | ✅ | ✅ |
| Add Row | ✅ | ✅ | ✅ |
| Column Types | ✅ | ✅ | ✅ |
| Column Config | ❌ | ✅ | ❌ |
| Column Resize | ❌ | ✅ | ❌ |
| Row Coloring | ❌ | ✅ | ❌ |
| Duplication | ❌ | ✅ | ❌ |
| Validation | ❌ | ✅ | ✅ (Advanced) |
| Autofill | ❌ | ✅ | ❌ |
| Dependencies | ❌ | ✅ | ❌ |
| Custom Buttons | ❌ | ✅ | ✅ |

---

## 🎯 Choose Your Starting Point

### Start with Basic if:
- You need a simple editable table
- You don't need advanced features yet
- You want to understand core concepts first

### Start with Advanced if:
- You need full feature set
- You're building a production application
- You want to see all capabilities

### Start with Validation if:
- Data quality is critical
- You need comprehensive validation
- You want to understand error handling

---

## 💡 Tips for Each Example

### BasicExample
- Focus on understanding the table setup
- Learn ID field mapping concept
- Experiment with adding/removing columns

### AdvancedExample
- Try all the UI interactions
- Test field dependencies (forwarder → driver/truck)
- Experiment with column configuration
- Test autofill with ID fields
- Try multi-row duplication

### ValidationExample
- Enter intentionally invalid data
- Observe error highlighting
- Read error messages in tooltips
- Test with valid data to see success state
- Learn validation patterns for your use case

---

## 🔧 Customization Guide

### Modify Data Structure

Change the interface to match your data:

```tsx
interface YourData {
  // Your fields here
}

const [data, setData] = useState<YourData[]>([...]);
```

### Add Custom Columns

```tsx
const columns = [
  // ... existing columns
  createTextColumn({
    data: 'yourField',
    title: 'Your Title',
    width: 200,
  }),
];
```

### Add Custom Validation

```tsx
const validateData = useCallback(() => {
  const errors: CellError[] = [];
  
  data.forEach((row, rowIndex) => {
    if (yourValidationCondition) {
      errors.push({ 
        row: rowIndex, 
        col: 'fieldName', 
        message: 'Error message' 
      });
    }
  });
  
  if (errors.length > 0) {
    highlightInvalidCellsBulletproof(hotInstance, errors);
    return false;
  }
  
  return true;
}, [data]);
```

---

## 🐛 Common Issues & Solutions

### Issue: Handsontable modules not registered
**Solution:** Add at top of file:
```tsx
import { registerAllModules } from 'handsontable/registry';
registerAllModules();
```

### Issue: Styles not applied
**Solution:** Import CSS files:
```tsx
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';
```

### Issue: TypeScript errors
**Solution:** Install type definitions:
```bash
npm install --save-dev @types/react @types/react-dom
```

### Issue: Column resize not persisting
**Solution:** Make sure `storageKey` is unique:
```tsx
storageKey: `your-app-name-${userId}-columns`
```

---

## 📚 Further Reading

- [Main README](../README.md) - Complete API documentation
- [Migration Guide](../MIGRATION-2.0.md) - Upgrade from v1.x
- [Feature Summary](../FEATURES-SUMMARY.md) - All features overview
- [Changelog](../CHANGELOG.md) - Version history

---

## 🤝 Contributing Examples

Have a great example? Submit a PR!

Guidelines:
1. Follow existing code style
2. Add comprehensive comments
3. Include usage instructions
4. Test in both dev and production builds

---

## 📝 License

MIT - Same as main library

