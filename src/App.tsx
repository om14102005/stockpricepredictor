import React, { useState, useEffect } from 'react';
import { Film, Star, Users, TrendingUp, Settings } from 'lucide-react';
import { MovieCard } from './components/MovieCard';
import { FilterPanel } from './components/FilterPanel';
import { RecommendationTabs } from './components/RecommendationTabs';
import { SearchBar } from './components/SearchBar';
import { Movie, UserRating, RecommendationFilters, Recommendation } from './types/movie';
import { RecommendationEngine } from './utils/recommendationEngine';
import { movies } from './data/movies';

function App() {
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'popular' | 'content' | 'collaborative' | 'hybrid'>('popular');
  const [filters, setFilters] = useState<RecommendationFilters>({
    genres: [],
    yearRange: [1970, new Date().getFullYear()],
    minRating: 0,
    languages: [],
    maxDuration: undefined
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const engine = new RecommendationEngine();

  useEffect(() => {
    loadRecommendations();
  }, [activeTab, filters, userRatings]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let newRecommendations: Recommendation[] = [];
    
    switch (activeTab) {
      case 'popular':
        newRecommendations = engine.getHybridRecommendations('current', [], filters, 12)
          .map(rec => ({ ...rec, type: 'content-based' as const, reason: `Popular ${rec.movie.genres[0]} movie` }));
        break;
      case 'content':
        newRecommendations = engine.getContentBasedRecommendations(userRatings, filters, 12);
        break;
      case 'collaborative':
        newRecommendations = engine.getCollaborativeRecommendations('current', userRatings, filters, 12);
        break;
      case 'hybrid':
        newRecommendations = engine.getHybridRecommendations('current', userRatings, filters, 12);
        break;
    }
    
    setRecommendations(newRecommendations);
    setIsLoading(false);
  };

  const handleRateMovie = (movieId: number, rating: number) => {
    const existingRatingIndex = userRatings.findIndex(r => r.movieId === movieId);
    const newRating: UserRating = {
      userId: 'current',
      movieId,
      rating,
      timestamp: new Date()
    };

    let newRatings: UserRating[];
    if (existingRatingIndex >= 0) {
      newRatings = [...userRatings];
      newRatings[existingRatingIndex] = newRating;
    } else {
      newRatings = [...userRatings, newRating];
    }

    setUserRatings(newRatings);
    engine.addUserRating('current', movieId, rating);

    // Auto-switch to personalized recommendations after first rating
    if (userRatings.length === 0 && activeTab === 'popular') {
      setActiveTab('hybrid');
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const getUserRating = (movieId: number): number | undefined => {
    return userRatings.find(r => r.movieId === movieId)?.rating;
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'popular':
        return 'Discover trending and highly-rated movies';
      case 'content':
        return 'Movies tailored to your personal taste';
      case 'collaborative':
        return 'Recommendations from users with similar preferences';
      case 'hybrid':
        return 'Our best recommendations combining multiple algorithms';
      default:
        return '';
    }
  };

  const getActiveFiltersCount = () => {
    return filters.genres.length + 
           filters.languages.length + 
           (filters.minRating > 0 ? 1 : 0) +
           (filters.maxDuration ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 to-purple-600 p-2 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CineMatch</h1>
                <p className="text-sm text-gray-300">AI-Powered Movie Recommendations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">{userRatings.length} movies rated</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            <SearchBar onMovieSelect={handleMovieSelect} />
            
            <div className="flex items-center space-x-4">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
              />
              
              {getActiveFiltersCount() > 0 && (
                <div className="text-sm text-white bg-blue-500 px-3 py-2 rounded-lg">
                  {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation Tabs */}
        <div className="mb-8">
          <RecommendationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRatingsCount={userRatings.length}
          />
          
          <div className="mt-4 text-center">
            <p className="text-gray-300">{getTabDescription()}</p>
          </div>
        </div>

        {/* Selected Movie Detail */}
        {selectedMovie && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
            <div className="flex items-start space-x-6">
              <img
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                className="w-32 h-48 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-gray-300">{selectedMovie.year}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-300">{selectedMovie.duration}m</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-300">{selectedMovie.language}</span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{selectedMovie.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMovie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-white/20 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">{selectedMovie.plot}</p>
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="text-gray-400 text-sm">Director:</span>
                    <span className="text-white ml-2">{selectedMovie.director}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Cast:</span>
                    <span className="text-white ml-2">{selectedMovie.cast.slice(0, 3).join(', ')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMovie(null)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        )}

        {/* Recommendations Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <MovieCard
                key={rec.movie.id}
                movie={rec.movie}
                userRating={getUserRating(rec.movie.id)}
                onRate={(rating) => handleRateMovie(rec.movie.id, rating)}
                showRecommendationReason={activeTab !== 'popular'}
                recommendationReason={rec.reason}
                recommendationType={rec.type}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md mx-auto">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No recommendations found</h3>
              <p className="text-gray-300 mb-4">
                Try adjusting your filters or rate some movies to get personalized recommendations.
              </p>
              <button
                onClick={() => setFilters({
                  genres: [],
                  yearRange: [1970, new Date().getFullYear()],
                  minRating: 0,
                  languages: [],
                  maxDuration: undefined
                })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Getting Started Guide */}
        {userRatings.length === 0 && activeTab === 'popular' && (
          <div className="mt-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl border border-white/20 p-8">
            <div className="text-center">
              <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Get Personalized Recommendations</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Rate a few movies to unlock our AI-powered recommendation engine. The more you rate, 
                the better our suggestions become!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 rounded-xl p-6">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Rate Movies</h4>
                  <p className="text-gray-300 text-sm">Give ratings to movies you've watched</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6">
                  <Film className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Get Recommendations</h4>
                  <p className="text-gray-300 text-sm">Our AI analyzes your preferences</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6">
                  <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Discover Movies</h4>
                  <p className="text-gray-300 text-sm">Find your next favorite film</p>
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