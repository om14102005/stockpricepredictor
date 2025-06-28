import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { StockSymbol } from '../types/stock';
import { mockStockSymbols } from '../utils/stockData';

interface StockSearchProps {
  onSelectStock: (symbol: StockSymbol) => void;
  selectedStock: StockSymbol | null;
}

export function StockSearch({ onSelectStock, selectedStock }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<StockSymbol[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockStockSymbols.filter(stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStocks(filtered);
      setIsOpen(true);
    } else {
      setFilteredStocks([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    if (selectedStock) {
      setQuery(selectedStock.symbol);
      setIsOpen(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (stock: StockSymbol) => {
    onSelectStock(stock);
    setQuery(stock.symbol);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search stocks (e.g., AAPL, GOOGL)"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {isOpen && filteredStocks.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelectStock(stock)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900">{stock.symbol}</div>
                  <div className="text-sm text-gray-600 truncate">{stock.name}</div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {stock.sector}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}