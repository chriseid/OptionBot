import React from 'react';
import { Statistic, Row, Col } from 'antd';
import { BacktestResult } from '../types';

interface BacktestStatisticsProps {
  result: BacktestResult;
}

const BacktestStatistics: React.FC<BacktestStatisticsProps> = ({ result }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Statistic
          title="Total Return"
          value={result.totalReturn}
          precision={2}
          suffix="%"
          valueStyle={{ color: result.totalReturn >= 0 ? '#52c41a' : '#ff4d4f' }}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Statistic
          title="Final Capital"
          value={result.finalCapital}
          precision={2}
          prefix="$"
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Statistic
          title="Max Drawdown"
          value={result.maxDrawdown}
          precision={2}
          suffix="%"
          valueStyle={{ color: '#ff4d4f' }}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Statistic
          title="Sharpe Ratio"
          value={result.sharpeRatio}
          precision={2}
        />
      </Col>
    </Row>
  );
};

export default BacktestStatistics;

