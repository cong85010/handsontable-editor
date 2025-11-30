/**
 * Initialize Handsontable by registering all modules
 * This must be called before using Handsontable cell types like 'numeric' or 'checkbox'
 * 
 * @example
 * ```tsx
 * import { initHandsontable } from 'handsontable-editor';
 * import { registerAllModules } from 'handsontable/registry';
 * 
 * // Call this once in your app (e.g., in main.tsx or App.tsx)
 * initHandsontable();
 * ```
 */
export const initHandsontable = () => {
  // Dynamic import to avoid bundling handsontable
  if (typeof window !== 'undefined') {
    import('handsontable/registry').then(({ registerAllModules }) => {
      registerAllModules();
    }).catch((error) => {
      console.warn('Failed to register Handsontable modules:', error);
    });
  }
};

