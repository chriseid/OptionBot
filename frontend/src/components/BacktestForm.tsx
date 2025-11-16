import React from 'react';
import { Card, Form, InputNumber, DatePicker, Select, Button } from 'antd';
import { Strategy } from '../types';
import { Dayjs } from 'dayjs';

const { Option: SelectOption } = Select;

interface BacktestFormProps {
  strategies: Strategy[];
  strategyId: string;
  onStrategyChange: (value: string) => void;
  initialCapital: number;
  onInitialCapitalChange: (value: number) => void;
  startDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  endDate: Dayjs | null;
  onEndDateChange: (date: Dayjs | null) => void;
  onRunBacktest: () => void;
  loading: boolean;
  runningBacktest: boolean;
}

const BacktestForm: React.FC<BacktestFormProps> = ({
  strategies,
  strategyId,
  onStrategyChange,
  initialCapital,
  onInitialCapitalChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onRunBacktest,
  loading,
  runningBacktest,
}) => {
  return (
    <Card>
      <Form layout="vertical">
        <Form.Item label="Select Strategy">
          <Select
            value={strategyId}
            onChange={onStrategyChange}
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
            onChange={(value) => onInitialCapitalChange(value || 0)}
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '')) || 0}
          />
        </Form.Item>

        <Form.Item label="Start Date">
          <DatePicker
            style={{ width: '100%' }}
            value={startDate}
            onChange={onStartDateChange}
          />
        </Form.Item>

        <Form.Item label="End Date">
          <DatePicker
            style={{ width: '100%' }}
            value={endDate}
            onChange={onEndDateChange}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            size="large"
            onClick={onRunBacktest}
            loading={runningBacktest}
            disabled={!strategyId || !startDate || !endDate}
          >
            Run Backtest
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BacktestForm;

