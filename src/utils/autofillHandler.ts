import { handleBulkOperations } from './bulkOperations';

export interface AutofillHandlerOptions {
  hotInstance: any;
  idFieldMap?: Record<string, string>;
  fieldDependencies?: Record<string, string[]>;
  onFieldCopied?: (row: number, prop: string, sourceValue: any, sourceId?: any) => void;
  useBatchedChanges?: boolean;
}

/**
 * Advanced autofill handler with ID field mapping and dependencies
 * Handles copying ID fields when name fields are copied
 * Manages field dependencies when parent fields change
 */
export const createAutofillHandler = (options: AutofillHandlerOptions) => {
  const {
    hotInstance,
    idFieldMap = {},
    fieldDependencies = {},
    onFieldCopied,
    useBatchedChanges = true,
  } = options;

  return (fillData: any[][], sourceRange: any, targetRange: any, direction: string) => {
    if (!hotInstance) return;

    try {
      const batchedChanges: [number, string, unknown][] = [];
      
      // Get source row data to copy IDs from
      const sourceRow = sourceRange.from.row;
      const sourceRowData = hotInstance.getSourceDataAtRow(sourceRow);

      const processChanges = () => {
        // Track pending changes for each row
        const pendingChangesMap = new Map<number, Record<string, unknown>>();

        for (let row = targetRange.from.row; row <= targetRange.to.row; row++) {
          // Get current row data BEFORE any changes
          const currentRowData = hotInstance.getSourceDataAtRow(row);

          // Initialize pending changes for this row
          if (!pendingChangesMap.has(row)) {
            pendingChangesMap.set(row, {});
          }

          for (let col = targetRange.from.col; col <= targetRange.to.col; col++) {
            const cellMeta = hotInstance.getCellMeta(row, col);
            const prop = cellMeta?.prop;

            // Skip readonly columns
            if (cellMeta?.readOnly) continue;

            // Handle ID field mapping for name fields
            const idField = idFieldMap[prop];

            if (idField) {
              // Get the ID from the source row
              const sourceId = sourceRowData[idField];
              const pendingChanges = pendingChangesMap.get(row)!;

              if (sourceId) {
                // Copy the ID from source row to target row
                batchedChanges.push([row, idField, sourceId]);
                pendingChanges[idField] = sourceId;
              } else {
                // If no ID in source row, clear the ID field
                batchedChanges.push([row, idField, null]);
                pendingChanges[idField] = null;
              }

              // Handle field dependencies
              if (fieldDependencies[prop]) {
                const currentFieldId = currentRowData[idField];
                
                // Only clear dependencies if the field actually changed
                if (currentFieldId && sourceId !== currentFieldId) {
                  fieldDependencies[prop].forEach(depField => {
                    batchedChanges.push([row, depField, null]);
                    pendingChanges[depField] = null;
                    
                    // Also clear the ID field for the dependent field if it has one
                    const depIdField = idFieldMap[depField];
                    if (depIdField) {
                      batchedChanges.push([row, depIdField, null]);
                      pendingChanges[depIdField] = null;
                    }
                  });
                }
              }

              // Callback for custom logic
              if (onFieldCopied) {
                onFieldCopied(row, prop, sourceRowData[prop], sourceId);
              }
            }
          }
        }

        // Apply all batched changes at once
        if (batchedChanges.length > 0) {
          hotInstance.setDataAtRowProp(batchedChanges, 'autofill');
        }
      };

      if (useBatchedChanges) {
        handleBulkOperations(hotInstance, processChanges);
      } else {
        processChanges();
      }
    } catch (error) {
      console.error('Autofill error:', error);
    }
  };
};

/**
 * React hook version of autofill handler
 */
export const useAutofillHandler = (options: Omit<AutofillHandlerOptions, 'hotInstance'>) => {
  return (hotInstance: any) => createAutofillHandler({ ...options, hotInstance });
};

