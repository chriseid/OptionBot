import React, { useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { Trade } from '../types';

interface DailyPnLChartProps {
  trades: Trade[];
}

interface DailyPnLData {
  date: string;
  dailyPnL: number;
  cumulativePnL: number;
}

const DailyPnLChart: React.FC<DailyPnLChartProps> = ({ trades }) => {
  // Calculate daily P&L from trades
  const dailyPnL = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Group trades by date and sum P&L
    const dailyData: { [key: string]: number } = {};
    trades.forEach((trade) => {
      const date = trade.date;
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += trade.pnl;
    });

    // Convert to array and calculate cumulative P&L
    let cumulativePnL = 0;
    return Object.keys(dailyData)
      .sort()
      .map((date) => {
        cumulativePnL += dailyData[date];
        return {
          date,
          dailyPnL: dailyData[date],
          cumulativePnL,
        };
      });
  }, [trades]);

  if (dailyPnL.length === 0) {
    return null;
  }

  return (
    <Line
      data={dailyPnL}
      xField="date"
      yField="cumulativePnL"
      point={{
        size: 4,
        shape: 'circle',
      }}
      smooth={true}
      color="#1890ff"
      xAxis={{
        label: {
          formatter: (text: string) => {
            return new Date(text).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          },
        },
      }}
      yAxis={{
        label: {
          formatter: (value: number) => `$${value.toFixed(0)}`,
        },
      }}
      tooltip={{
        customContent: (title: string, items: any[]) => {
          if (!items || items.length === 0) return '';
          const item = items[0];
          const dayData = dailyPnL.find((d) => d.date === item.data.date);
          if (!dayData) return '';
          return `
            <div style="padding: 8px;">
              <div style="margin-bottom: 4px; font-weight: 500;">${new Date(item.data.date).toLocaleDateString()}</div>
              <div style="margin-bottom: 4px;">Daily P&L: <span style="color: ${dayData.dailyPnL >= 0 ? '#52c41a' : '#ff4d4f'}">$${dayData.dailyPnL.toFixed(2)}</span></div>
              <div>Cumulative P&L: <span style="color: ${item.data.cumulativePnL >= 0 ? '#52c41a' : '#ff4d4f'}">$${item.data.cumulativePnL.toFixed(2)}</span></div>
            </div>
          `;
        },
      }}
      style={{ marginBottom: 24, height: 300 }}
    />
  );
};

export default DailyPnLChart;

