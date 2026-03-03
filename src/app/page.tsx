"use client"

import React, { useState } from 'react';
import { SearchHeader } from '@/components/filmder/search-header';
import { SwipeContainer } from '@/components/filmder/swipe-container';
import { WatchlistDrawer } from '@/components/filmder/watchlist-drawer';
import { recommendMovie, MovieRecommendationOutput } from '@/ai/flows/recommend-movie-flow';
import { useToast } from '@/hooks/use-toast';
import { Film, Play, Sparkles, Search } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

interface Movie {
  title: string;
  genre: string;
  year: number;
  synopsis: string;
  imageUrl?: string;
}

export default function FilmderPage() {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (title: string) => {
    setIsLoading(true);
    setHasStarted(true);
    try {
      const result: MovieRecommendationOutput = await recommendMovie({ movieTitle: title });
      setRecommendations(result.recommendations);
      toast({
        title: "Match Found!",
        description: `We found ${result.recommendations.length} movies similar to ${title}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch recommendations. Please check if Final_FilmsCreuse.csv is present.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (movie: Movie) => {
    setWatchlist(prev => {
      if (prev.find(m => m.title === movie.title)) return prev;
      return [movie, ...prev];
    });
  };

  const handleReset = () => {
    setRecommendations([]);
    setHasStarted(false);
  };

  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      <SearchHeader 
        onSearch={handleSearch} 
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        isLoading={isLoading}
        watchlistCount={watchlist.length}
      />

      <div className="container mx-auto px-6 py-12 flex flex-col items-center">
        {!hasStarted ? (
          <div className="max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative bg-secondary p-8 rounded-[2.5rem] border border-white/5">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-5xl font-headline font-black text-white leading-tight mb-4 uppercase tracking-tighter">
                  Find Your Next <br />
                  <span className="text-primary italic">Cinematic Obsession</span>
                </h2>
                <p className="text-xl text-muted-foreground font-body max-w-lg mx-auto leading-relaxed">
                  Enter a movie you love, and our AI will search your database for perfect matches. 
                  Swipe right to save, left to skip.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { icon: Search, title: "Search", desc: "Start with a film you already adore." },
                { icon: Play, title: "Discover", desc: "Swipe through matches from your database." },
                { icon: Film, title: "Watch", desc: "Build your ultimate movie watchlist." },
              ].map((step, i) => (
                <div key={i} className="p-6 bg-secondary/50 rounded-3xl border border-white/5">
                  <step.icon className="w-8 h-8 text-accent mb-4" />
                  <h4 className="font-headline font-bold text-white mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-2xl animate-pulse rounded-full"></div>
              <div className="relative bg-secondary p-8 rounded-full border-2 border-primary animate-spin-slow">
                <Film className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-headline font-bold text-white animate-pulse">Calculating matches...</h3>
              <p className="text-muted-foreground font-body">Analyzing your CSV database for pattern matches.</p>
            </div>
          </div>
        ) : (
          <div className="w-full animate-in fade-in zoom-in-95 duration-500">
            <SwipeContainer 
              movies={recommendations} 
              onLike={handleLike}
              onReset={handleReset}
            />
          </div>
        )}
      </div>

      <WatchlistDrawer 
        isOpen={isWatchlistOpen} 
        onClose={() => setIsWatchlistOpen(false)} 
        movies={watchlist} 
      />

      {/* Decorative gradients */}
      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-accent blur-[150px] rounded-full"></div>
      </div>
      <Toaster />
    </main>
  );
}