import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, DatePicker, Select, Button, Space, Table, Statistic, Row, Col, message } from 'antd';
import { Strategy, BacktestResult, Trade } from '../types';
import { strategyService, backtestService } from '../services/api';
import dayjs, { Dayjs } from 'dayjs';

const { Option: SelectOption } = Select;

const Backtester: React.FC = () => {

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [strategyId, setStrategyId] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [initialCapital, setInitialCapital] = useState(10000);

  const [runningBacktest, setRunningBacktest] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Load strategies on mount
  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const response = await strategyService.getAll();
      setStrategies(response.data);
    } catch (error) {
      message.error('Failed to load strategies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBacktest = async () => {
    if (!strategyId || !startDate || !endDate) {
      message.warning('Please fill in all fields');
      return;
    }

    try {
      setRunningBacktest(true);
      const response = await backtestService.run(strategyId, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        initialCapital,
      });
      setBacktestResult(response.data);
      message.success('Backtest completed successfully!');
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Failed to run backtest');
      console.error(error);
    } finally {
      setRunningBacktest(false);
    }
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
              loading={loading}
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
              loading={runningBacktest}
              disabled={!strategyId || !startDate || !endDate}
            >
              Run Backtest
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {backtestResult && (
        <Card title="Backtest Results" style={{ marginTop: 24 }}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Total Return"
                value={backtestResult.totalReturn}
                precision={2}
                suffix="%"
                valueStyle={{ color: backtestResult.totalReturn >= 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Final Capital"
                value={backtestResult.finalCapital}
                precision={2}
                prefix="$"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Max Drawdown"
                value={backtestResult.maxDrawdown}
                precision={2}
                suffix="%"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Sharpe Ratio"
                value={backtestResult.sharpeRatio}
                precision={2}
              />
            </Col>
          </Row>

          <h3 style={{ marginTop: 24, marginBottom: 16 }}>Trades</h3>
          <Table
            columns={[
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
            ]}
            dataSource={backtestResult.trades}
            rowKey={(record, index) => `${record.date}-${index}`}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
};

export default Backtester;
