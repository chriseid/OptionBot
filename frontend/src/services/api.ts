import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Option Strategy API
export const strategyService = {
  getAll: () => apiClient.get('/strategies'),
  getById: (id: string) => apiClient.get(`/strategies/${id}`),
  create: (data: any) => apiClient.post('/strategies', data),
  update: (id: string, data: any) => apiClient.put(`/strategies/${id}`, data),
  delete: (id: string) => apiClient.delete(`/strategies/${id}`),
};

// Backtest API
export const backtestService = {
  run: (strategyId: string, params: any) => 
    apiClient.post(`/backtest/${strategyId}`, params),
  getResults: (backtestId: string) => 
    apiClient.get(`/backtest/results/${backtestId}`),
};

// Market Data API
export const marketDataService = {
  getOptions: (symbol: string) => 
    apiClient.get(`/market-data/options/${symbol}`),
  getHistoricalData: (symbol: string, startDate: string, endDate: string) =>
    apiClient.get(`/market-data/historical/${symbol}`, {
      params: { startDate, endDate },
    }),
};

export default apiClient;

