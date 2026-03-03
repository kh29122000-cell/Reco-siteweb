
"use client"

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, Film, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Movie {
  title: string;
  genre: string;
  year: number;
  synopsis: string;
}

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

export function WatchlistDrawer({ isOpen, onClose, movies }: WatchlistDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="bg-background border-l border-white/10 w-full sm:max-w-md">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-2">
            <Bookmark className="text-primary w-5 h-5" />
            <SheetTitle className="text-2xl font-headline font-bold text-white uppercase tracking-tight">
              My Watchlist
            </SheetTitle>
          </div>
          <SheetDescription className="text-muted-foreground">
            Films you matched with on Filmder.
          </SheetDescription>
        </SheetHeader>
        
        <Separator className="bg-white/10" />

        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center">
            <div className="p-4 bg-secondary rounded-2xl">
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-body">Nothing here yet. Start swiping!</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-140px)] pr-4 mt-6">
            <div className="flex flex-col gap-6 pb-20">
              {movies.map((movie, idx) => (
                <div key={`${movie.title}-${idx}`} className="group space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-lg font-headline font-semibold text-white group-hover:text-primary transition-colors">
                      {movie.title}
                    </h4>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {movie.year}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium uppercase tracking-wider">{movie.genre}</p>
                  <p className="text-sm text-white/60 line-clamp-2 leading-relaxed italic">
                    &quot;{movie.synopsis}&quot;
                  </p>
                  {idx < movies.length - 1 && <Separator className="bg-white/5 mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
