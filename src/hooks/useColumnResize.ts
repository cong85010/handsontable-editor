import { useCallback, useEffect, useMemo, useState } from 'react';

interface TableColumn {
  data?: string;
  width?: number;
  [key: string]: any;
}

interface UseColumnResizeProps {
  columnSettings: TableColumn[];
  hotTableRef: React.RefObject<any>;
  storageKey?: string;
}

interface SavedColumnWidths {
  [columnKey: string]: number;
}

/**
 * Hook to manage column resize and persist widths to localStorage
 */
export const useColumnResize = ({ columnSettings, hotTableRef, storageKey }: UseColumnResizeProps) => {
  const [columnWidths, setColumnWidths] = useState<SavedColumnWidths>({});

  // Load saved column widths from localStorage
  useEffect(() => {
    if (!storageKey) return;

    const savedWidths = localStorage.getItem(storageKey);
    if (!savedWidths) return;

    try {
      const parsedWidths = JSON.parse(savedWidths) as SavedColumnWidths;
      setColumnWidths(parsedWidths);
    } catch (error) {
      console.error('Failed to parse saved column widths:', error);
    }
  }, [storageKey]);

  // Save column widths to localStorage
  const saveColumnWidths = useCallback(
    (widths: SavedColumnWidths) => {
      if (!storageKey) return;

      try {
        localStorage.setItem(storageKey, JSON.stringify(widths));
        setColumnWidths(widths);
      } catch (error) {
        console.error('Failed to save column widths:', error);
      }
    },
    [storageKey],
  );

  // Handle column resize event
  const handleAfterColumnResize = useCallback(
    (newSize: number, column: number) => {
      const hotInstance = hotTableRef.current?.hotInstance;
      if (!hotInstance) return;

      try {
        // Get the physical column index (handles frozen columns correctly)
        const physicalColumn = hotInstance.toPhysicalColumn(column);

        // Get the column data key using the physical column index
        const columnKey =
          physicalColumn !== null && physicalColumn !== undefined
            ? columnSettings[physicalColumn]?.data
            : columnSettings[column]?.data;

        if (!columnKey) return;

        // Update column widths state
        const updatedWidths = {
          ...columnWidths,
          [columnKey]: newSize,
        };

        // Save to localStorage
        saveColumnWidths(updatedWidths);
      } catch (error) {
        console.error('Error handling column resize:', error);
      }
    },
    [columnSettings, columnWidths, saveColumnWidths, hotTableRef],
  );

  // Get manual column resize configuration
  const manualColumnResize = useMemo(() => {
    // If no saved widths, enable with true
    if (Object.keys(columnWidths).length === 0) {
      return true;
    }

    // Create array of column widths based on saved data
    const widthsArray = columnSettings.map((column) => {
      const savedWidth = columnWidths[column.data || ''];
      return savedWidth || column.width || 100; // Default width 100px
    });

    return widthsArray;
  }, [columnSettings, columnWidths]);

  // Reset column widths
  const resetColumnWidths = useCallback(() => {
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
      setColumnWidths({});
    } catch (error) {
      console.error('Failed to reset column widths:', error);
    }
  }, [storageKey]);

  return {
    manualColumnResize,
    handleAfterColumnResize,
    resetColumnWidths,
    columnWidths,
  };
};

