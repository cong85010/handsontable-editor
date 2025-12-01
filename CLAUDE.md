# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `handsontable-editor`, an npm library that provides reusable Handsontable components and utilities for React projects. It wraps Handsontable with custom renderers for select dropdowns, date pickers, and common column types, using Ant Design components for the UI.

**Key Dependencies:**
- Handsontable ^15.0.0 (peer dependency)
- React ^18.0.0 (peer dependency)
- Ant Design ^5.0.0 (peer dependency)
- dayjs for date handling

## Build Commands

```bash
# Build the library (outputs to dist/)
npm run build
# or
pnpm build

# Development mode with watch
npm run dev
# or
pnpm dev

# Prepare for publishing (runs build)
npm run prepublishOnly
```

## Architecture Overview

### Module System
This library is built as an ES module (`"type": "module"`) using Rollup. Build outputs:
- `dist/index.js` - CommonJS format
- `dist/index.esm.js` - ES module format
- `dist/index.d.ts` - TypeScript declarations
- `dist/styles.css` - Extracted styles

### Core Architecture Pattern

The library uses a **custom renderer pattern** where React components are dynamically mounted inside Handsontable cells using `createRoot()` from React 18. This is critical to understand when modifying renderers.

**Key Pattern:**
1. Column creator functions (e.g., `createSelectSimpleColumn`) return Handsontable column configuration objects
2. These configs include custom `renderer` functions that:
   - Initially render cells as plain HTML for performance
   - On user interaction (e.g., double-click), mount React components into the cell using `createRoot()`
   - Store the React root instance on the TD element (`td._selectRoot`)
   - Clean up via `afterDestroy` lifecycle hook

**Example from [selectSimpleRender.tsx:700-783](src/components/selectSimpleRender.tsx#L700-L783):**
- First render: Display static text or placeholder
- Double-click: Create React root, render `<SelectCell>` component
- Cleanup: Unmount root and remove event listeners

### Configuration Registry Pattern

Component configurations are managed through a registry pattern:
- `src/store/select.store.ts` - Manages select column configurations (options, callbacks, etc.)
- `src/store/datepicker.store.ts` - Manages date picker configurations

**How it works:**
1. When creating a column (e.g., `createSelectSimpleColumn`), the configuration is registered in a global registry
2. Renderers retrieve the configuration using the column's `data` property as the lookup key
3. This decouples column creation from rendering, allowing configurations to persist across re-renders

### Data Update Flow

**Critical:** Understanding the data synchronization between Handsontable and React state:

1. User edits cell → Handsontable `afterChange` event fires
2. `useAfterChange` hook (or `createAfterChangeHandler`) processes changes
3. Handler supports advanced features:
   - **ID field mapping** (`idFieldMap`): When a name field is cleared, automatically clear its ID field
   - **Field dependencies** (`fieldDependencies`): When field A changes, clear dependent fields B, C
   - **Batched updates**: Use `hotInstance.batch()` for performance when multiple cells change
4. Updated data is passed to React state setter

**Example from [utils/afterChange.ts](src/utils/afterChange.ts):**
```typescript
idFieldMap: { consigneeName: 'consigneeId' }  // Clear consigneeId when consigneeName is cleared
fieldDependencies: { forwarderName: ['driverName', 'truckName'] }  // Clear dependent fields
```

### Column Types

Four main categories in `src/components/`:

1. **Basic columns** ([common.tsx](src/components/common.tsx)): Text, numeric, boolean, action
2. **Select columns** ([selectSimpleRender.tsx](src/components/selectSimpleRender.tsx)): Custom dropdown with search, add-new, dependent filtering
3. **Date columns** ([datePickerRenderer.tsx](src/components/datePickerRenderer.tsx)): Date picker with Vietnamese locale
4. **Status columns** ([statusRow.tsx](src/components/statusRow.tsx)): Visual row status indicators

### Helper Layer

`src/helpers.ts` provides simplified APIs:
- `createQuickTable()` - One-function setup for common use cases
- `ColumnPresets` - Pre-configured columns (id, name, price, etc.)
- `ColumnGroups` - Common column combinations (basic, product, timestamps)

This layer is the **recommended entry point** for library users.

## Important Implementation Details

### React Query Integration

Select columns support optional React Query integration via props:
- `ReactQueryProvider` - Wraps the component
- `useQuery` - Custom query hook
- `invalidate` - Cache invalidation function

If these aren't provided, the component falls back to manual fetching with local state.

### Row Status System

The library uses a `typeRow` field (enum `TYPE_ROW`) to track row state:
- `CREATE` - Newly created row
- `EDITING` - Modified existing row
- `DELETE` - Soft-deleted row (not physically removed)

Context menu operations ([utils/contextMenu.ts](src/utils/contextMenu.ts)) respect this system.

### Handsontable Module Registration

**Critical requirement:** Users must call `registerAllModules()` before using cell types like `numeric` or `checkbox`. This is documented extensively in README but not enforced by the library itself.

### External Dependencies

All peer dependencies are externalized in Rollup config to prevent bundling:
- React and all submodules (including jsx-runtime)
- Handsontable
- Ant Design
- dayjs, lucide-react

**Note:** Only `lucide-react` is a direct dependency (not a peer dependency). All others must be provided by the consuming application.

When modifying `rollup.config.js`, ensure new dependencies follow this externalization pattern.

## File Organization

```
src/
├── components/          # Column renderers (React components)
├── config/             # Table configuration (settings, defaults)
├── store/              # Configuration registries for components
├── utils/              # Utilities (afterChange, contextMenu)
├── helpers.ts          # Simplified API (recommended for users)
├── types.ts            # TypeScript interfaces
├── constants.ts        # Constants (table config, prefixes)
├── utils.ts            # General utilities (date, string, sorting)
├── init.ts             # Handsontable initialization helper
├── styles.scss         # Component styles (extracted to dist/styles.css)
└── index.ts            # Public API exports
```

## Common Modification Patterns

### Adding a New Column Type

1. Create component in `src/components/` with custom renderer
2. Create column factory function (e.g., `createXColumn`)
3. Export from `src/components/` and re-export in `src/helpers.ts`
4. Add to `src/index.ts` exports
5. Follow the React-in-cell pattern from `selectSimpleRender.tsx`

### Modifying afterChange Behavior

Edit `src/utils/afterChange.ts`. Key considerations:
- Preserve backwards compatibility with both hook and non-hook versions
- Support batched changes for performance
- Handle both string and numeric column indices
- Maintain idFieldMap and fieldDependencies features

### Adding Table Settings

1. Add to `TableSettingsConfig` interface in `src/config/tableConfig.ts`
2. Update `DEFAULT_TABLE_SETTINGS` constant
3. Add to `createTableSettings` function's return object
4. Update `CreateTableSettingsProps` if it's a user-facing option
