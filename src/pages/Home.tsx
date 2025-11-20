import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { MovieCarousel } from '@/components/MovieCarousel';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Home() {
  const [pageLatest, setPageLatest] = useState(1);
  const { data: latestMovies, isLoading: loadingLatest, error: errorLatest } = useQuery({
    queryKey: ['latest-movies', pageLatest],
    queryFn: () => movieAPI.getLatestMovies(pageLatest),
  });

  const [pagePopular, setPagePopular] = useState(1);
  const { data: popularMovies, isLoading: loadingPopular, error: errorPopular } = useQuery({
    queryKey: ['popular-movies', pagePopular],
    queryFn: () => movieAPI.getPopularMovies(pagePopular),
  });

  const [pageSeries, setPageSeries] = useState(1);
  const { data: latestSeries, isLoading: loadingSeries, error: errorSeries } = useQuery({
    queryKey: ['latest-series', pageSeries],
    queryFn: () => movieAPI.getLatestSeries(pageSeries),
  });

  const [pageAnime, setPageAnime] = useState(1);
  const [animeType, setAnimeType] = useState<'all'|'tv'|'movie'>('all');
  const [animeAudio, setAnimeAudio] = useState<'all'|'sub'|'dub'>('all');
  const { data: anime, isLoading: loadingAnime, error: errorAnime } = useQuery({
    queryKey: ['anime', pageAnime, animeType, animeAudio],
    queryFn: () => movieAPI.getAnime(pageAnime, { type: animeType, audio: animeAudio }),
  });

  const [pageIndo, setPageIndo] = useState(1);
  const { data: indo, isLoading: loadingIndo, error: errorIndo } = useQuery({
    queryKey: ['indo-movies', pageIndo],
    queryFn: () => movieAPI.getIndonesianMovies(pageIndo),
  });

  const [pageKdrama, setPageKdrama] = useState(1);
  const { data: kdrama, isLoading: loadingKDrama, error: errorKDrama } = useQuery({
    queryKey: ['korean-drama', pageKdrama],
    queryFn: () => movieAPI.getKoreanDrama(pageKdrama),
  });

  const { data: adult, isLoading: loadingAdult, error: errorAdult } = useQuery({
    queryKey: ['adult-movies', 1],
    queryFn: () => movieAPI.getAdultMovies(1),
  });

  const [listLatest, setListLatest] = useState<any[]>([]);
  const [listPopular, setListPopular] = useState<any[]>([]);
  const [listSeries, setListSeries] = useState<any[]>([]);
  const [listAnime, setListAnime] = useState<any[]>([]);
  const [listIndo, setListIndo] = useState<any[]>([]);
  const [listKdrama, setListKdrama] = useState<any[]>([]);
  const heroList = (listLatest.length ? listLatest : (listPopular.length ? listPopular : []));
  const [heroIndex, setHeroIndex] = useState(0);
  const heroItem = heroList[heroIndex];
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    if (!heroList.length) return;
    const id = setInterval(() => setHeroIndex(i => (i + 1) % heroList.length), 6000);
    return () => clearInterval(id);
  }, [heroList.length]);

  useEffect(() => { if (latestMovies?.data) setListLatest(prev => { const map = new Map(prev.map((m:any)=>[m.id,m])); for (const x of latestMovies.data) map.set(x.id,x); return Array.from(map.values()); }); }, [latestMovies]);
  useEffect(() => { if (popularMovies?.data) setListPopular(prev => { const map = new Map(prev.map((m:any)=>[m.id,m])); for (const x of popularMovies.data) map.set(x.id,x); return Array.from(map.values()); }); }, [popularMovies]);
  useEffect(() => { if (latestSeries?.data) setListSeries(prev => { const map = new Map(prev.map((m:any)=>[m.id,m])); for (const x of latestSeries.data) map.set(x.id,x); return Array.from(map.values()); }); }, [latestSeries]);
  useEffect(() => { if (anime?.data) setListAnime(prev => { const map = new Map(prev.map((m:any)=>[m.id,m])); for (const x of anime.data) map.set(x.id,x); return Array.from(map.values()); }); }, [anime]);
  useEffect(() => { if (indo?.data) setListIndo(prev => { const map = new Map(prev.map((m:any)=>[m.id,m])); for (const x of indo.data) map.set(x.id,x); return Array.from(map.values()); }); }, [indo]);
  useEffect(() => { if (kdrama?.data) setListKdrama(prev => { const map = new Map(prev.map((m:any)=>[m.id,m])); for (const x of kdrama.data) map.set(x.id,x); return Array.from(map.values()); }); }, [kdrama]);

  const isLoading = loadingLatest || loadingPopular || loadingSeries || loadingAnime || loadingIndo || loadingKDrama || loadingAdult;
  const hasError = errorLatest || errorPopular || errorSeries || errorAnime || errorIndo || errorKDrama || errorAdult;

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
      <>
          {/* Hero Section */}
          <section className="relative h-[400px] md:h-[500px] mb-12 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
                  {heroList.map((item, idx) => (
                    <div key={item.id ?? idx} className="relative min-w-full h-full">
                      {item.cover ? (
                        <img
                          src={item.cover}
                          onLoad={() => { if (idx === heroIndex) setHeroLoaded(true); }}
                          className="w-full h-full object-cover"
                          alt={item.title}
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-20">
                {heroItem && (
                  <div key={heroItem.id} className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-bold">
                      {heroItem.title}
                    </h1>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      {heroItem.year && <span>{heroItem.year}</span>}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">{heroItem.rating?.toFixed ? heroItem.rating.toFixed(1) : heroItem.rating}</span>
                        <span>/10</span>
                      </span>
                    </div>
                    <p className="text-lg md:text-xl text-muted-foreground line-clamp-3">
                      {heroItem.synopsis || 'Temukan film dan seri terbaru untuk ditonton.'}
                    </p>
                    <div className="flex gap-3">
                      <Button asChild size="lg">
                        <Link to={`/${heroItem.type}/${heroItem.id}`}>
                          <Info />
                          Lihat Detail
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}



                {heroList.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {heroList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHeroIndex(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-2 w-2 rounded-full ${idx === heroIndex ? 'bg-primary' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
          </section>

          <div className="container mx-auto px-4 py-8 space-y-12">
            {latestMovies?.data && latestMovies.data.length > 0 && (
              <div className="space-y-4">
                <MovieCarousel title="Latest Movies" movies={listLatest} />
                <Button asChild variant="outline"><Link to="/browse/latest-movies">Lihat lebih banyak</Link></Button>
              </div>
            )}

            {popularMovies?.data && popularMovies.data.length > 0 && (
              <div className="space-y-4">
                <MovieCarousel title="Popular Movies" movies={listPopular} />
                <Button asChild variant="outline"><Link to="/browse/popular-movies">Lihat lebih banyak</Link></Button>
              </div>
            )}

            {latestSeries?.data && latestSeries.data.length > 0 && (
              <div className="space-y-4">
                <MovieCarousel title="Latest Series" movies={listSeries} />
                <Button asChild variant="outline"><Link to="/browse/latest-series">Lihat lebih banyak</Link></Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Anime Filter:</span>
                <Button variant={animeType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setAnimeType('all')}>Semua</Button>
                <Button variant={animeType === 'tv' ? 'default' : 'outline'} size="sm" onClick={() => setAnimeType('tv')}>TV Series</Button>
                <Button variant={animeType === 'movie' ? 'default' : 'outline'} size="sm" onClick={() => setAnimeType('movie')}>Movie</Button>
                <span className="mx-2 text-muted-foreground">|</span>
                <Button variant={animeAudio === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setAnimeAudio('all')}>All</Button>
                <Button variant={animeAudio === 'sub' ? 'default' : 'outline'} size="sm" onClick={() => setAnimeAudio('sub')}>Sub</Button>
                <Button variant={animeAudio === 'dub' ? 'default' : 'outline'} size="sm" onClick={() => setAnimeAudio('dub')}>Dub</Button>
              </div>
              {anime?.data && anime.data.length > 0 && (
                <div className="space-y-4">
                  <MovieCarousel title="Anime" movies={listAnime} />
                  <Button asChild variant="outline"><Link to={`/browse/anime?type=${animeType}&audio=${animeAudio}`}>Lihat lebih banyak</Link></Button>
                </div>
              )}
            </div>

            {indo?.data && indo.data.length > 0 && (
              <div className="space-y-4">
                <MovieCarousel title="Indonesian Movies" movies={listIndo} />
                <Button asChild variant="outline"><Link to="/browse/indonesian-movies">Lihat lebih banyak</Link></Button>
              </div>
            )}

            {kdrama?.data && kdrama.data.length > 0 && (
              <div className="space-y-4">
                <MovieCarousel title="Korean Drama" movies={listKdrama} />
                <Button asChild variant="outline"><Link to="/browse/korean-drama">Lihat lebih banyak</Link></Button>
              </div>
            )}

            {adult?.data && adult.data.length > 0 && (
              <div className="space-y-4">
                <MovieCarousel title="Adult Movies 21+" movies={adult.data} />
                <Button asChild variant="outline"><Link to="/browse/adult-movies">Lihat lebih banyak</Link></Button>
              </div>
            )}
          </div>
      </>
  );
}
