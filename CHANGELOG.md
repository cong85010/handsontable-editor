# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2024-12-02

### 🎉 Major Release - Complete Feature Parity with Container Order Implementation

This release brings all advanced features from the production container-order implementation into the handsontable-editor library, making it a comprehensive solution for complex table applications.

### ✨ New Features

#### UI Components
- **TableContainer** - Comprehensive table wrapper with integrated toolbar, loading state, and action buttons
- **ColumnConfig** - Advanced column configuration with search, show/hide, freeze/unfreeze capabilities
- **ColorPicker** - Row coloring component with 16 preset colors
- **DuplicateMultiRow** - Multi-row duplication with customizable count
- **SelectCountRow** - Live display of selected row count

#### React Hooks
- **useColumnConfig** - State management for column visibility and freezing with localStorage persistence
- **useColumnResize** - Column width management with user-specific localStorage persistence

#### Validation System
- Cell-level error highlighting with tooltips
- ISO 6346 container number validation
- Bulletproof column resolution for error highlighting
- Row-level error highlighting by ID/UUID
- Comprehensive date and numeric validation utilities

#### Bulk Operations
- `handleBulkOperations` - Batch operation wrapper for performance
- `batchUpdateCells` - Update multiple cells efficiently
- `colorSelectedRows` - Color multiple rows at once
- `getSelectedRowIndices` - Get all selected row indices
- `getSelectedRowsData` - Get data for selected rows
- `duplicateRowAt` - Duplicate row with automatic ID generation
- `deleteRowsByIndices` - Delete multiple rows efficiently

#### Autofill Handler
- Advanced autofill with ID field mapping
- Field dependency management (clear related fields)
- Batched updates for better performance
- Custom callback support

#### Utilities
- `createEmptyRow` - Generate new rows with default values
- `clearRowField` / `clearRowFields` - Clear specific fields
- `validateContainerISO` - ISO 6346 container validation
- `validateDate` - Date validation with past date checking
- `validateNumericValue` - Numeric range validation
- `isEmpty` - Comprehensive empty value checking

### 🔧 Enhancements

- Improved TypeScript definitions for all new features
- Memoized components for better performance
- Comprehensive error handling in all utilities
- localStorage integration for user preferences
- Full keyboard navigation support

### 📚 Documentation

- Updated README with comprehensive examples for all new features
- Added MIGRATION-2.0.md guide for easy upgrading
- Expanded API reference with all new functions and components
- Added inline code examples

### 🏗️ Architecture

- Modular hook system for easy feature adoption
- Separation of concerns between UI and logic
- Performance-optimized batch operations
- Flexible component composition

### 🔄 Backward Compatibility

**This release is 100% backward compatible** - All v1.x code continues to work without modifications. New features are opt-in.

### 📦 Dependencies

- Added: `container-validator` for ISO container validation

### 🐛 Bug Fixes

- Fixed TypeScript strict mode warnings
- Improved error handling in validation utilities
- Enhanced column resize behavior with frozen columns

---

## [1.1.5] - 2024-11-XX

### Previous features
- Basic select column renderer
- Date picker renderer
- Common column types
- Table configuration
- Basic utilities

---

For full migration guide, see [MIGRATION-2.0.md](./MIGRATION-2.0.md)

