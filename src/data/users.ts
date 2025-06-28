import { User, UserRating } from '../types/movie';

// Sample user ratings for collaborative filtering
export const sampleRatings: UserRating[] = [
  // User 1 ratings
  { userId: 'user1', movieId: 1, rating: 5, timestamp: new Date('2024-01-15') },
  { userId: 'user1', movieId: 2, rating: 5, timestamp: new Date('2024-01-16') },
  { userId: 'user1', movieId: 3, rating: 4, timestamp: new Date('2024-01-17') },
  { userId: 'user1', movieId: 8, rating: 5, timestamp: new Date('2024-01-18') },
  { userId: 'user1', movieId: 9, rating: 3, timestamp: new Date('2024-01-19') },
  
  // User 2 ratings (similar to user1)
  { userId: 'user2', movieId: 1, rating: 5, timestamp: new Date('2024-01-20') },
  { userId: 'user2', movieId: 2, rating: 4, timestamp: new Date('2024-01-21') },
  { userId: 'user2', movieId: 4, rating: 5, timestamp: new Date('2024-01-22') },
  { userId: 'user2', movieId: 8, rating: 4, timestamp: new Date('2024-01-23') },
  { userId: 'user2', movieId: 10, rating: 4, timestamp: new Date('2024-01-24') },
  
  // User 3 ratings (different preferences)
  { userId: 'user3', movieId: 6, rating: 5, timestamp: new Date('2024-01-25') },
  { userId: 'user3', movieId: 7, rating: 5, timestamp: new Date('2024-01-26') },
  { userId: 'user3', movieId: 10, rating: 5, timestamp: new Date('2024-01-27') },
  { userId: 'user3', movieId: 13, rating: 4, timestamp: new Date('2024-01-28') },
  { userId: 'user3', movieId: 3, rating: 4, timestamp: new Date('2024-01-29') },
  
  // User 4 ratings (comedy/drama lover)
  { userId: 'user4', movieId: 5, rating: 5, timestamp: new Date('2024-01-30') },
  { userId: 'user4', movieId: 9, rating: 5, timestamp: new Date('2024-01-31') },
  { userId: 'user4', movieId: 12, rating: 4, timestamp: new Date('2024-02-01') },
  { userId: 'user4', movieId: 14, rating: 5, timestamp: new Date('2024-02-02') },
  { userId: 'user4', movieId: 15, rating: 4, timestamp: new Date('2024-02-03') },
  
  // User 5 ratings (action fan)
  { userId: 'user5', movieId: 3, rating: 5, timestamp: new Date('2024-02-04') },
  { userId: 'user5', movieId: 6, rating: 4, timestamp: new Date('2024-02-05') },
  { userId: 'user5', movieId: 7, rating: 5, timestamp: new Date('2024-02-06') },
  { userId: 'user5', movieId: 13, rating: 5, timestamp: new Date('2024-02-07') },
  { userId: 'user5', movieId: 10, rating: 3, timestamp: new Date('2024-02-08') },
];

export const users: User[] = [
  {
    id: 'current',
    name: 'You',
    preferences: {
      favoriteGenres: [],
      dislikedGenres: [],
      preferredDecades: [],
      preferredLanguages: ['English']
    },
    ratings: []
  }
];