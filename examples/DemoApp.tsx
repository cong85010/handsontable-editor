import React, { useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { BasicExample } from './BasicExample';
import { AdvancedExample } from './AdvancedExample';
import { ValidationExample } from './ValidationExample';
import 'handsontable/dist/handsontable.full.min.css';
import 'handsontable-editor/dist/styles.css';

/**
 * Demo App - Showcases all handsontable-editor v2.0.0 features
 * 
 * This app demonstrates:
 * 1. Basic usage with TableContainer
 * 2. Advanced features (column config, resize, validation, etc.)
 * 3. Comprehensive validation system
 */
export const DemoApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');

  const items: TabsProps['items'] = [
    {
      key: 'basic',
      label: '🚀 Basic Example',
      children: <BasicExample />,
    },
    {
      key: 'advanced',
      label: '⚡ Advanced Example',
      children: <AdvancedExample />,
    },
    {
      key: 'validation',
      label: '✅ Validation Example',
      children: <ValidationExample />,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div 
        style={{ 
          backgroundColor: '#1890ff', 
          color: 'white', 
          padding: '20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            📊 Handsontable Editor v2.0.0 - Demo
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            Complete feature demonstration with working examples
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            size="large"
          />
        </div>

        {/* Footer Info */}
        <div 
          style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <h3>📚 Quick Navigation</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Basic */}
            <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0, color: '#1890ff' }}>🚀 Basic Example</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Perfect for getting started. Shows fundamental features like adding rows, 
                select columns, and date pickers.
              </p>
              <ul style={{ fontSize: '13px', color: '#888' }}>
                <li>Simple setup</li>
                <li>Basic column types</li>
                <li>Add row functionality</li>
              </ul>
            </div>

            {/* Advanced */}
            <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0, color: '#52c41a' }}>⚡ Advanced Example</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Production-ready implementation with all features: column config, 
                validation, row coloring, and more.
              </p>
              <ul style={{ fontSize: '13px', color: '#888' }}>
                <li>Full feature set</li>
                <li>Field dependencies</li>
                <li>Autofill with ID mapping</li>
              </ul>
            </div>

            {/* Validation */}
            <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0, color: '#fa8c16' }}>✅ Validation Example</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Demonstrates comprehensive data validation with error highlighting 
                and ISO container validation.
              </p>
              <ul style={{ fontSize: '13px', color: '#888' }}>
                <li>Cell-level errors</li>
                <li>ISO 6346 validation</li>
                <li>Custom validation rules</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <h4 style={{ marginTop: 0 }}>💡 Pro Tips</h4>
            <ul style={{ marginBottom: 0 }}>
              <li><strong>Column Configuration:</strong> Click "Cột" button to show/hide or freeze columns</li>
              <li><strong>Autofill:</strong> Drag the corner of a cell to copy values (IDs are automatically mapped)</li>
              <li><strong>Validation:</strong> Invalid cells are highlighted with red borders - hover to see error messages</li>
              <li><strong>Row Coloring:</strong> Select rows and use the color picker to highlight them</li>
              <li><strong>Multi-Duplicate:</strong> Select multiple rows and duplicate them N times at once</li>
              <li><strong>Persistence:</strong> Column widths and visibility are saved to localStorage</li>
            </ul>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            <p>
              📖 <a href="https://github.com/yourusername/handsontable-editor" target="_blank" rel="noopener noreferrer">Documentation</a>
              {' | '}
              🐛 <a href="https://github.com/yourusername/handsontable-editor/issues" target="_blank" rel="noopener noreferrer">Report Issues</a>
              {' | '}
              ⭐ <a href="https://github.com/yourusername/handsontable-editor" target="_blank" rel="noopener noreferrer">Star on GitHub</a>
            </p>
            <p style={{ marginTop: '10px' }}>
              Built with ❤️ using React, Handsontable, and Ant Design
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoApp;

