import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  ShoppingCartOutlined,
  LineChartOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 600 }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Welcome to your Option Strategy Calculator and Backtester
      </p>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Trades"
              value={0}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Backtests"
              value={0}
              prefix={<LineChartOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Unrealized P&L"
              value={0}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Quick Start" style={{ marginTop: 24 }}>
        <p style={{ color: '#666', margin: 0 }}>
          Get started by creating a new trade in the Trades page, or run a backtest
          on an existing strategy to see how it would have performed historically.
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;
