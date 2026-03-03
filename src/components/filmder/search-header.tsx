
"use client"

import React, { useState } from 'react';
import { Search, Film, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchHeaderProps {
  onSearch: (title: string) => void;
  onOpenWatchlist: () => void;
  isLoading: boolean;
  watchlistCount: number;
}

export function SearchHeader({ onSearch, onOpenWatchlist, isLoading, watchlistCount }: SearchHeaderProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-2 rounded-xl">
          <Film className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-headline font-extrabold tracking-tighter text-white">
          FILM<span className="text-primary">DER</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="relative w-full max-w-md flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for a movie you like..."
            className="pl-10 h-12 bg-secondary border-none text-white rounded-xl focus-visible:ring-primary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 transition-all font-headline"
        >
          {isLoading ? "Matching..." : "Find"}
        </Button>
      </form>

      <Button
        variant="ghost"
        onClick={onOpenWatchlist}
        className="relative group p-2 hover:bg-primary/10 rounded-xl"
      >
        <Heart className="w-6 h-6 text-primary group-hover:fill-primary transition-all" />
        {watchlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
            {watchlistCount}
          </span>
        )}
      </Button>
    </header>
  );
}
