import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SeriesEpisodes() {
  const { id } = useParams<{ id: string }>();
  
  const { data: series } = useQuery({
    queryKey: ['series', id],
    queryFn: () => movieAPI.getSeriesById(id!),
    enabled: !!id,
  });

  const { data: episodes, isLoading, error } = useQuery({
    queryKey: ['episodes', id],
    queryFn: () => movieAPI.getEpisodes(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
        <SkeletonGrid count={12} />
      </div>
    );
  }

  if (error || !episodes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load episodes.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {series?.title || 'Series Episodes'}
        </h1>
        <p className="text-muted-foreground">
          {episodes.length} episode{episodes.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {episodes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Watch</h2>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
            <iframe
              src={episodes[0].streamUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              frameBorder={0}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {episodes.map((episode) => (
          <Link key={episode.id} to={`/series/${id}/episodes/${episode.id}`}>
            <Card className="overflow-hidden group cursor-pointer hover:shadow-card-hover transition-smooth">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={episode.cover || '/placeholder.svg'}
                  alt={episode.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-smooth"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-smooth">
                  Episode {episode.episodeNumber}: {episode.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Season {episode.seasonNumber}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
