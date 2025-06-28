export interface Movie {
  id: number;
  title: string;
  genres: string[];
  year: number;
  director: string;
  cast: string[];
  plot: string;
  poster: string;
  rating: number;
  duration: number;
  language: string;
  country: string;
  imdbRating: number;
  rottenTomatoesScore?: number;
}

export interface UserRating {
  userId: string;
  movieId: number;
  rating: number;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  preferences: {
    favoriteGenres: string[];
    dislikedGenres: string[];
    preferredDecades: number[];
    preferredLanguages: string[];
  };
  ratings: UserRating[];
}

export interface Recommendation {
  movie: Movie;
  score: number;
  reason: string;
  type: 'collaborative' | 'content-based' | 'hybrid';
}

export interface RecommendationFilters {
  genres: string[];
  yearRange: [number, number];
  minRating: number;
  languages: string[];
  maxDuration?: number;
}