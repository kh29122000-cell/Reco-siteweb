
"use client"

import React, { useState, useEffect } from 'react';
import { X, Heart, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MovieCard } from './movie-card';

interface Movie {
  title: string;
  genre: string;
  year: number;
  synopsis: string;
}

interface SwipeContainerProps {
  movies: Movie[];
  onLike: (movie: Movie) => void;
  onReset: () => void;
}

export function SwipeContainer({ movies, onLike, onReset }: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= movies.length) return;
    
    setSwipeDirection(direction);
    
    // Process the swipe after animation
    setTimeout(() => {
      if (direction === 'right') {
        onLike(movies[currentIndex]);
      }
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 400);
  };

  if (currentIndex >= movies.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-6 text-center px-4">
        <div className="p-6 bg-secondary rounded-full">
          <RefreshCw className="w-12 h-12 text-primary animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-headline font-bold text-white">Out of recommendations!</h3>
          <p className="text-muted-foreground">Search for another movie to get fresh matches.</p>
        </div>
        <Button onClick={onReset} variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/10">
          Reset Stack
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      {/* Card Stack */}
      <div className="relative h-[600px] w-full">
        {movies.slice(currentIndex, currentIndex + 3).map((movie, idx) => (
          <MovieCard
            key={`${movie.title}-${currentIndex + idx}`}
            movie={movie}
            index={idx}
            total={movies.length - currentIndex}
            swipeDirection={idx === 0 ? swipeDirection : null}
          />
        ))}
      </div>

      {/* Control Buttons */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <Button
          onClick={() => handleSwipe('left')}
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95"
        >
          <X className="w-8 h-8" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-2 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-all shadow-lg"
        >
          <Info className="w-6 h-6" />
        </Button>

        <Button
          onClick={() => handleSwipe('right')}
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95"
        >
          <Heart className="w-8 h-8 fill-current" />
        </Button>
      </div>
    </div>
  );
}
