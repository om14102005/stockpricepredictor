import React, { useState, useEffect } from 'react';
import { Activity, Brain, TrendingUp, RefreshCw } from 'lucide-react';
import { StockSearch } from './components/StockSearch';
import { StockChart } from './components/StockChart';
import { PredictionCard } from './components/PredictionCard';
import { TimeframeSelector } from './components/TimeframeSelector';
import { StockData, PredictionResult, ModelMetrics, StockSymbol } from './types/stock';
import { generateMockStockData } from './utils/stockData';
import { LinearRegression } from './utils/linearRegression';

function App() {
  const [selectedStock, setSelectedStock] = useState<StockSymbol | null>(null);
  const [historicalData, setHistoricalData] = useState<StockData[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [predictionDays, setPredictionDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  const model = new LinearRegression();

  const handleStockSelect = (stock: StockSymbol) => {
    setSelectedStock(stock);
    loadStockData(stock.symbol);
  };

  const loadStockData = async (symbol: string) => {
    setIsLoading(true);
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = generateMockStockData(symbol, 365);
      setHistoricalData(data);
      
      // Train model and generate predictions
      model.train(data);
      const newPredictions = model.predictFuture(data, predictionDays);
      const newMetrics = model.getMetrics(data);
      
      setPredictions(newPredictions);
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeframeChange = (days: number) => {
    setPredictionDays(days);
    if (historicalData.length > 0) {
      const newPredictions = model.predictFuture(historicalData, days);
      setPredictions(newPredictions);
    }
  };

  const refreshPredictions = () => {
    if (selectedStock) {
      loadStockData(selectedStock.symbol);
    }
  };

  useEffect(() => {
    // Load default stock on app start
    const defaultStock = { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' };
    handleStockSelect(defaultStock);
  }, []);

  const getTimeframeLabel = (days: number) => {
    if (days === 1) return '1 Day';
    if (days === 7) return '1 Week';
    if (days === 14) return '2 Weeks';
    if (days === 30) return '1 Month';
    return `${days} Days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Price Predictor</h1>
                <p className="text-sm text-gray-600">Advanced ML-powered price forecasting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-gray-600">Live Analysis</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <StockSearch 
                onSelectStock={handleStockSelect}
                selectedStock={selectedStock}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <TimeframeSelector
                selected={predictionDays}
                onSelect={handleTimeframeChange}
              />
              <button
                onClick={refreshPredictions}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-12 mb-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing {selectedStock?.symbol}</h3>
                <p className="text-gray-600">Training prediction model with historical data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && selectedStock && historicalData.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="xl:col-span-2">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedStock.name} ({selectedStock.symbol})
                    </h2>
                    <p className="text-gray-600">{selectedStock.sector}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600">
                      Current: ${historicalData[historicalData.length - 1]?.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <StockChart
                  historicalData={historicalData}
                  predictions={predictions}
                  width={800}
                  height={400}
                />
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Historical Data: {historicalData.length} days</span>
                    <span>Predictions: {getTimeframeLabel(predictionDays)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction Panel */}
            <div className="space-y-6">
              {metrics && (
                <PredictionCard
                  predictions={predictions}
                  metrics={metrics}
                  timeframe={getTimeframeLabel(predictionDays)}
                />
              )}
              
              {/* Additional Metrics */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">52-Week High</span>
                    <span className="font-medium">${Math.max(...historicalData.map(d => d.high)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">52-Week Low</span>
                    <span className="font-medium">${Math.min(...historicalData.map(d => d.low)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Volume</span>
                    <span className="font-medium">{(historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Volatility</span>
                    <span className="font-medium">
                      {(Math.sqrt(historicalData.reduce((sum, d, i, arr) => {
                        if (i === 0) return 0;
                        const change = (d.price - arr[i-1].price) / arr[i-1].price;
                        return sum + change * change;
                      }, 0) / (historicalData.length - 1)) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 mb-1">Investment Disclaimer</h4>
                    <p className="text-sm text-amber-700">
                      This is a demonstration using simulated data. Not financial advice. Always consult professionals before investing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;