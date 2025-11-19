import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Globe, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieAPI.getMovieById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Movie not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[400px] -mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: movie.cover ? `url(${movie.cover})` : 'none' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="space-y-4">
            <img
              src={movie.cover || '/placeholder.svg'}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover rounded-lg shadow-card-hover"
            />
            {movie.trailer && (
              <Button className="w-full" size="lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Trailer
              </Button>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {movie.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <span className="text-xl font-semibold">{movie.rating.toFixed(1)}</span>
                  </div>
                )}
                
                {movie.year && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{movie.year}</span>
                  </div>
                )}
                
                {movie.country && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{movie.country}</span>
                  </div>
                )}
              </div>

              {movie.genre && movie.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genre.map((g) => (
                    <Link key={g} to={`/genre/${encodeURIComponent(g)}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-smooth">
                        {g}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {movie.synopsis && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{movie.synopsis}</p>
              </div>
            )}

            {movie.type === 'series' && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Episodes</h2>
                <Link to={`/series/${id}/episodes`}>
                  <Button variant="outline">View All Episodes</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
