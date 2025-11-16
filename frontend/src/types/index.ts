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
  symbol: string;
  strategy: 'Iron Condor';
  expiration: '0DTE' | 'Next Day';
  legs: IronCondorLegs;
  quantity: number;
  createdAt: string;
}

export interface BacktestResult {
  strategyId: string;
  backtestId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Trade[];
  createdAt: string;
}

export interface Trade {
  date: string;
  action: 'buy' | 'sell';
  option: Option;
  price: number;
  pnl: number;
}

export type IronCondorLeg = 'longPut' | 'shortPut' | 'shortCall' | 'longCall';

export interface IronCondorLegs {
  longPut?: number; // delta value
  shortPut?: number; // delta value
  shortCall?: number; // delta value
  longCall?: number; // delta value
}

export interface CreateStrategyFormData {
  symbol: string;
  strategy: 'Iron Condor';
  expiration: '0DTE' | 'Next Day';
  legs: IronCondorLegs;
  quantity: number;
}

