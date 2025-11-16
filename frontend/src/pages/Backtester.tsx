import React, { useState } from 'react';
import { Card, Form, InputNumber, DatePicker, Select, Button, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { Option: SelectOption } = Select;

const Backtester: React.FC = () => {
  const [form] = Form.useForm();
  const [strategyId, setStrategyId] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [initialCapital, setInitialCapital] = useState(10000);

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
              <SelectOption value="">No strategies available</SelectOption>
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
