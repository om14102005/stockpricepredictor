import React from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { PredictionResult, ModelMetrics } from '../types/stock';

interface PredictionCardProps {
  predictions: PredictionResult[];
  metrics: ModelMetrics;
  timeframe: string;
}

export function PredictionCard({ predictions, metrics, timeframe }: PredictionCardProps) {
  if (predictions.length === 0) return null;

  const latestPrediction = predictions[predictions.length - 1];
  const firstPrediction = predictions[0];
  const priceChange = latestPrediction.predictedPrice - firstPrediction.predictedPrice;
  const percentChange = (priceChange / firstPrediction.predictedPrice) * 100;

  const getTrendIcon = () => {
    if (metrics.trend === 'bullish') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (metrics.trend === 'bearish') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <BarChart3 className="w-5 h-5 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {timeframe} Prediction
        </h3>
        {getTrendIcon()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Target Price</span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${latestPrediction.predictedPrice.toFixed(2)}
          </div>
          <div className={`text-sm ${getTrendColor(priceChange)}`}>
            {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%)
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Confidence</div>
          <div className="text-2xl font-bold text-gray-900">
            {latestPrediction.confidence.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${latestPrediction.confidence}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Price Range</span>
          <span className="font-medium">
            ${latestPrediction.lowerBound.toFixed(2)} - ${latestPrediction.upperBound.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Model Accuracy</span>
          <span className={`font-medium ${metrics.accuracy > 70 ? 'text-green-600' : metrics.accuracy > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {metrics.accuracy.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">R² Score</span>
          <span className="font-medium text-gray-900">
            {metrics.r2Score.toFixed(3)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Trend</span>
          <span className={`font-medium capitalize ${
            metrics.trend === 'bullish' ? 'text-green-600' : 
            metrics.trend === 'bearish' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {metrics.trend}
          </span>
        </div>
      </div>
    </div>
  );
}