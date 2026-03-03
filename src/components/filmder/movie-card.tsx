
"use client"

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Movie {
  title: string;
  genre: string;
  year: number;
  synopsis: string;
}

interface MovieCardProps {
  movie: Movie;
  index: number;
  total: number;
  swipeDirection: 'left' | 'right' | null;
}

export function MovieCard({ movie, index, total, swipeDirection }: MovieCardProps) {
  // Use a predictable placeholder based on index
  const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];

  return (
    <Card 
      className={`absolute inset-0 w-full h-[600px] overflow-hidden rounded-3xl border-none shadow-2xl swipe-card ${
        swipeDirection === 'left' ? 'swipe-card-left' : swipeDirection === 'right' ? 'swipe-card-right' : ''
      }`}
      style={{
        zIndex: total - index,
        transform: `scale(${1 - index * 0.05}) translateY(${index * 12}px)`,
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={placeholder.imageUrl}
          alt={movie.title}
          fill
          className="object-cover brightness-75 transition-transform hover:scale-105 duration-700"
          data-ai-hint={placeholder.imageHint}
        />
        
        {/* Swiping Indicators */}
        {swipeDirection === 'right' && (
          <div className="absolute top-10 left-10 border-4 border-green-500 rounded-lg px-4 py-2 rotate-[-12deg] z-20">
            <span className="text-green-500 font-headline text-4xl font-black uppercase">LIKE</span>
          </div>
        )}
        {swipeDirection === 'left' && (
          <div className="absolute top-10 right-10 border-4 border-red-500 rounded-lg px-4 py-2 rotate-[12deg] z-20">
            <span className="text-red-500 font-headline text-4xl font-black uppercase">NOPE</span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-8 pt-20">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {movie.year}
              </Badge>
              <div className="text-xs text-white/60 font-medium uppercase tracking-widest">
                {movie.genre}
              </div>
            </div>
            <h2 className="text-3xl font-headline font-bold text-white leading-tight">
              {movie.title}
            </h2>
            <p className="text-sm text-white/80 line-clamp-3 mt-2 leading-relaxed font-body">
              {movie.synopsis}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
