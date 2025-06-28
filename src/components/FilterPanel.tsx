import React from 'react';
import { Filter, X } from 'lucide-react';
import { RecommendationFilters } from '../types/movie';
import { genres, languages } from '../data/movies';

interface FilterPanelProps {
  filters: RecommendationFilters;
  onFiltersChange: (filters: RecommendationFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterPanel({ filters, onFiltersChange, isOpen, onToggle }: FilterPanelProps) {
  const updateFilters = (updates: Partial<RecommendationFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    updateFilters({ genres: newGenres });
  };

  const toggleLanguage = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter(l => l !== language)
      : [...filters.languages, language];
    updateFilters({ languages: newLanguages });
  };

  const clearFilters = () => {
    onFiltersChange({
      genres: [],
      yearRange: [1970, new Date().getFullYear()],
      minRating: 0,
      languages: [],
      maxDuration: undefined
    });
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {(filters.genres.length > 0 || filters.languages.length > 0 || filters.minRating > 0) && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
            {filters.genres.length + filters.languages.length + (filters.minRating > 0 ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onToggle} />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  Clear All
                </button>
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto h-full pb-20">
              {/* Genres */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Genres</h3>
                <div className="grid grid-cols-2 gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`text-left px-3 py-2 rounded-lg border transition-all duration-200 ${
                        filters.genres.includes(genre)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Year</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <input
                      type="range"
                      min="1970"
                      max={new Date().getFullYear()}
                      value={filters.yearRange[0]}
                      onChange={(e) => updateFilters({ 
                        yearRange: [parseInt(e.target.value), filters.yearRange[1]] 
                      })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">{filters.yearRange[0]}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <input
                      type="range"
                      min="1970"
                      max={new Date().getFullYear()}
                      value={filters.yearRange[1]}
                      onChange={(e) => updateFilters({ 
                        yearRange: [filters.yearRange[0], parseInt(e.target.value)] 
                      })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">{filters.yearRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Minimum Rating</h3>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => updateFilters({ minRating: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>0</span>
                  <span className="font-medium">{filters.minRating}</span>
                  <span>10</span>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((language) => (
                    <button
                      key={language}
                      onClick={() => toggleLanguage(language)}
                      className={`text-left px-3 py-2 rounded-lg border transition-all duration-200 ${
                        filters.languages.includes(language)
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Duration */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maximum Duration</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="60"
                    max="240"
                    step="15"
                    value={filters.maxDuration || 240}
                    onChange={(e) => updateFilters({ maxDuration: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>1h</span>
                    <span className="font-medium">
                      {filters.maxDuration ? `${Math.floor(filters.maxDuration / 60)}h ${filters.maxDuration % 60}m` : 'No limit'}
                    </span>
                    <span>4h</span>
                  </div>
                  <button
                    onClick={() => updateFilters({ maxDuration: undefined })}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Remove duration limit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}