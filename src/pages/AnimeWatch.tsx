import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    AlertCircle,
    ExternalLink,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Monitor,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useMemo } from "react";
import type { StreamingProvider } from "@/services/api/types";

export default function AnimeWatch() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [iframeKey, setIframeKey] = useState(0);

    // Check if this is a "not available" placeholder slug
    const isNotAvailable = slug?.startsWith("not-available-");

    // Always fetch episode data from Otakudesu API
    const {
        data: episodeData,
        isLoading: loadingEpisode,
        error: episodeError,
    } = useQuery({
        queryKey: ["animeEpisodeStream", slug],
        queryFn: async () => {
            if (!slug || isNotAvailable) return null;
            console.log("Fetching episode from Otakudesu API:", slug);
            const data = await movieAPI.getAnimeEpisodeStreamOtakudesu(slug);
            console.log("Episode data from API:", data);
            return data;
        },
        enabled: Boolean(slug) && !isNotAvailable,
        retry: 2,
    });

    // Extract episode number from slug
    const episodeNumber = useMemo(() => {
        if (!slug) return 1;
        // Try to extract episode number from various formats
        const match = slug.match(/episode[_-]?(\d+)/i) || slug.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 1;
    }, [slug]);

    // Get stream provider from Otakudesu API response
    const currentStream = useMemo((): StreamingProvider | null => {
        if (!episodeData) return null;

        // Use stream_url directly from API (desustream.info embed)
        if (episodeData.streamUrl) {
            return {
                name: "Desustream",
                url: episodeData.streamUrl,
                available: true,
                quality: "Multi Quality",
            };
        }
        return null;
    }, [episodeData]);

    useEffect(() => {
        setIframeKey((p) => p + 1);
    }, [slug]);

    // Loading state
    if (loadingEpisode) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Button variant="ghost" disabled className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                    <div className="max-w-6xl mx-auto">
                        <div className="aspect-video bg-muted animate-pulse rounded-lg" />
                        <div className="mt-4 h-12 bg-muted animate-pulse rounded-lg w-48" />
                    </div>
                </div>
            </div>
        );
    }

    if (episodeError) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Gagal memuat episode. Episode mungkin tidak tersedia
                            di Otakudesu.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    if (!currentStream || isNotAvailable) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {isNotAvailable
                                ? "Episode ini tidak tersedia di Otakudesu. Coba cari anime ini langsung di halaman Anime."
                                : "Tidak ada streaming tersedia untuk episode ini. Pastikan slug episode valid."}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    // Format title from slug if not available from API
    const displayTitle =
        episodeData?.title ||
        slug
            ?.replace(/-/g, " ")
            .replace(/episode \d+$/i, "")
            .trim() ||
        "Anime Episode";

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                            {displayTitle}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Episode {episodeNumber}
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-4">
                    {/* Video Player - Full Width */}
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-border">
                        <iframe
                            key={iframeKey}
                            src={currentStream.url}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-card rounded-lg p-3 border border-border">
                        {/* Provider Info */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg">
                            <Monitor className="w-4 h-4" />
                            <span>
                                {currentStream.name || "Default"}
                                {currentStream.quality &&
                                    ` (${currentStream.quality})`}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIframeKey((p) => p + 1)}
                                className="h-11 w-11"
                                title="Refresh Player"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    window.open(currentStream.url, "_blank")
                                }
                                className="h-11 w-11"
                                title="Buka di Tab Baru"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Episode Navigation */}
                    <div className="flex justify-between items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (episodeData?.prevEpisode) {
                                    navigate(
                                        `/anime/watch/${episodeData.prevEpisode}`
                                    );
                                }
                            }}
                            disabled={!episodeData?.prevEpisode}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Episode
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (episodeData?.nextEpisode) {
                                    navigate(
                                        `/anime/watch/${episodeData.nextEpisode}`
                                    );
                                }
                            }}
                            disabled={!episodeData?.nextEpisode}
                        >
                            Episode Selanjutnya{" "}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Info Alert */}
                    <Alert className="bg-red-600/10 border-red-600/20">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-muted-foreground">
                            Jika video tidak bisa diputar, coba refresh player
                            atau buka di tab baru. Stream disediakan oleh
                            Otakudesu.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
}
