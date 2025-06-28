import { StockData, StockSymbol } from '../types/stock';

export const mockStockSymbols: StockSymbol[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
];

export function generateMockStockData(symbol: string, days: number = 365): StockData[] {
  const data: StockData[] = [];
  const today = new Date();
  
  // Base price varies by symbol
  const basePrices: { [key: string]: number } = {
    'AAPL': 175,
    'GOOGL': 135,
    'MSFT': 340,
    'AMZN': 145,
    'TSLA': 245,
    'NVDA': 450,
    'META': 320,
    'JPM': 155,
    'V': 240,
    'JNJ': 165,
  };
  
  let currentPrice = basePrices[symbol] || 100;
  const trend = Math.random() > 0.5 ? 1 : -1;
  const volatility = 0.02 + Math.random() * 0.03;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some trend and random walk
    const dailyChange = (Math.random() - 0.5) * volatility * currentPrice;
    const trendComponent = trend * 0.001 * currentPrice;
    
    currentPrice += dailyChange + trendComponent;
    currentPrice = Math.max(currentPrice, 10); // Prevent negative prices
    
    const high = currentPrice * (1 + Math.random() * 0.02);
    const low = currentPrice * (1 - Math.random() * 0.02);
    const open = currentPrice + (Math.random() - 0.5) * 0.01 * currentPrice;
    const volume = Math.floor(1000000 + Math.random() * 5000000);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: currentPrice,
      volume,
      high,
      low,
      open,
      close: currentPrice,
    });
  }
  
  return data;
}