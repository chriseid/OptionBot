import React, { useState } from 'react';
import { Card, Table, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Strategy, CreateStrategyFormData } from '../types';
import CreateStrategyModal from '../components/CreateStrategyModal';

const Strategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Load strategies from localStorage on mount
  React.useEffect(() => {
    const savedStrategies = localStorage.getItem('strategies');
    if (savedStrategies) {
      setStrategies(JSON.parse(savedStrategies));
    }
  }, []);

  const handleCreateStrategy = () => {
    console.log('Opening create strategy modal');
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleStrategySubmit = async (data: CreateStrategyFormData) => {
    try {
      // Create strategy with delta values
      const newStrategy: Strategy = {
        id: Date.now().toString(),
        name: `${data.strategy} - ${data.symbol} ${data.expiration}`,
        symbol: data.symbol,
        strategy: data.strategy,
        expiration: data.expiration,
        legs: data.legs,
        quantity: data.quantity,
        createdAt: new Date().toISOString(),
      };

      const updatedStrategies = [...strategies, newStrategy];
      setStrategies(updatedStrategies);
      
      // Save to localStorage so Backtester can access it
      localStorage.setItem('strategies', JSON.stringify(updatedStrategies));
      
      message.success('Strategy created successfully!');
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to create strategy');
      console.error(error);
    }
  };

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
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 600 }}>Strategies</h1>
          <p style={{ color: '#666', margin: 0 }}>
            View and manage your option strategies
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateStrategy}
        >
          Create Strategy
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={strategies}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No strategies yet. Click "Create Strategy" to add your first strategy.',
          }}
        />
      </Card>

      <CreateStrategyModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleStrategySubmit}
      />
    </div>
  );
};

export default Strategies;
