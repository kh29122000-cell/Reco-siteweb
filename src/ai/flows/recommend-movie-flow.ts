'use server';
/**
 * @fileOverview An AI agent for generating movie recommendations using CSV data.
 *
 * - recommendMovie - A function that handles the movie recommendation process.
 * - MovieRecommendationInput - The input type for the recommendMovie function.
 * - MovieRecommendationOutput - The return type for the recommendMovie function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const MovieRecommendationInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie to find similar films for.'),
});
export type MovieRecommendationInput = z.infer<typeof MovieRecommendationInputSchema>;

const RecommendedMovieSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  genre: z.string().describe('The genre(s) of the movie.'),
  year: z.number().describe('The release year of the movie.'),
  synopsis: z.string().describe('A brief synopsis of the movie.'),
  imageUrl: z.string().optional().describe('A URL to the movie poster or an image related to the film.'),
});

const MovieRecommendationOutputSchema = z.object({
  targetMovie: RecommendedMovieSchema.optional().describe('The movie matching the search query, if found.'),
  recommendations: z.array(RecommendedMovieSchema).length(5).describe('An array of 5 similar movies.'),
});
export type MovieRecommendationOutput = z.infer<typeof MovieRecommendationOutputSchema>;

/**
 * Loads movie data from the Final_FilmsCreuse.csv file.
 */
function loadMoviesFromCSV() {
  const filePath = path.join(process.cwd(), 'Final_FilmsCreuse.csv');
  
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });
      
      return records.map((r: any) => ({
        title: r.title || r.Title || '',
        genre: r.genre || r.Genre || '',
        year: parseInt(r.year || r.Year || '0'),
        synopsis: r.synopsis || r.Synopsis || r.description || r.Description || '',
        imageUrl: r.imageUrl || r.ImageUrl || r.image || r.Image || '',
      }));
    } catch (error) {
      console.error('Error parsing CSV:', error);
    }
  }

  // Fallback mock data if CSV is missing
  return [
    {
      title: 'The Shawshank Redemption',
      genre: 'Drama',
      year: 1994,
      synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      imageUrl: 'https://picsum.photos/seed/1/600/400'
    },
    {
      title: 'The Dark Knight',
      genre: 'Action, Crime, Drama',
      year: 2008,
      synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      imageUrl: 'https://picsum.photos/seed/5/600/400'
    },
    {
      title: 'Inception',
      genre: 'Action, Adventure, Sci-Fi',
      year: 2010,
      synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      imageUrl: 'https://picsum.photos/seed/7/600/400'
    },
    {
      title: 'The Godfather',
      genre: 'Crime, Drama',
      year: 1972,
      synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      imageUrl: 'https://picsum.photos/seed/9/600/400'
    },
    {
      title: 'Pulp Fiction',
      genre: 'Crime, Drama',
      year: 1994,
      synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      imageUrl: 'https://picsum.photos/seed/11/600/400'
    },
    {
      title: 'Interstellar',
      genre: 'Adventure, Drama, Sci-Fi',
      year: 2014,
      synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
      imageUrl: 'https://picsum.photos/seed/13/600/400'
    }
  ];
}

const getSimilarMoviesTool = ai.defineTool(
  {
    name: 'getSimilarMovies',
    description: 'Finds movies similar to the given title from the provided movie database.',
    inputSchema: z.object({
      movieTitle: z.string().describe('The title of the movie to find similar films for.'),
    }),
    outputSchema: z.array(RecommendedMovieSchema),
  },
  async (input) => {
    const { movieTitle } = input;
    const allMovies = loadMoviesFromCSV();

    const targetMovie = allMovies.find(m => m.title.toLowerCase().includes(movieTitle.toLowerCase()));
    
    let candidates = [];
    if (targetMovie) {
      const targetGenres = targetMovie.genre.split(',').map((g: string) => g.trim().toLowerCase());
      candidates = allMovies.filter(m => {
        if (m.title === targetMovie.title) return false;
        const genres = m.genre.split(',').map((g: string) => g.trim().toLowerCase());
        return genres.some(g => targetGenres.includes(g));
      });
    }

    if (candidates.length < 5) {
      const others = allMovies.filter(m => !candidates.includes(m) && m.title !== targetMovie?.title);
      candidates = [...candidates, ...others.sort(() => 0.5 - Math.random())];
    }

    return candidates.slice(0, 5) as z.infer<typeof RecommendedMovieSchema>[];
  }
);

const recommendMoviePrompt = ai.definePrompt({
  name: 'recommendMoviePrompt',
  tools: [getSimilarMoviesTool],
  input: { schema: MovieRecommendationInputSchema },
  output: { schema: MovieRecommendationOutputSchema },
  prompt: `You are a helpful movie recommendation assistant.

First, identify if the exact movie '{{{movieTitle}}}' exists in our database.
Then, use the 'getSimilarMovies' tool to find 5 movies similar to it.

Return the details of the original movie in 'targetMovie' (if found) and the 5 similar films in 'recommendations'.`, 
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
