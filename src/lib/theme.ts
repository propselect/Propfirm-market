import { Rating } from '../types';

export function getRatingColor(rating: Rating) {
  switch (rating) {
    case 'good':
      return 'border-emerald-500 text-emerald-500';
    case 'medium':
      return 'border-blue-500 text-blue-400';
    case 'bad':
      return 'border-rose-500 text-rose-500';
    case 'unrated':
    default:
      return 'border-zinc-700 text-zinc-500';
  }
}

export function getRatingLabel(rating: Rating) {
  switch (rating) {
    case 'good':
      return 'Highly Trusted • Community Verified';
    case 'medium':
      return 'Standard Evaluation • Verified Feed';
    case 'bad':
      return 'Restricted • High Risk Reported';
    case 'unrated':
    default:
      return 'Unrated • Ordinary Status';
  }
}

export function getDynamicRating(avgRating: number, votesCount: number): Rating {
  // Default to unrated if no data exists
  if (avgRating === 0 && votesCount === 0) return 'unrated';
  
  // Rating weight: 80% (scale 1-5)
  // Votes weight: 20% (max out at 100 votes for full points)
  const normalizedRating = (avgRating / 5) * 80;
  const normalizedVotes = Math.min(votesCount / 100, 1) * 20;
  
  const totalScore = normalizedRating + normalizedVotes;
  
  if (totalScore >= 70) return 'good';
  if (totalScore >= 35) return 'medium';
  return 'bad';
}
