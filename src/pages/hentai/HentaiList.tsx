import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertCircle,
    Search,
    RefreshCw,
    Wifi,
    WifiOff,
    Play,
    Shuffle,
    X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

// Helper to extract base title (remove episode number)
const extractBaseTitle = (title: string): string => {
    return title
        .replace(/\s*[-–]\s*episode\s*\d+/gi, "")
        .replace(/\s*episode\s*\d+/gi, "")
        .replace(/\s*ep\s*\d+/gi, "")
        .replace(/\s*[-–]\s*\d+\s*$/gi, "")
        .replace(/\s*subtitle\s*indonesia/gi, "")
        .replace(/\s*sub\s*indo/gi, "")
        .replace(/\s*\[.*?\]/g, "")
        .replace(/\s*\(.*?\)/g, "")
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

interface GroupedHentai {
    baseTitle: string;
    cover: string;
    episodes: Array<{
        id: string;
        title: string;
        episodeNum: number;
        uploadDate?: string;
    }>;
    latestEpisode: number;
    firstEpisodeId: string;
}

interface RandomHentai {
    id: string;
    title: string;
    cover: string;
    genre: string[];
    synopsis: string;
}

export default function HentaiList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [apiStatus, setApiStatus] = useState<boolean | null>(null);
    const [isLoadingRandom, setIsLoadingRandom] = useState(false);
    const [randomHentai, setRandomHentai] = useState<RandomHentai | null>(null);
    const { t, language } = useLanguage();

    // Handle random hentai
    const handleRandom = async () => {
        setIsLoadingRandom(true);
        try {
            console.log("🎲 Requesting random hentai...");
            const random = await movieAPI.getSankaNekopoiRandom();
            console.log("🎲 Got random:", random);
            if (random) {
                setRandomHentai({
                    id: random.id,
                    title: random.title,
                    cover: random.cover,
                    genre: random.genre || [],
                    synopsis: random.synopsis || "",
                });
            }
        } catch (error) {
            console.error("Failed to get random hentai:", error);
        } finally {
            setIsLoadingRandom(false);
        }
    };

    // Check API status on mount
    useEffect(() => {
        const checkAPI = async () => {
            try {
                const status = await movieAPI.getAPIStatus();
                setApiStatus(status.nekopoi);
            } catch {
                setApiStatus(false);
            }
        };
        checkAPI();
    }, []);

    // Get release list with pagination
    const {
        data: releaseData,
        isLoading: releaseLoading,
        error: releaseError,
        refetch: refetchRelease,
    } = useQuery({
        queryKey: ["hentaiRelease", page, language],
        queryFn: async () => {
            const startPage = (page - 1) * 5 + 1;
            const pagesToLoad = [
                startPage,
                startPage + 1,
                startPage + 2,
                startPage + 3,
                startPage + 4,
            ];

            const results = await Promise.all(
                pagesToLoad.map((p) => movieAPI.getAllHentaiLatest(p))
            );

            const allData = results.flatMap((r) => r.nekopoi.data);
            const uniqueData = allData.filter(
                (item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id)
            );

            return {
                data: uniqueData,
                page,
                totalPages: 10,
                totalItems: uniqueData.length,
            };
        },
        enabled: !searchQuery,
    });

    // Search hentai
    const { data: searchResults, isLoading: searchLoading } = useQuery({
        queryKey: ["hentaiSearch", searchQuery, language],
        queryFn: () => movieAPI.searchAllHentai(searchQuery),
        enabled: searchQuery.length > 2,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    // Get raw data
    const getRawData = () => {
        if (searchQuery.length > 2 && searchResults) {
            return searchResults.nekopoi;
        }
        return releaseData?.data || [];
    };

    const rawData = getRawData();

    // Group episodes by base title
    const groupedData = useMemo(() => {
        const groups: Record<string, GroupedHentai> = {};

        rawData.forEach((item) => {
            const baseTitle = extractBaseTitle(item.title);
            const episodeNum = extractEpisodeNumber(item.title);
            const key = baseTitle.toLowerCase();

            if (!groups[key]) {
                groups[key] = {
                    baseTitle,
                    cover: item.cover,
                    episodes: [],
                    latestEpisode: episodeNum,
                    firstEpisodeId: item.id,
                };
            }

            groups[key].episodes.push({
                id: item.id,
                title: item.title,
                episodeNum,
                uploadDate: item.uploadDate,
            });

            if (episodeNum > groups[key].latestEpisode) {
                groups[key].latestEpisode = episodeNum;
                groups[key].cover = item.cover;
            }
        });

        Object.values(groups).forEach((group) => {
            group.episodes.sort((a, b) => a.episodeNum - b.episodeNum);
        });

        return Object.values(groups).sort(
            (a, b) => b.latestEpisode - a.latestEpisode
        );
    }, [rawData]);

    const isLoading = searchQuery.length > 2 ? searchLoading : releaseLoading;
    const totalItems = groupedData.length;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Hentai
                        </h1>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                Powered by Nekopoi (Sanka API)
                            </p>
                            {apiStatus !== null && (
                                <div className="flex items-center gap-1">
                                    {apiStatus ? (
                                        <Wifi className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <WifiOff className="h-3 w-3 text-primary" />
                                    )}
                                    <span
                                        className={`text-xs ${
                                            apiStatus
                                                ? "text-green-500"
                                                : "text-primary"
                                        }`}
                                    >
                                        {apiStatus ? t('online') : t('offline')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRandom}
                            disabled={isLoadingRandom}
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                            <Shuffle
                                className={`mr-2 h-4 w-4 ${
                                    isLoadingRandom ? "animate-spin" : ""
                                }`}
                            />
                            {isLoadingRandom ? t('loading') : t('random')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchRelease()}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t('refresh')}
                        </Button>
                    </div>
                </div>

                {/* Random Hentai Card */}
                {randomHentai && (
                    <div className="mb-8 p-4 rounded-xl bg-card border-2 border-primary">
                        <div className="flex items-center gap-2 mb-4">
                            <Shuffle className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">
                                🎲 {t('randomPick')}
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRandomHentai(null)}
                                className="ml-auto"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-40 h-56 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <img
                                    src={
                                        randomHentai.cover || "/placeholder.svg"
                                    }
                                    alt={randomHentai.title}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/placeholder.svg";
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {randomHentai.title}
                                </h3>
                                {randomHentai.genre &&
                                    randomHentai.genre.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {randomHentai.genre
                                                .slice(0, 5)
                                                .map((g, i) => (
                                                    <Badge
                                                        key={i}
                                                        className="bg-primary text-primary-foreground text-xs border-none"
                                                    >
                                                        {g}
                                                    </Badge>
                                                ))}
                                        </div>
                                    )}
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                    {randomHentai.synopsis ||
                                        t('noCategoryFound').replace('{category}', 'Hentai')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={() =>
                                            navigate(
                                                `/hentai/watch/${randomHentai.id}`
                                            )
                                        }
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        {t('watchNow')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRandom}
                                        disabled={isLoadingRandom}
                                    >
                                        <Shuffle className="mr-2 h-4 w-4" />
                                        {t('retry')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Source Badge */}
                <div className="flex gap-2 mb-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground">
                        <span className="font-medium">Nekopoi</span>
                        <Badge className="ml-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                            {totalItems}
                        </Badge>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t('searchHentai')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 py-6 text-base rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                        />
                    </div>
                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                        <p className="text-xs text-muted-foreground mt-2 ml-1">
                            {t('minCharSearch')}
                        </p>
                    )}
                </form>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-muted-foreground">
                            {t('loadingContent')}
                        </p>
                    </div>
                )}

                {/* Error State */}
                {releaseError && (
                    <div className="rounded-xl p-6 mb-6 bg-card border border-primary">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-3">
                                <p className="font-semibold text-foreground">
                                    {t('failedToLoadContent')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {(releaseError as Error).message}
                                </p>
                                <Button
                                    onClick={() => refetchRelease()}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t('retry')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                {!isLoading && !releaseError && (
                    <>
                        {groupedData.length === 0 ? (
                            <div className="rounded-xl p-8 text-center bg-card border border-border">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-secondary">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {searchQuery.length > 2
                                            ? `${t('noResultsFor')} "${searchQuery}"`
                                            : t('noContentAvailable')}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-6">
                                        {searchQuery.length > 2
                                            ? t('tryDifferentKeywords')
                                            : t('tryAgainLater')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {groupedData.map((group, index) => {
                                    const hasCover =
                                        group.cover &&
                                        group.cover !== "/placeholder.svg" &&
                                        group.cover !== "" &&
                                        group.cover.startsWith("http");
                                    const imageUrl = hasCover
                                        ? group.cover
                                        : "/placeholder.svg";

                                    return (
                                        <Link
                                            key={`${group.baseTitle}-${index}`}
                                            to={`/hentai/nekopoi/${group.firstEpisodeId}`}
                                            className="group"
                                        >
                                            <Card className="overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02] bg-card">
                                                <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                                                    <img
                                                        src={imageUrl}
                                                        alt={group.baseTitle}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "/placeholder.svg";
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                                            <Play className="w-5 h-5 text-white fill-white" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-2 right-2">
                                                        <Badge className="text-xs backdrop-blur-sm bg-primary text-primary-foreground border-none">
                                                            Hentai
                                                        </Badge>
                                                    </div>
                                                    <div className="absolute top-2 left-2">
                                                        <Badge className="text-xs backdrop-blur-sm bg-primary text-primary-foreground border-none">
                                                            {
                                                                group.episodes
                                                                    .length
                                                            }{" "}
                                                            Ep
                                                        </Badge>
                                                    </div>
                                                    <div className="absolute bottom-2 left-2">
                                                        <Badge className="text-xs backdrop-blur-sm bg-primary/80 text-white border-none">
                                                            Ep{" "}
                                                            {
                                                                group.latestEpisode
                                                            }
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <CardContent className="p-3">
                                                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                                        {group.baseTitle}
                                                    </h3>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {releaseData && !searchQuery && releaseData.totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4 mt-8">
                        <div className="text-sm text-muted-foreground">
                            {t('showingTitles')
                                .replace('{count}', String(groupedData.length))
                                .replace('{page}', String(page))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage(1)}
                                disabled={page <= 1}
                            >
                                {t('first')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page <= 1}
                            >
                                {t('previous')}
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            releaseData.totalPages
                                        ),
                                    },
                                    (_, i) => {
                                        let pageNum;
                                        if (releaseData.totalPages <= 5)
                                            pageNum = i + 1;
                                        else if (page <= 3) pageNum = i + 1;
                                        else if (
                                            page >=
                                            releaseData.totalPages - 2
                                        )
                                            pageNum =
                                                releaseData.totalPages - 4 + i;
                                        else pageNum = page - 2 + i;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    page === pageNum
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 ${
                                                    page === pageNum
                                                        ? "bg-primary hover:bg-primary text-primary-foreground"
                                                        : ""
                                                }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= releaseData.totalPages}
                            >
                                {t('next')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPage(releaseData.totalPages)}
                                disabled={page >= releaseData.totalPages}
                            >
                                {t('last')}
                            </Button>
                        </div>
                        <span className="text-muted-foreground">
                            {t('pageInfo')
                                .replace('{current}', String(page))
                                .replace('{total}', String(releaseData.totalPages))}
                        </span>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-card border border-border">
                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            {t('thirdPartySource')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
