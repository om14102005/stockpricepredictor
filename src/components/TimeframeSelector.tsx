import React from 'react';

interface TimeframeSelectorProps {
  selected: number;
  onSelect: (days: number) => void;
}

const timeframes = [
  { label: '1 Day', days: 1 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
];

export function TimeframeSelector({ selected, onSelect }: TimeframeSelectorProps) {
  return (
    <div className="flex space-x-2">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.days}
          onClick={() => onSelect(timeframe.days)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selected === timeframe.days
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
}