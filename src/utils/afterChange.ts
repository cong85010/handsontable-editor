// Types for Handsontable changes
export type CellChange = [number, string | number, any, any];
export type ChangeSource = string;

export interface TableColumn {
  data?: string;
  [key: string]: any;
}

/**
 * Maps name fields to their corresponding ID fields
 * Example: { consigneeName: 'consigneeId', driverName: 'driverId' }
 */
export type IdFieldMap = Record<string, string>;

/**
 * Defines field dependencies - when a field changes, clear related fields
 * Example: { forwarderName: ['driverName', 'truckName', 'chassisName'] }
 */
export type FieldDependencies = Record<string, string[]>;

/**
 * Custom validation function
 * Returns true if valid, false or error message if invalid
 */
export type ValidationFunction = (
  row: number,
  prop: string,
  oldValue: any,
  newValue: any,
  hotInstance?: any,
) => boolean | string;

export interface AfterChangeOptions<T = any> {
  changes: CellChange[] | null;
  source: ChangeSource;
  columns: TableColumn[];
  currentData: T[];
  hotInstance?: any;
  onUpdate?: (updatedData: T[]) => void;
  onChange?: (row: number, prop: string, oldValue: any, newValue: any, updatedData: T[]) => void;
  ignoreSources?: ChangeSource[];
  /**
   * Map name fields to ID fields
   * When a name field changes, automatically update/clear the corresponding ID field
   */
  idFieldMap?: IdFieldMap;
  /**
   * Field dependencies - when a field changes, clear related fields
   */
  fieldDependencies?: FieldDependencies;
  /**
   * Custom validation functions per field
   */
  validations?: Record<string, ValidationFunction>;
  /**
   * Whether to use batched changes for better performance (requires hotInstance)
   */
  useBatchedChanges?: boolean;
  /**
   * Callback when a field is cleared (value becomes null/empty)
   */
  onFieldCleared?: (row: number, prop: string, relatedFields: string[]) => void;
}

/**
 * Simplified afterChange handler that automatically updates data based on changes
 * 
 * @example
 * ```tsx
 * const [data, setData] = useState([...]);
 * 
 * const afterChange = createAfterChangeHandler({
 *   changes,
 *   source,
 *   columns,
 *   currentData: data,
 *   onUpdate: setData,
 * });
 * ```
 */
/**
 * Check if a value is empty (null, undefined, or empty string)
 */
const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

/**
 * Helper to get property name from column
 */
const getPropFromColumn = (
  col: string | number,
  columns: TableColumn[],
  hotInstance?: any,
): string | undefined => {
  if (typeof col === 'string') {
    return col;
  }

  if (typeof col === 'number') {
    const prop = columns[col]?.data;
    if (prop) return prop;

    // Try hotInstance if available
    if (hotInstance) {
      try {
        return hotInstance.colToProp(col);
      } catch (error) {
        // Fallback already tried
      }
    }
  }

  return undefined;
};

export const createAfterChangeHandler = <T extends Record<string, any>>({
  changes,
  source,
  columns,
  currentData,
  hotInstance,
  onUpdate,
  onChange,
  ignoreSources = ['loadData', 'updateData'],
  idFieldMap = {},
  fieldDependencies = {},
  validations = {},
  useBatchedChanges = false,
  onFieldCleared,
}: AfterChangeOptions<T>) => {
  // Ignore certain sources
  if (!changes || ignoreSources.includes(source)) {
    return;
  }

  try {
    const newData = [...currentData];
    const batchedChanges: [number, string, any][] = [];
    const changedProps = new Set<string>();

    // Collect all changed properties first
    changes.forEach(([, col]) => {
      const prop = getPropFromColumn(col, columns, hotInstance);
      if (prop) {
        changedProps.add(prop);
      }
    });

    // Process each change
    changes.forEach(([row, col, oldValue, newValue]) => {
      if (row === null || row === undefined) return;

      const prop = getPropFromColumn(col, columns, hotInstance);
      if (!prop) return;

      // Skip if value hasn't actually changed
      if (oldValue === newValue) return;

      // Run validation if provided
      if (validations[prop]) {
        const validationResult = validations[prop](row, prop, oldValue, newValue, hotInstance);
        if (validationResult !== true) {
          console.warn(`Validation failed for ${prop}:`, validationResult);
          // Optionally skip this change or handle error
        }
      }

      // Handle ID field mapping
      if (idFieldMap[prop]) {
        const idField = idFieldMap[prop];
        
        // If name field is cleared, also clear the ID field
        if (isEmpty(newValue)) {
          if (useBatchedChanges && hotInstance) {
            batchedChanges.push([row, idField, null]);
          } else {
            if (newData[row]) {
              newData[row] = {
                ...newData[row],
                [idField]: null,
              };
            }
          }
        }
        // Note: ID field is typically set by the select renderer, not here
      }

      // Handle field dependencies - clear related fields when this field changes
      if (fieldDependencies[prop] && fieldDependencies[prop].length > 0) {
        const relatedFields = fieldDependencies[prop];
        
        if (onFieldCleared) {
          onFieldCleared(row, prop, relatedFields);
        }

        relatedFields.forEach((relatedField) => {
          if (useBatchedChanges && hotInstance) {
            batchedChanges.push([row, relatedField, null]);
          } else {
            if (newData[row]) {
              newData[row] = {
                ...newData[row],
                [relatedField]: null,
              };
            }
          }
        });
      }

      // Update the main field
      if (useBatchedChanges && hotInstance) {
        batchedChanges.push([row, prop, newValue]);
      } else {
        if (newData[row]) {
          newData[row] = {
            ...newData[row],
            [prop]: newValue,
          };
        }
      }

      // Call onChange callback if provided
      if (onChange) {
        onChange(row, prop, oldValue, newValue, newData);
      }
    });

    // Apply batched changes if using hotInstance
    if (useBatchedChanges && hotInstance && batchedChanges.length > 0) {
      try {
        // Use batch for better performance
        hotInstance.batch(() => {
          batchedChanges.forEach(([row, prop, value]) => {
            hotInstance.setDataAtRowProp(row, prop, value);
          });
        });
      } catch (error) {
        console.error('Error applying batched changes:', error);
        // Fallback to regular update
        batchedChanges.forEach(([row, prop, value]) => {
          if (newData[row]) {
            newData[row] = {
              ...newData[row],
              [prop]: value,
            };
          }
        });
      }
    }

    // Call onUpdate callback if provided
    if (onUpdate) {
      onUpdate(newData);
    }

    return newData;
  } catch (error) {
    console.error('Error handling afterChange:', error);
    return currentData;
  }
};

/**
 * React hook for easier afterChange handling
 * 
 * @example
 * ```tsx
 * const [data, setData] = useState([...]);
 * const afterChange = useAfterChange({ columns, data, setData });
 * 
 * const settings = createTableSettings({
 *   data,
 *   columns,
 *   afterChange,
 *   ...
 * });
 * ```
 */
export interface UseAfterChangeOptions<T = any> {
  columns: TableColumn[];
  data: T[];
  setData: (data: T[]) => void;
  hotInstance?: any;
  onChange?: (row: number, prop: string, oldValue: any, newValue: any, updatedData: T[]) => void;
  ignoreSources?: ChangeSource[];
  idFieldMap?: IdFieldMap;
  fieldDependencies?: FieldDependencies;
  validations?: Record<string, ValidationFunction>;
  useBatchedChanges?: boolean;
  onFieldCleared?: (row: number, prop: string, relatedFields: string[]) => void;
}

/**
 * React hook for easier afterChange handling with advanced features
 * 
 * @example
 * ```tsx
 * const [data, setData] = useState([...]);
 * const hotTableRef = useRef(null);
 * 
 * const afterChange = useAfterChange({
 *   columns,
 *   data,
 *   setData,
 *   hotInstance: hotTableRef.current?.hotInstance,
 *   idFieldMap: {
 *     consigneeName: 'consigneeId',
 *     driverName: 'driverId',
 *   },
 *   fieldDependencies: {
 *     forwarderName: ['driverName', 'truckName', 'chassisName'],
 *   },
 *   useBatchedChanges: true,
 * });
 * ```
 */
export const useAfterChange = <T extends Record<string, any>>({
  columns,
  data,
  setData,
  hotInstance,
  onChange,
  ignoreSources,
  idFieldMap,
  fieldDependencies,
  validations,
  useBatchedChanges,
  onFieldCleared,
}: UseAfterChangeOptions<T>) => {
  return (changes: CellChange[] | null, source: ChangeSource) => {
    createAfterChangeHandler({
      changes,
      source,
      columns,
      currentData: data,
      hotInstance,
      onUpdate: setData,
      onChange,
      ignoreSources,
      idFieldMap,
      fieldDependencies,
      validations,
      useBatchedChanges,
      onFieldCleared,
    });
  };
};

