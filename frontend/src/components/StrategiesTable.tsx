import React from 'react';
import { Table, Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Strategy } from '../types';

interface StrategiesTableProps {
  strategies: Strategy[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const StrategiesTable: React.FC<StrategiesTableProps> = ({
  strategies,
  loading,
  onDelete,
}) => {
  const columns: ColumnsType<Strategy> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Expiration',
      dataIndex: 'expiration',
      key: 'expiration',
    },
    {
      title: 'Legs',
      key: 'legs',
      render: (_, record) => {
        const legCount = Object.values(record.legs || {}).filter(v => v !== undefined && v !== null).length;
        return `${legCount} legs`;
      },
    },
    {
      title: 'Deltas',
      key: 'deltas',
      render: (_, record) => {
        const deltas = [];
        if (record.legs?.longPut !== undefined) deltas.push(`LP: ${record.legs.longPut}`);
        if (record.legs?.shortPut !== undefined) deltas.push(`SP: ${record.legs.shortPut}`);
        if (record.legs?.shortCall !== undefined) deltas.push(`SC: ${record.legs.shortCall}`);
        if (record.legs?.longCall !== undefined) deltas.push(`LC: ${record.legs.longCall}`);
        return deltas.join(', ');
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this strategy?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={strategies}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      locale={{
        emptyText: 'No strategies yet. Click "Create Strategy" to add your first strategy.',
      }}
    />
  );
};

export default StrategiesTable;

