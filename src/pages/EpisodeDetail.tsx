import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

// Import tipe dari API
import { Episode } from "@/services/api";

export default function EpisodeDetail() {
    const { seriesId } = useParams<{ seriesId: string }>();
    const [searchParams] = useSearchParams(); // Gunakan useSearchParams
    const seasonFromUrl = searchParams.get("season");
    const episodeFromUrl = searchParams.get("episode");

    // Konstruksi ID episode untuk API (format "season-episode")
    const apiEpisodeId =
        seasonFromUrl && episodeFromUrl
            ? `${seasonFromUrl}-${episodeFromUrl}`
            : undefined;

    const {
        data: episode, // <-- Perhatikan: gunakan 'data: episode' untuk mendapatkan data sebenarnya
        isLoading,
        error,
        refetch,
    } = useQuery<Episode, Error>({
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
        enabled: !!seriesId && !!apiEpisodeId, // Hanya jalankan jika ID valid
        retry: 2,
        staleTime: 1 * 60 * 1000, // Cache 1 menit
    });

    const [source, setSource] = useState<
        "vidlink" | "embedsu" | "multiembed" | "twoembed"
    >("vidlink");

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link to={`/series/${seriesId}/episodes`}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Episodes
                    </Button>
                </Link>
                <Skeleton className="h-10 w-32 mb-8" />
                <Skeleton className="aspect-video w-full rounded-lg mb-6" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
        );
    }

    // Cek error atau jika episode tidak ditemukan
    if (error || !episode) {
        const errorMessage =
            error?.message || "Episode not found or failed to load.";
        return (
            <div className="container mx-auto px-4 py-8">
                <Link to={`/series/${seriesId}/episodes`}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Episodes
                    </Button>
                </Link>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/series/${seriesId}/episodes`}>
                        <Button variant="outline">Go to Episode List</Button>
                    </Link>
                    <Button variant="outline" onClick={() => refetch()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Sekarang, 'episode' dijamin tidak null/undefined karena pengecekan di atas
    return (
        <div className="container mx-auto px-4 py-8">
            <Link to={`/series/${seriesId}/episodes`}>
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Episodes
                </Button>
            </Link>

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Video Player Controls */}
                <div className="mb-3 flex flex-wrap gap-2">
                    <Button
                        variant={source === "vidlink" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSource("vidlink")}
                    >
                        VidLink
                    </Button>
                    <Button
                        variant={source === "embedsu" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSource("embedsu")}
                    >
                        Embed.su
                    </Button>
                    <Button
                        variant={
                            source === "multiembed" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSource("multiembed")}
                    >
                        MultiEmbed
                    </Button>
                    <Button
                        variant={source === "twoembed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSource("twoembed")}
                    >
                        2Embed
                    </Button>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
                    <iframe
                        src={
                            source === "vidlink"
                                // Format untuk TV Show di vidlink.pro: /tv/{tmdbId}/{season}/{episode}
                                ? `https://vidlink.pro/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}?player=jw&icons=default&title=true&poster=true`
                                : source === "embedsu"
                                ? `https://embed.su/embed/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`
                                : source === "multiembed"
                                ? `https://multiembed.mov/?video_id=${seriesId}&s=${episode.seasonNumber}&e=${episode.episodeNumber}`
                                : `https://www.2embed.stream/embed/tv/${seriesId}/${episode.seasonNumber}/${episode.episodeNumber}`
                        }
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        frameBorder={0}
                        title={`Episode ${episode.episodeNumber} - ${episode.title}`}
                    />
                </div>

                {/* Episode Info */}
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