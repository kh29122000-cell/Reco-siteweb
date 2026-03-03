'use server';
/**
 * @fileOverview An AI agent for generating movie recommendations.
 *
 * - recommendMovie - A function that handles the movie recommendation process.
 * - MovieRecommendationInput - The input type for the recommendMovie function.
 * - MovieRecommendationOutput - The return type for the recommendMovie function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Placeholder for a real movie database or KNN integration
// In a real application, this would fetch data from a database or a recommendation engine.
const mockMovieDatabase = [
  {
    id: '1',
    title: 'The Shawshank Redemption',
    genre: 'Drama',
    year: 1994,
    synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  },
  {
    id: '2',
    title: 'The Green Mile',
    genre: 'Drama, Fantasy',
    year: 1999,
    synopsis: 'The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet possessing a mysterious gift.',
  },
  {
    id: '3',
    title: 'Forrest Gump',
    genre: 'Drama, Romance',
    year: 1994,
    synopsis: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
  },
  {
    id: '4',
    title: 'Pulp Fiction',
    genre: 'Crime, Drama',
    year: 1994,
    synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
  },
  {
    id: '5',
    title: 'The Dark Knight',
    genre: 'Action, Crime, Drama',
    year: 2008,
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  },
  {
    id: '6',
    title: 'Fight Club',
    genre: 'Drama',
    year: 1999,
    synopsis: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more.',
  },
  {
    id: '7',
    title: 'Inception',
    genre: 'Action, Adventure, Sci-Fi',
    year: 2010,
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
  },
  {
    id: '8',
    title: 'The Matrix',
    genre: 'Action, Sci-Fi',
    year: 1999,
    synopsis: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
  },
  {
    id: '9',
    title: 'Interstellar',
    genre: 'Adventure, Drama, Sci-Fi',
    year: 2014,
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
  },
  {
    id: '10',
    title: 'Gladiator',
    genre: 'Action, Adventure, Drama',
    year: 2000,
    synopsis: 'A Roman general is betrayed and his family murdered by an emperor\'s corrupt son. He comes to Rome as a gladiator to seek revenge.',
  },
  {
    id: '11',
    title: 'The Lion King',
    genre: 'Animation, Adventure, Drama',
    year: 1994,
    synopsis: 'Lion prince Simba and his father are targeted by his unscrupulous uncle, Scar, who wants to seize the throne. Simba flees into exile but returns years later to reclaim his destiny.',
  },
  {
    id: '12',
    title: 'Toy Story',
    genre: 'Animation, Adventure, Comedy',
    year: 1995,
    synopsis: 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy\'s room.',
  },
  {
    id: '13',
    title: 'Spirited Away',
    genre: 'Animation, Adventure, Family',
    year: 2001,
    synopsis: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
  },
  {
    id: '14',
    title: 'Your Name.',
    genre: 'Animation, Drama, Fantasy',
    year: 2016,
    synopsis: 'Two strangers find themselves linked in a bizarre way. When a comet approaches Earth, it brings about a miracle.',
  },
  {
    id: '15',
    title: 'Spider-Man: Into the Spider-Verse',
    genre: 'Animation, Action, Adventure',
    year: 2018,
    synopsis: 'Teen Miles Morales becomes Spider-Man of his reality and crosses paths with five counterparts from other dimensions to stop a threat to all realities.',
  },
];

const MovieRecommendationInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie to find similar films for.'),
});
export type MovieRecommendationInput = z.infer<typeof MovieRecommendationInputSchema>;

const RecommendedMovieSchema = z.object({
  title: z.string().describe('The title of the recommended movie.'),
  genre: z.string().describe('The genre(s) of the recommended movie.'),
  year: z.number().describe('The release year of the recommended movie.'),
  synopsis: z.string().describe('A brief synopsis of the recommended movie.'),
});

const MovieRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedMovieSchema).length(5).describe('An array of 5 similar movies.'),
});
export type MovieRecommendationOutput = z.infer<typeof MovieRecommendationOutputSchema>;

/**
 * A mock tool that simulates finding similar movies using a KNN algorithm.
 * In a real application, this would integrate with actual machine learning code
 * or a recommendation engine service.
 */
const getSimilarMoviesTool = ai.defineTool(
  {
    name: 'getSimilarMovies',
    description: 'Finds 5 movies similar to the given movie title using a KNN machine learning algorithm.',
    inputSchema: z.object({
      movieTitle: z.string().describe('The title of the movie to find similar films for.'),
    }),
    outputSchema: z.array(RecommendedMovieSchema).describe('A list of 5 similar movies, including their title, genre, year, and synopsis.'),
  },
  async (input) => {
    const { movieTitle } = input;

    // In a real scenario, this would call the KNN ML code.
    // For this mock, we'll return a fixed set of recommendations
    // or filter from the mock database based on a simple heuristic.
    const targetMovie = mockMovieDatabase.find(m => m.title.toLowerCase() === movieTitle.toLowerCase());

    if (targetMovie) {
      // Simple mock: return 5 other movies from the list, prioritizing different genres or years for variety.
      const filteredMovies = mockMovieDatabase.filter(m => m.id !== targetMovie.id);
      const shuffled = filteredMovies.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      return selected as z.infer<typeof RecommendedMovieSchema>[];
    } else {
      // If the movie isn't in our mock DB, return some default recommendations.
      const shuffled = mockMovieDatabase.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5) as z.infer<typeof RecommendedMovieSchema>[];
    }
  }
);

const recommendMoviePrompt = ai.definePrompt({
  name: 'recommendMoviePrompt',
  tools: [getSimilarMoviesTool],
  input: { schema: MovieRecommendationInputSchema },
  output: { schema: MovieRecommendationOutputSchema },
  prompt: `You are a helpful movie recommendation assistant.

Use the 'getSimilarMovies' tool to find 5 movies that are similar to the movie titled '{{{movieTitle}}}'.

Based on the results from the tool, present the 5 recommended movies, including their title, genre, year, and a brief synopsis.`, 
});

const recommendMovieFlow = ai.defineFlow(
  {
    name: 'recommendMovieFlow',
    inputSchema: MovieRecommendationInputSchema,
    outputSchema: MovieRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await recommendMoviePrompt(input);
    return output!;
  }
);

export async function recommendMovie(input: MovieRecommendationInput): Promise<MovieRecommendationOutput> {
  return recommendMovieFlow(input);
}
