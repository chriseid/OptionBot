import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Strategy, CreateStrategyFormData } from '../types';
import { strategyService } from '../services/api';
import CreateStrategyModal from '../components/CreateStrategyModal';

const Strategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load strategies from API on mount
  React.useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const response = await strategyService.getAll();
      setStrategies(response.data);
    } catch (error: any) {
      message.error('Failed to load strategies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStrategy = () => {
    console.log('Opening create strategy modal');
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleStrategySubmit = async (data: CreateStrategyFormData) => {
    try {
      const response = await strategyService.create(data);
      message.success('Strategy created successfully!');
      setModalVisible(false);
      loadStrategies(); // Reload strategies from API
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to create strategy');
      console.error(error);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    try {
      await strategyService.delete(id);
      message.success('Strategy deleted successfully!');
      loadStrategies(); // Reload strategies from API
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to delete strategy');
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this strategy?"
            onConfirm={() => handleDeleteStrategy(record.id)}
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
          loading={loading}
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
