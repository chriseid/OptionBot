// Option Strategy Types
export interface Option {
  symbol: string;
  strike: number;
  expiration: string;
  optionType: 'call' | 'put';
  premium: number;
  quantity: number;
}

export interface Strategy {
  id: string;
  name: string;
  options: Option[];
  createdAt: string;
}

export interface BacktestResult {
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Trade[];
}

export interface Trade {
  date: string;
  action: 'buy' | 'sell';
  option: Option;
  price: number;
  pnl: number;
}

