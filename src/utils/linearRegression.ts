import { StockData, PredictionResult, ModelMetrics } from '../types/stock';

export class LinearRegression {
  private slope: number = 0;
  private intercept: number = 0;
  private r2: number = 0;
  private mse: number = 0;

  train(data: StockData[]): void {
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.price);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;

    // Calculate R² and MSE
    const predictions = x.map(xi => this.slope * xi + this.intercept);
    const meanY = sumY / n;
    
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    
    this.r2 = 1 - (ssRes / ssTot);
    this.mse = ssRes / n;
  }

  predict(daysAhead: number, baseIndex: number): number {
    return this.slope * (baseIndex + daysAhead) + this.intercept;
  }

  getMetrics(data: StockData[]): ModelMetrics {
    const lastPrice = data[data.length - 1].price;
    const firstPrice = data[0].price;
    const trend = lastPrice > firstPrice ? 'bullish' : lastPrice < firstPrice ? 'bearish' : 'neutral';
    
    return {
      accuracy: Math.max(0, Math.min(100, this.r2 * 100)),
      mse: this.mse,
      r2Score: this.r2,
      trend,
    };
  }

  predictFuture(data: StockData[], days: number): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    const baseIndex = data.length - 1;
    const lastDate = new Date(data[data.length - 1].date);
    
    // Calculate standard error for confidence intervals
    const standardError = Math.sqrt(this.mse);
    
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      
      const predictedPrice = this.predict(i, baseIndex);
      const confidence = Math.max(50, 95 - (i * 2)); // Confidence decreases with time
      
      // Confidence intervals (roughly 95% confidence)
      const margin = 1.96 * standardError * Math.sqrt(1 + i * 0.1);
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predictedPrice,
        confidence,
        lowerBound: predictedPrice - margin,
        upperBound: predictedPrice + margin,
      });
    }
    
    return predictions;
  }
}