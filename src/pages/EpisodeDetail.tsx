import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EpisodeDetail() {
  const { seriesId, episodeId } = useParams<{ seriesId: string; episodeId: string }>();
  
  const { data: episode, isLoading, error } = useQuery({
    queryKey: ['episode', seriesId, episodeId],
    queryFn: () => movieAPI.getEpisodeById(seriesId!, episodeId!),
    enabled: !!seriesId && !!episodeId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="aspect-video w-full rounded-lg mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Episode not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={`/series/${seriesId}/episodes`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Episodes
        </Button>
      </Link>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Video Player Placeholder */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
          <iframe
            src={episode.streamUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            frameBorder={0}
          />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Episode {episode.episodeNumber}: {episode.title}
          </h1>
          <p className="text-muted-foreground">
            Season {episode.seasonNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
