import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, DatePicker, Select, Button, Space } from 'antd';
import { Strategy } from '../types';
import { strategyService } from '../services/api';
import dayjs, { Dayjs } from 'dayjs';

const { Option: SelectOption } = Select;

const Backtester: React.FC = () => {
  const [form] = Form.useForm();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [strategyId, setStrategyId] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [initialCapital, setInitialCapital] = useState(10000);

  // Load strategies on mount
  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      // TODO: Use actual API call when backend is ready
      // const response = await strategyService.getAll();
      // setStrategies(response.data);
      
      // For now, load from localStorage or use empty array
      // Strategies will be loaded from the Strategies page state
      const savedStrategies = localStorage.getItem('strategies');
      if (savedStrategies) {
        setStrategies(JSON.parse(savedStrategies));
      }
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  };

  const handleRunBacktest = () => {
    // TODO: Implement backtest logic
    console.log('Running backtest...', {
      strategyId,
      startDate: startDate?.format('YYYY-MM-DD'),
      endDate: endDate?.format('YYYY-MM-DD'),
      initialCapital,
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 600 }}>Strategy Backtester</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Test your option strategies against historical data
      </p>

      <Card>
        <Form layout="vertical">
          <Form.Item label="Select Strategy">
            <Select
              value={strategyId}
              onChange={setStrategyId}
              placeholder="Select a strategy"
            >
              {strategies.length === 0 ? (
                <SelectOption value="">No strategies available</SelectOption>
              ) : (
                strategies.map((strategy) => (
                  <SelectOption key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </SelectOption>
                ))
              )}
            </Select>
          </Form.Item>

          <Form.Item label="Initial Capital">
            <InputNumber
              style={{ width: '100%' }}
              value={initialCapital}
              onChange={(value) => setInitialCapital(value || 0)}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '')) || 0}
            />
          </Form.Item>

          <Form.Item label="Start Date">
            <DatePicker
              style={{ width: '100%' }}
              value={startDate}
              onChange={setStartDate}
            />
          </Form.Item>

          <Form.Item label="End Date">
            <DatePicker
              style={{ width: '100%' }}
              value={endDate}
              onChange={setEndDate}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              onClick={handleRunBacktest}
              disabled={!strategyId || !startDate || !endDate}
            >
              Run Backtest
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Backtest Results" style={{ marginTop: 24 }}>
        <p style={{ color: '#666', margin: 0 }}>
          Run a backtest to see results here
        </p>
      </Card>
    </div>
  );
};

export default Backtester;
