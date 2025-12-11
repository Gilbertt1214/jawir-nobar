import { Link } from "react-router-dom";
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
    Tv,
    CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

type TabType = "ongoing" | "complete";

export default function AnimeList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<TabType>("ongoing");
    const [apiStatus, setApiStatus] = useState<boolean | null>(null);
    const { t } = useLanguage();

    // Check API status on mount
    useEffect(() => {
        const checkAPI = async () => {
            try {
                const ongoing = await movieAPI.getOngoingAnimeList();
                setApiStatus(ongoing.length > 0);
            } catch {
                setApiStatus(false);
            }
        };
        checkAPI();
    }, []);

    // Get ongoing anime
    const {
        data: ongoingAnime,
        isLoading: loadingOngoing,
        refetch: refetchOngoing,
    } = useQuery({
        queryKey: ["ongoingAnime"],
        queryFn: () => movieAPI.getOngoingAnimeList(),
        enabled: activeTab === "ongoing" && !searchQuery,
    });

    // Get complete anime using /anime/unlimited endpoint with pagination
    const {
        data: completeAnime,
        isLoading: loadingComplete,
        refetch: refetchComplete,
    } = useQuery({
        queryKey: ["allAnimePaginated", page],
        queryFn: () => movieAPI.getAllAnimePaginated(page, 24), // 24 items per page
        enabled: activeTab === "complete" && !searchQuery,
    });

    // Search anime
    const { data: searchResults, isLoading: loadingSearch } = useQuery({
        queryKey: ["searchAnimeOtakudesu", searchQuery],
        queryFn: () => movieAPI.searchAnimeOtakudesu(searchQuery),
        enabled: searchQuery.length > 2,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleRefresh = () => {
        if (activeTab === "ongoing") {
            refetchOngoing();
        } else {
            refetchComplete();
        }
    };

    // Get display data based on active tab and search
    const getDisplayData = () => {
        if (searchQuery.length > 2 && searchResults) {
            return searchResults;
        }
        if (activeTab === "ongoing") {
            return ongoingAnime || [];
        }
        return completeAnime?.data || [];
    };

    const displayData = getDisplayData();
    const isLoading =
        searchQuery.length > 2
            ? loadingSearch
            : activeTab === "ongoing"
            ? loadingOngoing
            : loadingComplete;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Anime
                        </h1>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                Powered by Otakudesu (Sanka API)
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
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('refresh')}
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => {
                        setActiveTab(v as TabType);
                        setPage(1); // Reset page when tab changes
                    }}
                    className="mb-6"
                >
                    <TabsList className="bg-secondary border border-border">
                        <TabsTrigger
                            value="ongoing"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                            <Tv className="w-4 h-4 mr-2" />
                            {t('ongoing')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="complete"
                            className="data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t('complete')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t('searchAnime')}
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
                            {activeTab === "complete"
                                ? t('loadingAnimeThumbnails')
                                : t('loading')}
                        </p>
                    </div>
                )}

                {/* Content Grid */}
                {!isLoading && displayData && (
                    <>
                        {displayData.length === 0 ? (
                            <div className="rounded-xl p-8 text-center bg-card border border-border">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-secondary">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {searchQuery.length > 2
                                            ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                                            : "Belum ada anime tersedia"}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-6">
                                        {searchQuery.length > 2
                                            ? "Coba kata kunci lain atau periksa ejaan"
                                            : "Coba lagi nanti atau cari judul spesifik"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {displayData.map((item, index) => {
                                    // Check if cover URL is valid
                                    const hasCover =
                                        item.cover &&
                                        item.cover !== "/placeholder.svg" &&
                                        item.cover !== "" &&
                                        item.cover !== "undefined" &&
                                        item.cover.startsWith("http");

                                    const imageUrl = hasCover
                                        ? item.cover
                                        : "/placeholder.svg";

                                    return (
                                        <Link
                                            key={`${
                                                item.slug || item.id
                                            }-${index}`}
                                            to={`/anime/${
                                                item.slug || item.id
                                            }`}
                                            className="group"
                                        >
                                            <Card className="overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02] bg-card">
                                                <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "/placeholder.svg";
                                                        }}
                                                    />
                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    {/* Play button on hover */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                                            <Play className="w-5 h-5 text-white fill-white" />
                                                        </div>
                                                    </div>

                                                    {/* Episode badge */}
                                                    {item.latestEpisode && (
                                                        <div className="absolute top-2 right-2">
                                                            <Badge className="text-xs backdrop-blur-sm bg-primary text-white border-none">
                                                                {
                                                                    item.latestEpisode
                                                                }
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardContent className="p-3">
                                                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                                        {item.title}
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

                {/* Pagination for Complete Anime */}
                {activeTab === "complete" &&
                    completeAnime &&
                    !searchQuery &&
                    completeAnime.totalPages > 1 && (
                        <div className="flex flex-col items-center gap-4 mt-8">
                            {/* Page info */}
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {completeAnime.data.length} dari{" "}
                                {completeAnime.totalItems} anime
                            </div>

                            {/* Pagination buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(1)}
                                    disabled={page <= 1}
                                >
                                    First
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={!completeAnime.hasPrevPage}
                                >
                                    Previous
                                </Button>

                                {/* Page numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        {
                                            length: Math.min(
                                                5,
                                                completeAnime.totalPages
                                            ),
                                        },
                                        (_, i) => {
                                            let pageNum;
                                            if (completeAnime.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (
                                                page >=
                                                completeAnime.totalPages - 2
                                            ) {
                                                pageNum =
                                                    completeAnime.totalPages -
                                                    4 +
                                                    i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={
                                                        page === pageNum
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    onClick={() =>
                                                        setPage(pageNum)
                                                    }
                                                    className={`w-10 h-10 ${
                                                        page === pageNum
                                                            ? "bg-primary hover:bg-primary text-white"
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
                                    disabled={!completeAnime.hasNextPage}
                                >
                                    Next
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setPage(completeAnime.totalPages)
                                    }
                                    disabled={page >= completeAnime.totalPages}
                                >
                                    Last
                                </Button>
                            </div>

                            {/* Current page info */}
                            <span className="text-muted-foreground">
                                Page {page} of {completeAnime.totalPages}
                            </span>
                        </div>
                    )}
            </div>
        </div>
    );
}
