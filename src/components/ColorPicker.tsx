import React, { useState } from 'react';
import { Button, Popover } from 'antd';

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  size?: 'small' | 'middle' | 'large';
  colors?: string[];
  disabled?: boolean;
}

const DEFAULT_COLORS = [
  '#ffffff', // White
  '#ffcccc', // Light Red
  '#ffe6cc', // Light Orange
  '#ffffcc', // Light Yellow
  '#ccffcc', // Light Green
  '#ccffff', // Light Cyan
  '#ccccff', // Light Blue
  '#ffccff', // Light Purple
  '#ffebcd', // Blanched Almond
  '#ffd700', // Gold
  '#98fb98', // Pale Green
  '#87ceeb', // Sky Blue
  '#dda0dd', // Plum
  '#f0e68c', // Khaki
  '#ffa07a', // Light Salmon
  '#d3d3d3', // Light Gray
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#ffffff',
  onChange,
  size = 'middle',
  colors = DEFAULT_COLORS,
  disabled = false,
}) => {
  const [selectedColor, setSelectedColor] = useState(value);
  const [open, setOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onChange?.(color);
    setOpen(false);
  };

  const colorGrid = (
    <div style={{ width: '240px', padding: '8px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => handleColorSelect(color)}
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: color,
              border: selectedColor === color ? '2px solid #1890ff' : '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Popover
      content={colorGrid}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Button
        size={size}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: selectedColor,
            border: '1px solid #d9d9d9',
            borderRadius: '2px',
          }}
        />
        <span>Tô màu</span>
      </Button>
    </Popover>
  );
};

