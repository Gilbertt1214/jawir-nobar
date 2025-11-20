import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function EpisodeDetail() {
  const { seriesId, episodeId } = useParams<{ seriesId: string; episodeId: string }>();
  
  const { data: episode, isLoading, error } = useQuery({
    queryKey: ['episode', seriesId, episodeId],
    queryFn: () => movieAPI.getEpisodeById(seriesId!, episodeId!),
    enabled: !!seriesId && !!episodeId,
  });

  const [source, setSource] = useState<'vidlink'|'embedsu'|'multiembed'|'twoembed'>('vidlink');

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
        <div className="mb-3 flex flex-wrap gap-2">
          <Button variant={source==='vidlink'?'default':'outline'} size="sm" onClick={()=>setSource('vidlink')}>VidLink</Button>
          <Button variant={source==='embedsu'?'default':'outline'} size="sm" onClick={()=>setSource('embedsu')}>Embed.su</Button>
          <Button variant={source==='multiembed'?'default':'outline'} size="sm" onClick={()=>setSource('multiembed')}>MultiEmbed</Button>
          <Button variant={source==='twoembed'?'default':'outline'} size="sm" onClick={()=>setSource('twoembed')}>2Embed</Button>
        </div>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
          <iframe
            src={source==='vidlink'
              ? `https://vidlink.pro/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}?player=jw&icons=default&title=true&poster=true`
              : source==='embedsu'
              ? `https://embed.su/embed/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`
              : source==='multiembed'
              ? `https://multiembed.mov/?video_id=${seriesId}&s=${episode.seasonNumber}&e=${episode.episodeNumber}`
              : `https://www.2embed.stream/embed/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`
            }
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
