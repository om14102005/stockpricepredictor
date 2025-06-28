import React, { useState } from 'react';
import { Star, Clock, Calendar, Globe, Play, Heart, BookmarkPlus } from 'lucide-react';
import { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  userRating?: number;
  onRate?: (rating: number) => void;
  onWatchlist?: () => void;
  onFavorite?: () => void;
  showRecommendationReason?: boolean;
  recommendationReason?: string;
  recommendationType?: 'collaborative' | 'content-based' | 'hybrid';
}

export function MovieCard({ 
  movie, 
  userRating, 
  onRate, 
  onWatchlist, 
  onFavorite,
  showRecommendationReason,
  recommendationReason,
  recommendationType
}: MovieCardProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handleStarClick = (rating: number) => {
    if (onRate) {
      onRate(rating);
    }
  };

  const getRecommendationBadge = () => {
    if (!recommendationType) return null;
    
    const badges = {
      'collaborative': { text: 'Users Like You', color: 'bg-blue-500' },
      'content-based': { text: 'Based on Your Taste', color: 'bg-emerald-500' },
      'hybrid': { text: 'Perfect Match', color: 'bg-purple-500' }
    };
    
    const badge = badges[recommendationType];
    
    return (
      <div className={`absolute top-2 left-2 ${badge.color} text-white text-xs px-2 py-1 rounded-full font-medium`}>
        {badge.text}
      </div>
    );
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      {getRecommendationBadge()}
      
      <div className="relative overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Overlay controls */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-colors duration-200">
            <Play className="w-6 h-6" />
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onFavorite && (
            <button
              onClick={onFavorite}
              className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-colors duration-200"
            >
              <Heart className="w-4 h-4" />
            </button>
          )}
          {onWatchlist && (
            <button
              onClick={onWatchlist}
              className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-blue-500 transition-colors duration-200"
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {movie.title}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{movie.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{movie.year}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{movie.duration}m</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="w-4 h-4" />
            <span>{movie.language}</span>
          </div>
        </div>

        {showRecommendationReason && recommendationReason && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
            <p className="text-xs text-blue-700">{recommendationReason}</p>
          </div>
        )}

        {/* Rating stars */}
        {onRate && (
          <div className="flex items-center space-x-1 mb-3">
            <span className="text-sm text-gray-600 mr-2">Rate:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-colors duration-150"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= (hoveredStar || userRating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {userRating && (
              <span className="text-sm text-gray-600 ml-2">({userRating}/5)</span>
            )}
          </div>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Director:</span>
                <span className="text-gray-600 ml-1">{movie.director}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cast:</span>
                <span className="text-gray-600 ml-1">{movie.cast.slice(0, 3).join(', ')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Plot:</span>
                <p className="text-gray-600 mt-1 text-xs leading-relaxed">{movie.plot}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}