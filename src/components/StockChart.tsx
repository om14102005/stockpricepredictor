import React, { useRef, useEffect } from 'react';
import { StockData, PredictionResult } from '../types/stock';

interface StockChartProps {
  historicalData: StockData[];
  predictions: PredictionResult[];
  width?: number;
  height?: number;
}

export function StockChart({ historicalData, predictions, width = 800, height = 400 }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Combine data for scaling
    const allData = [...historicalData, ...predictions.map(p => ({ price: p.predictedPrice, date: p.date }))];
    if (allData.length === 0) return;

    // Calculate scales
    const maxPrice = Math.max(...allData.map(d => d.price));
    const minPrice = Math.min(...allData.map(d => d.price));
    const priceRange = maxPrice - minPrice;
    const padding = 50;

    const xScale = (width - 2 * padding) / (allData.length - 1);
    const yScale = (height - 2 * padding) / priceRange;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (i * priceRange) / 5;
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.fillText(`$${price.toFixed(2)}`, 5, y + 4);
    }

    // Draw historical data
    if (historicalData.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      historicalData.forEach((point, index) => {
        const x = padding + index * xScale;
        const y = height - padding - (point.price - minPrice) * yScale;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw data points
      ctx.fillStyle = '#3b82f6';
      historicalData.forEach((point, index) => {
        const x = padding + index * xScale;
        const y = height - padding - (point.price - minPrice) * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw predictions
    if (predictions.length > 0) {
      const startIndex = historicalData.length - 1;
      
      // Confidence interval
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.beginPath();
      
      // Upper bound
      predictions.forEach((pred, index) => {
        const x = padding + (startIndex + index + 1) * xScale;
        const y = height - padding - (pred.upperBound - minPrice) * yScale;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // Lower bound (reverse order)
      for (let i = predictions.length - 1; i >= 0; i--) {
        const pred = predictions[i];
        const x = padding + (startIndex + i + 1) * xScale;
        const y = height - padding - (pred.lowerBound - minPrice) * yScale;
        ctx.lineTo(x, y);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Prediction line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      predictions.forEach((pred, index) => {
        const x = padding + (startIndex + index + 1) * xScale;
        const y = height - padding - (pred.predictedPrice - minPrice) * yScale;
        
        if (index === 0) {
          // Connect from last historical point
          const lastHistoricalX = padding + startIndex * xScale;
          const lastHistoricalY = height - padding - (historicalData[historicalData.length - 1].price - minPrice) * yScale;
          ctx.moveTo(lastHistoricalX, lastHistoricalY);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Prediction points
      ctx.fillStyle = '#10b981';
      predictions.forEach((pred, index) => {
        const x = padding + (startIndex + index + 1) * xScale;
        const y = height - padding - (pred.predictedPrice - minPrice) * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw legend
    const legendY = 20;
    ctx.font = '14px sans-serif';
    
    // Historical data legend
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(width - 200, legendY, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Historical Data', width - 175, legendY + 8);
    
    // Prediction legend
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width - 200, legendY + 25);
    ctx.lineTo(width - 180, legendY + 25);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#374151';
    ctx.fillText('Predictions', width - 175, legendY + 30);

  }, [historicalData, predictions, width, height]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <canvas
        ref={canvasRef}
        className="w-full h-auto border rounded"
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
}