import { Movie, User, UserRating, Recommendation, RecommendationFilters } from '../types/movie';
import { movies } from '../data/movies';
import { sampleRatings } from '../data/users';

export class RecommendationEngine {
  private movies: Movie[];
  private allRatings: UserRating[];

  constructor() {
    this.movies = movies;
    this.allRatings = sampleRatings;
  }

  // Content-based filtering
  getContentBasedRecommendations(
    userRatings: UserRating[],
    filters?: RecommendationFilters,
    limit: number = 10
  ): Recommendation[] {
    if (userRatings.length === 0) {
      return this.getPopularMovies(filters, limit);
    }

    // Calculate user's genre preferences
    const genreScores = this.calculateGenrePreferences(userRatings);
    
    // Get movies user hasn't rated
    const ratedMovieIds = new Set(userRatings.map(r => r.movieId));
    const unratedMovies = this.movies.filter(movie => !ratedMovieIds.has(movie.id));
    
    // Apply filters
    const filteredMovies = this.applyFilters(unratedMovies, filters);
    
    // Score movies based on content similarity
    const recommendations = filteredMovies.map(movie => {
      const score = this.calculateContentScore(movie, genreScores, userRatings);
      return {
        movie,
        score,
        reason: this.generateContentReason(movie, genreScores),
        type: 'content-based' as const
      };
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Collaborative filtering
  getCollaborativeRecommendations(
    userId: string,
    userRatings: UserRating[],
    filters?: RecommendationFilters,
    limit: number = 10
  ): Recommendation[] {
    if (userRatings.length === 0) {
      return this.getPopularMovies(filters, limit);
    }

    // Find similar users
    const similarUsers = this.findSimilarUsers(userId, userRatings);
    
    if (similarUsers.length === 0) {
      return this.getContentBasedRecommendations(userRatings, filters, limit);
    }

    // Get recommendations from similar users
    const ratedMovieIds = new Set(userRatings.map(r => r.movieId));
    const movieScores = new Map<number, { score: number; count: number }>();

    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const similarUserRatings = this.allRatings.filter(r => r.userId === similarUserId);
      
      similarUserRatings.forEach(rating => {
        if (!ratedMovieIds.has(rating.movieId)) {
          const current = movieScores.get(rating.movieId) || { score: 0, count: 0 };
          movieScores.set(rating.movieId, {
            score: current.score + (rating.rating * similarity),
            count: current.count + 1
          });
        }
      });
    });

    // Convert to recommendations
    const recommendations: Recommendation[] = [];
    movieScores.forEach(({ score, count }, movieId) => {
      const movie = this.movies.find(m => m.id === movieId);
      if (movie) {
        const avgScore = score / count;
        recommendations.push({
          movie,
          score: avgScore,
          reason: `Recommended by users with similar taste (${count} similar users)`,
          type: 'collaborative'
        });
      }
    });

    // Apply filters
    const filteredRecs = recommendations.filter(rec => 
      this.movieMatchesFilters(rec.movie, filters)
    );

    return filteredRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Hybrid approach
  getHybridRecommendations(
    userId: string,
    userRatings: UserRating[],
    filters?: RecommendationFilters,
    limit: number = 10
  ): Recommendation[] {
    const contentRecs = this.getContentBasedRecommendations(userRatings, filters, limit * 2);
    const collaborativeRecs = this.getCollaborativeRecommendations(userId, userRatings, filters, limit * 2);

    // Combine and weight recommendations
    const combinedScores = new Map<number, { 
      movie: Movie; 
      contentScore: number; 
      collaborativeScore: number; 
      reasons: string[] 
    }>();

    contentRecs.forEach(rec => {
      combinedScores.set(rec.movie.id, {
        movie: rec.movie,
        contentScore: rec.score,
        collaborativeScore: 0,
        reasons: [rec.reason]
      });
    });

    collaborativeRecs.forEach(rec => {
      const existing = combinedScores.get(rec.movie.id);
      if (existing) {
        existing.collaborativeScore = rec.score;
        existing.reasons.push(rec.reason);
      } else {
        combinedScores.set(rec.movie.id, {
          movie: rec.movie,
          contentScore: 0,
          collaborativeScore: rec.score,
          reasons: [rec.reason]
        });
      }
    });

    // Calculate hybrid scores (60% content, 40% collaborative)
    const hybridRecs = Array.from(combinedScores.values()).map(item => {
      const hybridScore = (item.contentScore * 0.6) + (item.collaborativeScore * 0.4);
      return {
        movie: item.movie,
        score: hybridScore,
        reason: item.reasons.join(' • '),
        type: 'hybrid' as const
      };
    });

    return hybridRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateGenrePreferences(userRatings: UserRating[]): Map<string, number> {
    const genreScores = new Map<string, number>();
    const genreCounts = new Map<string, number>();

    userRatings.forEach(rating => {
      const movie = this.movies.find(m => m.id === rating.movieId);
      if (movie) {
        movie.genres.forEach(genre => {
          const currentScore = genreScores.get(genre) || 0;
          const currentCount = genreCounts.get(genre) || 0;
          
          genreScores.set(genre, currentScore + rating.rating);
          genreCounts.set(genre, currentCount + 1);
        });
      }
    });

    // Calculate average scores
    const avgGenreScores = new Map<string, number>();
    genreScores.forEach((totalScore, genre) => {
      const count = genreCounts.get(genre) || 1;
      avgGenreScores.set(genre, totalScore / count);
    });

    return avgGenreScores;
  }

  private calculateContentScore(
    movie: Movie, 
    genrePreferences: Map<string, number>,
    userRatings: UserRating[]
  ): number {
    let score = 0;
    let genreMatches = 0;

    // Genre similarity
    movie.genres.forEach(genre => {
      const preference = genrePreferences.get(genre);
      if (preference) {
        score += preference;
        genreMatches++;
      }
    });

    if (genreMatches > 0) {
      score = score / genreMatches;
    }

    // Boost for highly rated movies
    score += (movie.rating / 10) * 2;

    // Boost for recent movies (slight preference)
    const currentYear = new Date().getFullYear();
    const ageBonus = Math.max(0, (currentYear - movie.year + 10) / 50);
    score += ageBonus;

    return Math.min(5, Math.max(0, score));
  }

  private findSimilarUsers(userId: string, userRatings: UserRating[]): Array<{ userId: string; similarity: number }> {
    const userMovieRatings = new Map(userRatings.map(r => [r.movieId, r.rating]));
    const similarities: Array<{ userId: string; similarity: number }> = [];

    // Group ratings by user
    const userRatingsMap = new Map<string, Map<number, number>>();
    this.allRatings.forEach(rating => {
      if (rating.userId !== userId) {
        if (!userRatingsMap.has(rating.userId)) {
          userRatingsMap.set(rating.userId, new Map());
        }
        userRatingsMap.get(rating.userId)!.set(rating.movieId, rating.rating);
      }
    });

    // Calculate similarity with each user
    userRatingsMap.forEach((otherUserRatings, otherUserId) => {
      const similarity = this.calculateCosineSimilarity(userMovieRatings, otherUserRatings);
      if (similarity > 0.1) { // Only consider users with some similarity
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Top 5 similar users
  }

  private calculateCosineSimilarity(
    ratings1: Map<number, number>,
    ratings2: Map<number, number>
  ): number {
    const commonMovies = Array.from(ratings1.keys()).filter(movieId => ratings2.has(movieId));
    
    if (commonMovies.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    commonMovies.forEach(movieId => {
      const rating1 = ratings1.get(movieId)!;
      const rating2 = ratings2.get(movieId)!;
      
      dotProduct += rating1 * rating2;
      norm1 += rating1 * rating1;
      norm2 += rating2 * rating2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private generateContentReason(movie: Movie, genrePreferences: Map<string, number>): string {
    const topGenres = Array.from(genrePreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([genre]) => genre);

    const matchingGenres = movie.genres.filter(genre => topGenres.includes(genre));
    
    if (matchingGenres.length > 0) {
      return `You enjoy ${matchingGenres.join(' and ')} movies`;
    }
    
    return `Highly rated ${movie.genres[0]} movie`;
  }

  private getPopularMovies(filters?: RecommendationFilters, limit: number = 10): Recommendation[] {
    const filteredMovies = this.applyFilters(this.movies, filters);
    
    return filteredMovies
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map(movie => ({
        movie,
        score: movie.rating / 2,
        reason: `Popular ${movie.genres[0]} movie with ${movie.rating}/10 rating`,
        type: 'content-based' as const
      }));
  }

  private applyFilters(movies: Movie[], filters?: RecommendationFilters): Movie[] {
    if (!filters) return movies;

    return movies.filter(movie => this.movieMatchesFilters(movie, filters));
  }

  private movieMatchesFilters(movie: Movie, filters?: RecommendationFilters): boolean {
    if (!filters) return true;

    // Genre filter
    if (filters.genres.length > 0) {
      const hasMatchingGenre = movie.genres.some(genre => filters.genres.includes(genre));
      if (!hasMatchingGenre) return false;
    }

    // Year range filter
    if (movie.year < filters.yearRange[0] || movie.year > filters.yearRange[1]) {
      return false;
    }

    // Minimum rating filter
    if (movie.rating < filters.minRating) {
      return false;
    }

    // Language filter
    if (filters.languages.length > 0 && !filters.languages.includes(movie.language)) {
      return false;
    }

    // Duration filter
    if (filters.maxDuration && movie.duration > filters.maxDuration) {
      return false;
    }

    return true;
  }

  addUserRating(userId: string, movieId: number, rating: number): void {
    const existingRatingIndex = this.allRatings.findIndex(
      r => r.userId === userId && r.movieId === movieId
    );

    const newRating: UserRating = {
      userId,
      movieId,
      rating,
      timestamp: new Date()
    };

    if (existingRatingIndex >= 0) {
      this.allRatings[existingRatingIndex] = newRating;
    } else {
      this.allRatings.push(newRating);
    }
  }

  getUserRatings(userId: string): UserRating[] {
    return this.allRatings.filter(r => r.userId === userId);
  }
}