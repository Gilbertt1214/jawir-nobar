import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Episode } from "@/services/api";

export default function EpisodeDetail() {
    const { seriesId } = useParams();
    const [searchParams] = useSearchParams();
    const seasonFromUrl = searchParams.get("season");
    const episodeFromUrl = searchParams.get("episode");

    const apiEpisodeId =
        seasonFromUrl && episodeFromUrl
            ? `${seasonFromUrl}-${episodeFromUrl}`
            : undefined;

    const {
        data: episode,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["episode", seriesId, apiEpisodeId],
        queryFn: async () => {
            if (!seriesId) throw new Error("Series ID is missing");
            if (!apiEpisodeId)
                throw new Error("Episode ID is missing. Check URL parameters.");

            const response = await movieAPI.getEpisodeById(
                seriesId,
                apiEpisodeId
            );
            if (!response) throw new Error("Episode not found");
            return response;
        },
        enabled: !!seriesId && !!apiEpisodeId,
        retry: 2,
        staleTime: 60000,
    });

    const [source, setSource] = useState("vidlink");

    if (isLoading) {
        return (
            <div className="w-full max-w-full px-3 py-4">
                <Link to={`/series/${seriesId}/episodes`}>
                    <Button variant="ghost" className="mb-4 w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Episodes
                    </Button>
                </Link>

                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="aspect-video w-full rounded-lg mb-6" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        );
    }

    if (error || !episode) {
        const errorMessage =
            error?.message || "Episode not found or failed to load.";

        return (
            <div className="w-full max-w-full px-3 py-4">
                <Link to={`/series/${seriesId}/episodes`}>
                    <Button variant="ghost" className="mb-4 w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Episodes
                    </Button>
                </Link>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>

                <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
                    <Link to={`/series/${seriesId}/episodes`}>
                        <Button variant="outline" className="w-full sm:w-auto">
                            Go to Episode List
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="w-full sm:w-auto"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-3 py-4">
            <Link to={`/series/${seriesId}/episodes`}>
                <Button variant="ghost" className="mb-4 w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Episodes
                </Button>
            </Link>

            <div className="max-w-3xl mx-auto space-y-6">

                {/* Provider Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                        variant={source === "vidlink" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSource("vidlink")}
                        className="text-[12px] py-1 px-1 w-full truncate"
                    >
                        VidLink
                    </Button>

                    <Button
                        variant={source === "embedsu" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSource("embedsu")}
                        className="text-[12px] py-1 px-1 w-full truncate"
                    >
                        Embed.su
                    </Button>

                    <Button
                        variant={source === "multiembed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSource("multiembed")}
                        className="text-[12px] py-1 px-1 w-full truncate"
                    >
                        MultiEmbed
                    </Button>

                    <Button
                        variant={source === "twoembed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSource("twoembed")}
                        className="text-[12px] py-1 px-1 w-full truncate"
                    >
                        2Embed
                    </Button>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
                    <iframe
                        src={
                            source === "vidlink"
                                ? `https://vidlink.pro/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}?player=jw&icons=default&title=true&poster=true`
                                : source === "embedsu"
                                ? `https://embed.su/embed/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`
                                : source === "multiembed"
                                ? `https://multiembed.mov/?video_id=${seriesId}&s=${episode.seasonNumber}&e=${episode.episodeNumber}`
                                : `https://www.2embed.stream/embed/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`
                        }
                        className="absolute inset-0 w-full h-full max-h-[260px] sm:max-h-none"
                        allowFullScreen
                        frameBorder={0}
                        title={`Episode ${episode.episodeNumber} - ${episode.title}`}
                    />
                </div>

                {/* Episode Details */}
                <div>
                    <h1 className="text-xl md:text-3xl font-bold mb-2 leading-snug break-words">
                        Episode {episode.episodeNumber}: {episode.title}
                    </h1>

                    <p className="text-muted-foreground text-sm">
                        Season {episode.seasonNumber}
                    </p>
                </div>
            </div>
        </div>
    );
}
