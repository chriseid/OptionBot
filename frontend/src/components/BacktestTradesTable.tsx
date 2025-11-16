import React from 'react';
import { Table } from 'antd';
import { Trade } from '../types';

interface BacktestTradesTableProps {
  trades: Trade[];
}

const BacktestTradesTable: React.FC<BacktestTradesTableProps> = ({ trades }) => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => action.toUpperCase(),
    },
    {
      title: 'Strike',
      dataIndex: ['option', 'strike'],
      key: 'strike',
      render: (strike: number) => `$${strike.toFixed(2)}`,
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
    <Table
      columns={columns}
      dataSource={trades}
      rowKey={(record, index) => `${record.date}-${index}`}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default BacktestTradesTable;

