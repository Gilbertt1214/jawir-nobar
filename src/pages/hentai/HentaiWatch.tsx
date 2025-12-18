import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Download,
    ChevronLeft,
    ChevronRight,
    Play,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";

// Helper to extract base title
const extractBaseTitle = (title: string): string => {
    return title
        .replace(/\s*[-–]\s*episode\s*\d+/gi, "")
        .replace(/\s*episode\s*\d+/gi, "")
        .replace(/\s*ep\s*\d+/gi, "")
        .replace(/\s*[-–]\s*\d+\s*$/gi, "")
        .replace(/\s*subtitle\s*indonesia/gi, "")
        .replace(/\s*sub\s*indo/gi, "")
        .trim();
};

// Helper to extract episode number
const extractEpisodeNumber = (title: string): number => {
    const match =
        title.match(/episode\s*(\d+)/i) ||
        title.match(/ep\s*(\d+)/i) ||
        title.match(/[-–]\s*(\d+)\s*$/);
    return match ? parseInt(match[1]) : 1;
};

export default function HentaiWatch() {
    const { id } = useParams<{ id: string }>();
    const [selectedProvider, setSelectedProvider] = useState(0);
    const [providerError, setProviderError] = useState(false);
    const [activeTab, setActiveTab] = useState<"stream" | "download">("stream");
    const { t, language } = useLanguage();

    // Fetch hentai detail
    const {
        data: hentaiDetail,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["hentaiWatch", id, language],
        queryFn: async () => {
            if (!id) return null;
            return await movieAPI.getNekopoiDetail(id);
        },
        enabled: !!id,
    });

    // Fetch all hentai to find related episodes for navigation
    const { data: allHentai } = useQuery({
        queryKey: ["allHentaiForNav", language],
        queryFn: async () => {
            const pages = [1, 2, 3, 4, 5];
            const results = await Promise.all(
                pages.map((p) => movieAPI.getAllHentaiLatest(p))
            );
            return results.flatMap((r) => r.nekopoi.data);
        },
    });

    // Find related episodes for navigation
    const { prevEpisode, nextEpisode, currentEpisodeNum, baseTitle } =
        useMemo(() => {
            if (!hentaiDetail || !allHentai) {
                return {
                    prevEpisode: null,
                    nextEpisode: null,
                    currentEpisodeNum: 1,
                    baseTitle: "",
                };
            }

            const base = extractBaseTitle(hentaiDetail.title);
            const currentNum = extractEpisodeNumber(hentaiDetail.title);

            const relatedEpisodes = allHentai
                .filter(
                    (item) =>
                        extractBaseTitle(item.title).toLowerCase() ===
                        base.toLowerCase()
                )
                .sort(
                    (a, b) =>
                        extractEpisodeNumber(a.title) -
                        extractEpisodeNumber(b.title)
                );

            const currentIndex = relatedEpisodes.findIndex(
                (ep) => ep.id === id
            );

            return {
                prevEpisode:
                    currentIndex > 0 ? relatedEpisodes[currentIndex - 1] : null,
                nextEpisode:
                    currentIndex < relatedEpisodes.length - 1
                        ? relatedEpisodes[currentIndex + 1]
                        : null,
                currentEpisodeNum: currentNum,
                baseTitle: base,
            };
        }, [hentaiDetail, allHentai, id]);

    // Mark as watched on load
    useEffect(() => {
        if (hentaiDetail && id) {
            const base = extractBaseTitle(hentaiDetail.title);
            const key = `watched_hentai_${base
                .toLowerCase()
                .replace(/\s+/g, "-")}`;
            const stored = localStorage.getItem(key);
            const watched = stored ? new Set(JSON.parse(stored)) : new Set();
            watched.add(id);
            localStorage.setItem(key, JSON.stringify([...watched]));
        }
    }, [hentaiDetail, id]);

    // Build streaming providers
    const streamingProviders = useMemo(() => {
        const providers =
            hentaiDetail?.streamLinks?.map((link) => ({
                name: `${link.provider || t('stream')} (${link.quality || "HD"})`,
                url: link.url,
                available: true,
            })) || [];

        if (providers.length === 0) {
            providers.push({
                name: t('streamUnavailable'),
                url: "#",
                available: false,
            });
        }
        return providers;
    }, [hentaiDetail]);

    // Build download providers
    const downloadProviders = useMemo(() => {
        const providers =
            hentaiDetail?.downloadLinks?.map((link) => ({
                name: `${link.type || t('download')} (${link.quality || "HD"})`,
                url: link.url,
                available: true,
            })) || [];

        if (providers.length === 0) {
            providers.push({
                name: t('noDownloadAvailable'),
                url: "#",
                available: false,
            });
        }
        return providers;
    }, [hentaiDetail]);

    const handleProviderChange = (value: string) => {
        setSelectedProvider(Number(value));
        setProviderError(false);
    };

    const handleRefresh = () => {
        setProviderError(false);
        const temp = selectedProvider;
        setSelectedProvider(-1);
        setTimeout(() => setSelectedProvider(temp), 100);
    };

    // List of domains that are known to block iframe embedding via X-Frame-Options or CSP
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

    const currentProvider = streamingProviders[selectedProvider];
    const isBlocked =
        currentProvider?.url && isUnembeddable(currentProvider.url);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="h-8 w-3/4 bg-muted animate-pulse rounded mb-4" />
                        <div className="aspect-video bg-muted animate-pulse rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !hentaiDetail) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Gagal memuat video. Konten mungkin tidak tersedia.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Title */}
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {baseTitle}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-white">
                                {t('episode')} {currentEpisodeNum}
                            </Badge>
                            {hentaiDetail.genre?.slice(0, 3).map((g, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                >
                                    {g}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant={
                                activeTab === "stream" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("stream")}
                            className={
                                activeTab === "stream"
                                    ? "bg-primary hover:bg-primary"
                                    : ""
                            }
                        >
                            {t('stream')}
                        </Button>
                        <Button
                            variant={
                                activeTab === "download" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("download")}
                            className={
                                activeTab === "download"
                                    ? "bg-primary hover:bg-primary"
                                    : ""
                            }
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {t('download')}
                        </Button>
                    </div>

                    {activeTab === "stream" && (
                        <>
                            {/* Provider Selector */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <Select
                                    value={String(selectedProvider)}
                                    onValueChange={handleProviderChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[300px]">
                                        <SelectValue placeholder={t('selectServer')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {streamingProviders.map(
                                            (provider, index) => (
                                                <SelectItem
                                                    key={index}
                                                    value={String(index)}
                                                >
                                                    {provider.name}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRefresh}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        {t('refresh')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            window.open(
                                                currentProvider?.url,
                                                "_blank"
                                            )
                                        }
                                        disabled={
                                            !currentProvider?.url ||
                                            currentProvider.url === "#"
                                        }
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        {t('newTab')}
                                    </Button>
                                </div>
                            </div>

                            {/* Video Player */}
                            {providerError || isBlocked ? (
                                <div className="relative aspect-video bg-black/50 border border-white/10 rounded-lg flex items-center justify-center p-6">
                                    <div className="text-center text-white space-y-4 max-w-md">
                                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                                            <ExternalLink className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-lg">
                                                {isBlocked
                                                    ? t('externalPlayerRequired')
                                                    : t('playerFailedToLoad')}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {isBlocked
                                                    ? t('serverBlockedDirectPlay')
                                                    : t('playerErrorOrBlocked')}
                                                <br />
                                                {t('watchInNewTab')}
                                            </p>
                                        </div>
                                        <Button
                                            className="bg-primary hover:bg-primary w-full sm:w-auto"
                                            onClick={() =>
                                                window.open(
                                                    currentProvider?.url,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            <Play className="h-4 w-4 mr-2 fill-current" />
                                            {t('openPlayer')}
                                        </Button>
                                    </div>
                                </div>
                            ) : currentProvider?.url &&
                              currentProvider.url !== "#" ? (
                                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                                    <iframe
                                        key={currentProvider.url}
                                        src={currentProvider.url}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allowFullScreen
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        referrerPolicy="no-referrer"
                                        onError={() => setProviderError(true)}
                                    />
                                </div>
                            ) : (
                                <div className="relative aspect-video bg-muted flex items-center justify-center rounded-lg">
                                    <p className="text-muted-foreground">
                                        {t('streamUnavailable')}
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "download" && (
                        <div className="space-y-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {t('clickDownloadToOpen')}
                                </AlertDescription>
                            </Alert>
                            <div className="grid gap-2">
                                {downloadProviders.map((provider, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-card"
                                    >
                                        <span className="text-sm">
                                            {provider.name}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                window.open(
                                                    provider.url,
                                                    "_blank"
                                                )
                                            }
                                            disabled={
                                                !provider.url ||
                                                provider.url === "#"
                                            }
                                        >
                                            <Download className="h-3 w-3 mr-1" />
                                            {t('download')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Episode Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        {prevEpisode ? (
                            <Button asChild variant="outline" className="gap-2">
                                <Link to={`/hentai/watch/${prevEpisode.id}`}>
                                    <ChevronLeft className="h-4 w-4" />
                                    {t('episode')}{" "}
                                    {extractEpisodeNumber(prevEpisode.title)}
                                </Link>
                            </Button>
                        ) : (
                            <div />
                        )}

                        {nextEpisode ? (
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary gap-2"
                            >
                                <Link to={`/hentai/watch/${nextEpisode.id}`}>
                                    {t('episode')}{" "}
                                    {extractEpisodeNumber(nextEpisode.title)}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <div />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
