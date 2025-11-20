import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { MovieCarousel } from '@/components/MovieCarousel';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  const { data: anime, isLoading: loadingAnime, error: errorAnime } = useQuery({
    queryKey: ['anime'],
    queryFn: () => movieAPI.getAnime(1),
  });

  const { data: indo, isLoading: loadingIndo, error: errorIndo } = useQuery({
    queryKey: ['indo-movies'],
    queryFn: () => movieAPI.getIndonesianMovies(1),
  });

  const { data: kdrama, isLoading: loadingKDrama, error: errorKDrama } = useQuery({
    queryKey: ['korean-drama'],
    queryFn: () => movieAPI.getKoreanDrama(1),
  });

  const heroList = (latestMovies?.data && latestMovies.data.length ? latestMovies.data : popularMovies?.data) || [];
  const [heroIndex, setHeroIndex] = useState(0);
  const heroItem = heroList[heroIndex];
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    if (!heroList.length) return;
    const id = setInterval(() => setHeroIndex(i => (i + 1) % heroList.length), 6000);
    return () => clearInterval(id);
  }, [heroList.length]);

  const isLoading = loadingLatest || loadingPopular || loadingSeries || loadingAnime || loadingIndo || loadingKDrama;
  const hasError = errorLatest || errorPopular || errorSeries || errorAnime || errorIndo || errorKDrama;

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
              {heroItem?.cover ? (
                <img
                  src={heroItem.cover}
                  onLoad={() => setHeroLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
                  alt={heroItem.title}
                />
              ) : (
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

              <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-20">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 transition-transform duration-700 ease-out">
                  Welcome to Jawir nobar
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl transition-opacity duration-700">
                  Discover the latest movies and series. Watch trailers,
                  read reviews, and find your next favorite film.
                </p>

                {heroList.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-28 flex gap-2 overflow-x-auto">
                    {heroList.slice(0, 10).map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => { setHeroLoaded(false); setHeroIndex(i); }}
                        className={`relative w-16 h-10 rounded overflow-hidden ring-2 ${i === heroIndex ? 'ring-primary' : 'ring-transparent'} transition-transform hover:scale-105`}
                        aria-label={`Set background to ${m.title}`}
                      >
                        <img src={m.cover || '/placeholder.svg'} className="w-full h-full object-cover" alt={m.title} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => setHeroIndex(i => (i - 1 + heroList.length) % heroList.length)}
                    className="px-3 py-2 rounded bg-background/60 hover:bg-background/80 backdrop-blur transition"
                    aria-label="Previous background"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setHeroIndex(i => (i + 1) % heroList.length)}
                    className="px-3 py-2 rounded bg-background/60 hover:bg-background/80 backdrop-blur transition"
                    aria-label="Next background"
                  >
                    ›
                  </button>
                </div>
              </div>
          </section>

          {/* Latest Movies */}
          {latestMovies?.data && latestMovies.data.length > 0 && (
              <MovieCarousel title="Latest Movies" movies={latestMovies.data} />
          )}

          {/* Popular Movies */}
          {popularMovies?.data && popularMovies.data.length > 0 && (
              <MovieCarousel
                  title="Popular Movies"
                  movies={popularMovies.data}
              />
          )}

          {/* Latest Series */}
          {latestSeries?.data && latestSeries.data.length > 0 && (
              <MovieCarousel title="Latest Series" movies={latestSeries.data} />
          )}

          {/* Anime */}
          {anime?.data && anime.data.length > 0 && (
              <MovieCarousel title="Anime" movies={anime.data} />
          )}

          {/* Indonesian Movies */}
          {indo?.data && indo.data.length > 0 && (
              <MovieCarousel title="Indonesian Movies" movies={indo.data} />
          )}

          {/* Korean Drama */}
          {kdrama?.data && kdrama.data.length > 0 && (
              <MovieCarousel title="Korean Drama" movies={kdrama.data} />
          )}
      </div>
  );
}
