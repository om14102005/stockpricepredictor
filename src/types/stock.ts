export interface StockData {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface PredictionResult {
  date: string;
  predictedPrice: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

export interface ModelMetrics {
  accuracy: number;
  mse: number;
  r2Score: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface StockSymbol {
  symbol: string;
  name: string;
  sector: string;
}