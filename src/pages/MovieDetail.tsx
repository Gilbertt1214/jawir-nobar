import { useParams, Link, useMatch } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Globe, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const isSeriesRoute = !!useMatch('/series/:id');
  const { data: movie, isLoading, error } = useQuery({
    queryKey: [isSeriesRoute ? 'series' : 'movie', id],
    queryFn: () => (isSeriesRoute ? movieAPI.getSeriesById(id!) : movieAPI.getMovieById(id!)),
    enabled: !!id,
  });

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<Array<{ name: string; message: string; time: number }>>([]);

  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(`comments:movie:${id}`);
      setComments(raw ? JSON.parse(raw) : []);
    } catch {
      setComments([]);
    }
  }, [id]);

  const addComment = () => {
    const n = name.trim();
    const m = message.trim();
    if (!n || !m || !id) return;
    const next = [{ name: n, message: m, time: Date.now() }, ...comments];
    setComments(next);
    localStorage.setItem(`comments:movie:${id}`, JSON.stringify(next));
    setName('');
    setMessage('');
  };

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
    <div className="min-h-screen pb-24">
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

            {movie.type === 'movie' && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Watch</h2>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
                  <iframe
                    src={`https://vidlink.pro/movie/${id}?player=jw&icons=default&title=true&poster=true`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    frameBorder={0}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 mb-24 rounded-lg border bg-card p-4 md:p-6">
              <h2 className="text-2xl font-semibold mb-4">Comments</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <Textarea placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} className="md:col-span-2" />
              </div>
              <div className="flex justify-end">
                <Button onClick={addComment}>Send</Button>
              </div>
              <div className="mt-6 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground">Belum ada komentar.</p>
                ) : (
                  comments.map((c, idx) => (
                    <div key={`${c.time}-${idx}`} className="p-4 rounded-lg border bg-background">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.time).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
