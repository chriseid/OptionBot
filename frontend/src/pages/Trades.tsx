import React, { useState } from 'react';
import { Card, Table, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Trade } from '../types';

const Trades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);

  const handleCreateTrade = () => {
    // TODO: Open create trade modal/form
    console.log('Create trade clicked');
  };

  const columns: ColumnsType<Trade> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => action.toUpperCase(),
    },
    {
      title: 'Symbol',
      dataIndex: ['option', 'symbol'],
      key: 'symbol',
    },
    {
      title: 'Strike',
      dataIndex: ['option', 'strike'],
      key: 'strike',
    },
    {
      title: 'Type',
      dataIndex: ['option', 'optionType'],
      key: 'optionType',
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'P&L',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl: number) => (
        <span style={{ color: pnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
          ${pnl.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 600 }}>Trades</h1>
          <p style={{ color: '#666', margin: 0 }}>
            View and manage your option trades
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateTrade}
        >
          Create Trade
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={trades}
          rowKey={(record, index) => `trade-${index}`}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No trades yet. Click "Create Trade" to add your first trade.',
          }}
        />
      </Card>
    </div>
  );
};

export default Trades;

