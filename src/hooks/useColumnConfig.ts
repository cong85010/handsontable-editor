import { useCallback, useEffect, useMemo, useState } from 'react';

interface TableColumn {
  data?: string;
  hidden?: boolean;
  frozen?: boolean;
  [key: string]: any;
}

interface UseColumnConfigProps {
  baseTableColumns: TableColumn[];
  hotTableRef: React.RefObject<any>;
  storageKey?: string;
}

interface TableSettings {
  newColumnOrder: TableColumn[];
  reorderedHeaders: any[];
  hiddenColumnIndexes: number[];
  frozenColumns: number[];
}

interface SavedColumnSettings {
  key: string;
  hidden?: boolean;
  frozen?: boolean;
  index: number;
}

/**
 * Hook to manage column configuration (show/hide, freeze/unfreeze)
 * Persists settings to localStorage per user
 */
export const useColumnConfig = ({ baseTableColumns, hotTableRef, storageKey }: UseColumnConfigProps) => {
  const [tableColumns, setTableColumns] = useState<TableColumn[]>(baseTableColumns);
  const [pendingColumns, setPendingColumns] = useState<TableColumn[] | null>(null);

  const applySettings = useCallback(
    (cols: TableColumn[]) => {
      const hot = hotTableRef.current?.hotInstance;
      if (!hot) return;
      const pluginManualColumnFreeze = hot.getPlugin('manualColumnFreeze');
      try {
        if (pluginManualColumnFreeze) {
          cols.forEach((col) => {
            const virtualIndex = hot.propToCol(col.data);
            if (col.frozen) {
              pluginManualColumnFreeze.freezeColumn(virtualIndex);
            } else {
              pluginManualColumnFreeze.unfreezeColumn(virtualIndex);
            }
          });
        }

        hot.render();
      } catch (error) {
        console.error('Error applying table settings:', error);
      }
    },
    [hotTableRef],
  );

  const handleColumnsChange = useCallback((newColumns: TableColumn[]) => {
    setPendingColumns(newColumns);
  }, []);

  const handleApplyChanges = useCallback(() => {
    if (!pendingColumns) return;

    setTableColumns(pendingColumns);
    applySettings(pendingColumns);

    if (storageKey) {
      const columnSettings: SavedColumnSettings[] = pendingColumns.map(({ data, hidden, frozen }, index) => ({
        key: data || '',
        hidden,
        frozen,
        index,
      }));
      localStorage.setItem(storageKey, JSON.stringify(columnSettings));
    }

    setPendingColumns(null);

    // Reload the page after applying changes (to ensure frozen columns work correctly)
    window.location.reload();
  }, [pendingColumns, applySettings, storageKey]);

  const handleCancelChanges = useCallback(() => {
    setPendingColumns(null);
  }, []);

  const handleResetColumns = useCallback(() => {
    const resetColumns = baseTableColumns.map((col) => ({ ...col, frozen: false, hidden: false }));
    setTableColumns(resetColumns);
    applySettings(resetColumns);

    hotTableRef.current?.hotInstance?.updateSettings({
      columns: resetColumns,
    });

    if (storageKey) {
      localStorage.removeItem(storageKey);
    }

    // Clear any staged changes and reload
    setPendingColumns(null);
    window.location.reload();
  }, [baseTableColumns, applySettings, storageKey, hotTableRef]);

  const tableSettings = useMemo((): TableSettings => {
    const hiddenColumnIndexes = tableColumns.map((col, idx) => (col?.hidden ? idx : -1)).filter((idx: number) => idx >= 0);
    const frozenColumns = tableColumns.map((col, idx) => (col?.frozen ? idx : -1)).filter((idx: number) => idx >= 0);

    return {
      newColumnOrder: tableColumns,
      reorderedHeaders: [], // Populate with actual headers if needed
      hiddenColumnIndexes,
      frozenColumns,
    };
  }, [tableColumns]);

  // Load saved settings from localStorage
  useEffect(() => {
    if (!storageKey) return;

    const savedSettings = localStorage.getItem(storageKey);
    if (!savedSettings) return;

    try {
      const parsedSettings = JSON.parse(savedSettings) as SavedColumnSettings[];
      const settingsMap = new Map(parsedSettings.map((s) => [s.key, s]));

      const updatedColumns = baseTableColumns.map((col) => {
        const savedSetting = settingsMap.get(col.data || '');
        if (savedSetting) {
          return {
            ...col,
            frozen: savedSetting.frozen || false,
            hidden: savedSetting.hidden || false,
          };
        }
        return col;
      });

      setTableColumns(updatedColumns);
      applySettings(updatedColumns);
    } catch (error) {
      console.error('Failed to parse saved column settings:', error);
    }
  }, [baseTableColumns, storageKey, applySettings]);

  // Update columns when base changes
  useEffect(() => {
    setTableColumns(baseTableColumns);
  }, [baseTableColumns]);

  return {
    tableColumns,
    tableSettings,
    handleColumnsChange,
    handleResetColumns,
    pendingColumns,
    handleApplyChanges,
    handleCancelChanges,
  };
};

