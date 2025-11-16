import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { Strategy, BacktestResult } from '../types';
import { strategyService, backtestService } from '../services/api';
import dayjs, { Dayjs } from 'dayjs';
import DailyPnLChart from '../components/DailyPnLChart';
import BacktestForm from '../components/BacktestForm';
import BacktestStatistics from '../components/BacktestStatistics';
import BacktestTradesTable from '../components/BacktestTradesTable';

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

      <BacktestForm
        strategies={strategies}
        strategyId={strategyId}
        onStrategyChange={setStrategyId}
        initialCapital={initialCapital}
        onInitialCapitalChange={setInitialCapital}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onRunBacktest={handleRunBacktest}
        loading={loading}
        runningBacktest={runningBacktest}
      />

      {backtestResult && (
        <Card title="Backtest Results" style={{ marginTop: 24 }}>
          <BacktestStatistics result={backtestResult} />

          <h3 style={{ marginTop: 24, marginBottom: 16 }}>Daily P&L</h3>
          <DailyPnLChart trades={backtestResult.trades} />

          <h3 style={{ marginTop: 24, marginBottom: 16 }}>Trades</h3>
          <BacktestTradesTable trades={backtestResult.trades} />
        </Card>
      )}
    </div>
  );
};

export default Backtester;
