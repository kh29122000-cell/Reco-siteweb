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
  // Use path.resolve with process.cwd() to get the absolute path from the project root
  const filePath = path.resolve(process.cwd(), 'Final_FilmsCreuse.csv');
  
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      
      return records.map((r: any) => {
        // Try various common column name variations
        const title = r.title || r.Title || r.name || r.Name || '';
        const genre = r.genre || r.Genre || r.genres || r.Genres || '';
        const rawYear = r.year || r.Year || r.release_year || r.release_date || '0';
        const year = parseInt(String(rawYear).substring(0, 4)) || 0;
        const synopsis = r.synopsis || r.Synopsis || r.overview || r.Overview || r.description || r.Description || '';
        const imageUrl = r.imageUrl || r.ImageUrl || r.image || r.Image || r.poster_path || r.poster || '';

        return { title, genre, year, synopsis, imageUrl };
      });
    } catch (error) {
      console.error('Error parsing CSV file:', error);
      return [];
    }
  }

  console.warn(`CSV file not found at: ${filePath}. Falling back to mock data.`);
  
  // Fallback mock data if CSV is missing
  return [
    {
      title: 'The Shawshank Redemption',
      genre: 'Drama',
      year: 1994,
      synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      imageUrl: 'https://picsum.photos/seed/1/600/800'
    },
    {
      title: 'The Dark Knight',
      genre: 'Action, Crime, Drama',
      year: 2008,
      synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      imageUrl: 'https://picsum.photos/seed/5/600/800'
    },
    {
      title: 'Inception',
      genre: 'Action, Adventure, Sci-Fi',
      year: 2010,
      synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      imageUrl: 'https://picsum.photos/seed/7/600/800'
    },
    {
      title: 'The Godfather',
      genre: 'Crime, Drama',
      year: 1972,
      synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      imageUrl: 'https://picsum.photos/seed/9/600/800'
    },
    {
      title: 'Pulp Fiction',
      genre: 'Crime, Drama',
      year: 1994,
      synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      imageUrl: 'https://picsum.photos/seed/11/600/800'
    },
    {
      title: 'Interstellar',
      genre: 'Adventure, Drama, Sci-Fi',
      year: 2014,
      synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
      imageUrl: 'https://picsum.photos/seed/13/600/800'
    }
  ];
}

const getMovieMatchesTool = ai.defineTool(
  {
    name: 'getMovieMatches',
    description: 'Finds the target movie and similar recommendations from the CSV database.',
    inputSchema: z.object({
      movieTitle: z.string().describe('The title of the movie searched by the user.'),
    }),
    outputSchema: z.object({
      targetMovie: RecommendedMovieSchema.optional(),
      recommendations: z.array(RecommendedMovieSchema),
    }),
  },
  async (input) => {
    const { movieTitle } = input;
    const allMovies = loadMoviesFromCSV();

    // Find the searched movie first
    const targetMovie = allMovies.find(m => 
      m.title.toLowerCase().includes(movieTitle.toLowerCase())
    );
    
    let recommendations = [];
    if (targetMovie) {
      const targetGenres = targetMovie.genre.split(/[|,,]/).map((g: string) => g.trim().toLowerCase());
      recommendations = allMovies.filter(m => {
        if (m.title === targetMovie.title) return false;
        const genres = m.genre.split(/[|,,]/).map((g: string) => g.trim().toLowerCase());
        return genres.some(g => targetGenres.includes(g));
      });
    }

    // Fill up to 5 recommendations if needed
    if (recommendations.length < 5) {
      const others = allMovies.filter(m => 
        !recommendations.includes(m) && 
        (!targetMovie || m.title !== targetMovie.title)
      );
      recommendations = [...recommendations, ...others.sort(() => 0.5 - Math.random())];
    }

    return {
      targetMovie: targetMovie as z.infer<typeof RecommendedMovieSchema>,
      recommendations: recommendations.slice(0, 5) as z.infer<typeof RecommendedMovieSchema>[],
    };
  }
);

const recommendMoviePrompt = ai.definePrompt({
  name: 'recommendMoviePrompt',
  tools: [getMovieMatchesTool],
  input: { schema: MovieRecommendationInputSchema },
  output: { schema: MovieRecommendationOutputSchema },
  prompt: `You are a helpful movie recommendation assistant.

Use the 'getMovieMatches' tool with the query '{{{movieTitle}}}' to find the movie and its recommendations from the database.

Return the 'targetMovie' and 'recommendations' exactly as provided by the tool. If the tool returns no targetMovie, leave it null.`, 
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
