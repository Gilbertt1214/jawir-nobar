import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Film } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function GenreList() {
  const { data: genres, isLoading, error } = useQuery({
    queryKey: ['genres'],
    queryFn: () => movieAPI.getAllGenres(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load genres.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Browse by Genre</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres?.map((genre) => (
          <Link key={genre} to={`/genre/${encodeURIComponent(genre)}`}>
            <Card className="cursor-pointer hover:shadow-card-hover transition-smooth group">
              <CardContent className="p-6 flex items-center justify-center gap-3 min-h-32">
                <Film className="h-6 w-6 text-primary group-hover:scale-110 transition-smooth" />
                <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-smooth">
                  {genre}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
