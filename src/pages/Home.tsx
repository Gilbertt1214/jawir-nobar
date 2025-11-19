import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { MovieCarousel } from '@/components/MovieCarousel';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const { data: latestMovies, isLoading: loadingLatest, error: errorLatest } = useQuery({
    queryKey: ['latest-movies'],
    queryFn: () => movieAPI.getLatestMovies(1),
  });

  const { data: popularMovies, isLoading: loadingPopular, error: errorPopular } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: () => movieAPI.getPopularMovies(1),
  });

  const { data: latestSeries, isLoading: loadingSeries, error: errorSeries } = useQuery({
    queryKey: ['latest-series'],
    queryFn: () => movieAPI.getLatestSeries(1),
  });

  const isLoading = loadingLatest || loadingPopular || loadingSeries;
  const hasError = errorLatest || errorPopular || errorSeries;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load movies. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] -mx-4 mb-12 overflow-hidden rounded-b-lg">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: latestMovies?.data[0]?.cover 
              ? `url(${latestMovies.data[0].cover})`
              : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to MovieHub
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Discover the latest movies and series. Watch trailers, read reviews, and find your next favorite film.
          </p>
        </div>
      </section>

      {/* Latest Movies */}
      {latestMovies?.data && latestMovies.data.length > 0 && (
        <MovieCarousel title="Latest Movies" movies={latestMovies.data} />
      )}

      {/* Popular Movies */}
      {popularMovies?.data && popularMovies.data.length > 0 && (
        <MovieCarousel title="Popular Movies" movies={popularMovies.data} />
      )}

      {/* Latest Series */}
      {latestSeries?.data && latestSeries.data.length > 0 && (
        <MovieCarousel title="Latest Series" movies={latestSeries.data} />
      )}
    </div>
  );
}
