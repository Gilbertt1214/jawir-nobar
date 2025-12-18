import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    ExternalLink,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Play,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useMemo } from "react";
import type { StreamingProvider } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AnimeWatch() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [iframeKey, setIframeKey] = useState(0);
    const [providerError, setProviderError] = useState(false);
    const { t, language } = useLanguage();

    // Check if this is a "not available" placeholder slug
    const isNotAvailable = slug?.startsWith("not-available-");

    // Always fetch episode data from Otakudesu API
    const {
        data: episodeData,
        isLoading: loadingEpisode,
        error: episodeError,
    } = useQuery({
        queryKey: ["animeEpisodeStream", slug, language],
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

    // List of domains that are known to block iframe embedding via X-Frame-Options or CSP
    // Also including domains that might cause "Component already rendered" if injected poorly
    const UNEMBEDDABLE_DOMAINS = [
        "jitu77official.makeup",
        "faphouse4k.com",
        "dood.re",
        "dood.wf",
        "dood.cx",
        "dood.sh",
        "dood.watch",
        "dood.to",
        "dood.so",
        "dood.la",
        "dood.ws",
    ];

    const isUnembeddable = (url: string) => {
        return UNEMBEDDABLE_DOMAINS.some((domain) => url.includes(domain));
    };

    const isBlocked = currentStream?.url && isUnembeddable(currentStream.url);

    useEffect(() => {
        setIframeKey((p) => p + 1);
        setProviderError(false); // Reset error on slug change
    }, [slug]);

    // Loading state
    if (loadingEpisode) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
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
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {t("failedToLoadEpisode")}
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
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {isNotAvailable
                                ? t("episodeNotAvailable")
                                : t("noStreamAvailableEpisode")}
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
        t("typeAnime") + " " + t("episode");

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                        {displayTitle}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {t("episode")} {episodeNumber}
                    </p>
                </div>

                <div className="max-w-6xl mx-auto space-y-4">
                    {/* Video Player - Full Width */}
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-border">
                        {providerError || isBlocked ? (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
                                <div className="text-center text-white space-y-4 max-w-md">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                                        <ExternalLink className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">
                                            {isBlocked
                                                ? t("externalPlayerRequired")
                                                : t("playerFailedToLoad")}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {isBlocked
                                                ? t("serverBlockedDirectPlay")
                                                : t("playerErrorOrBlocked")}
                                            <br />
                                            {t("watchInNewTab")}
                                        </p>
                                    </div>
                                    <Button
                                        className="bg-primary hover:bg-primary w-full sm:w-auto"
                                        onClick={() =>
                                            window.open(
                                                currentStream.url,
                                                "_blank"
                                            )
                                        }
                                        >
                                            <Play className="h-4 w-4 mr-2 fill-current" />
                                            {t("openPlayer")}
                                        </Button>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                key={iframeKey}
                                src={currentStream.url}
                                title={`${displayTitle} - Video Player`}
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                referrerPolicy="no-referrer"
                                onError={() => setProviderError(true)}
                            />
                        )}
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-card rounded-lg p-3 border border-border">
                        {/* Provider Info */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg">
                            <Monitor className="w-4 h-4" />
                            <span>
                                {currentStream.name || t("all")}
                                {currentStream.quality &&
                                    ` (${currentStream.quality})`}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setIframeKey((p) => p + 1);
                                    setProviderError(false);
                                }}
                                className="h-11 w-11"
                                title="Refresh Player"
                                aria-label="Refresh Player"
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
                                title={t("newTab")}
                                aria-label={t("newTab")}
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
                            <ChevronLeft className="w-4 h-4 mr-2" /> {t("previousEpisode")}
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
                            {t("nextEpisode")}{" "}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Info Alert */}
                    <Alert className="bg-primary/10 border-primary/20">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-muted-foreground">
                            {t("animeStreamDisclaimer")}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
}
