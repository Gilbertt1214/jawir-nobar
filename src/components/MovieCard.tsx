import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/${movie.type}/${movie.id}`}>
      <Card className="overflow-hidden group cursor-pointer shadow-card hover:shadow-card-hover transition-smooth border-0">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={movie.cover || '/placeholder.svg'}
            alt={movie.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-smooth"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
          
          {movie.type === 'series' && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              Series
            </Badge>
          )}

          {movie.rating && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-semibold text-white">{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-smooth">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {movie.year && <span>{movie.year}</span>}
            {movie.country && (
              <>
                <span>•</span>
                <span className="line-clamp-1">{movie.country}</span>
              </>
            )}
          </div>
          {movie.genre && movie.genre.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {movie.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
