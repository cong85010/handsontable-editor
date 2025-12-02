import React, { useState } from 'react';
import { Button, Modal, InputNumber, message } from 'antd';
import { Copy } from 'lucide-react';
import { getSelectedRowIndices, duplicateRowAt } from '../utils/bulkOperations';

export interface DuplicateMultiRowProps {
  hotTableRef: React.RefObject<any>;
  maxDuplicates?: number;
  buttonText?: string;
  buttonSize?: 'small' | 'middle' | 'large';
}

export const DuplicateMultiRow: React.FC<DuplicateMultiRowProps> = ({
  hotTableRef,
  maxDuplicates = 100,
  buttonText = 'Nhân bản',
  buttonSize = 'middle',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(1);
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);

  const handleOpenModal = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) {
      message.warning('Table instance not available');
      return;
    }

    const indices = getSelectedRowIndices(hotInstance);
    
    if (indices.length === 0) {
      message.warning('Vui lòng chọn ít nhất một dòng để nhân bản');
      return;
    }

    setSelectedRowIndices(indices);
    setDuplicateCount(1);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    const hotInstance = hotTableRef.current?.hotInstance;
    if (!hotInstance) return;

    if (duplicateCount < 1 || duplicateCount > maxDuplicates) {
      message.error(`Số lần nhân bản phải từ 1 đến ${maxDuplicates}`);
      return;
    }

    try {
      // Sort in descending order to avoid index shifting
      const sortedIndices = [...selectedRowIndices].sort((a, b) => b - a);

      // For each selected row, duplicate it N times
      sortedIndices.forEach((rowIndex) => {
        for (let i = 0; i < duplicateCount; i++) {
          // Add offset for previously duplicated rows
          const currentIndex = rowIndex + (i * sortedIndices.length);
          duplicateRowAt(hotInstance, currentIndex);
        }
      });

      message.success(`Đã nhân bản ${selectedRowIndices.length} dòng thành ${selectedRowIndices.length * duplicateCount} dòng`);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error duplicating rows:', error);
      message.error('Không thể nhân bản dòng');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="default"
        size={buttonSize}
        onClick={handleOpenModal}
        icon={<Copy size={16} />}
      >
        {buttonText}
      </Button>

      <Modal
        title="Nhân bản dòng"
        open={isModalOpen}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Số dòng đã chọn: <strong>{selectedRowIndices.length}</strong>
          </p>
          <p style={{ marginTop: '16px' }}>Số lần nhân bản mỗi dòng:</p>
          <InputNumber
            min={1}
            max={maxDuplicates}
            value={duplicateCount}
            onChange={(value) => setDuplicateCount(value || 1)}
            style={{ width: '100%' }}
          />
          <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
            Tổng số dòng sau khi nhân bản: <strong>{selectedRowIndices.length * duplicateCount}</strong>
          </p>
        </div>
      </Modal>
    </>
  );
};

