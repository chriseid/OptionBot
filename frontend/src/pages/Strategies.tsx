import React, { useState, useEffect } from 'react';
import { Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Strategy, CreateStrategyFormData } from '../types';
import { strategyService } from '../services/api';
import CreateStrategyModal from '../components/CreateStrategyModal';
import StrategiesTable from '../components/StrategiesTable';

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
        <StrategiesTable
          strategies={strategies}
          loading={loading}
          onDelete={handleDeleteStrategy}
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
