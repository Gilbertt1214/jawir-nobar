import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonGrid } from "@/components/features/movie/SkeletonCard";
import { AlertCircle, Search, RefreshCw, BookOpen, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MangaList() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived state from URL params
    const searchQuery = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");

    const [previewResults, setPreviewResults] = useState<any[]>([]);
    const [isPreviewSearching, setIsPreviewSearching] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Local state for the search input to keep typing fast
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    const { t, language } = useLanguage();
    const navigate = useNavigate();

    // Debounce search query update to URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearchQuery !== searchQuery) {
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (localSearchQuery) {
                        next.set("q", localSearchQuery);
                    } else {
                        next.delete("q");
                    }
                    next.delete("page");
                    return next;
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearchQuery, setSearchParams, searchQuery]);

    // Update local state when URL changes
    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    // Search preview debouncing
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (localSearchQuery.length >= 2) {
                setIsPreviewSearching(true);
                try {
                    const results =
                        await movieAPI.searchManga(localSearchQuery);
                    setPreviewResults(results.data.slice(0, 5));
                } catch (error) {
                    console.error("Manga preview search failed:", error);
                    setPreviewResults([]);
                } finally {
                    setIsPreviewSearching(false);
                }
            } else {
                setPreviewResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearchQuery]);

    const setPage = (newPage: number | ((prev: number) => number)) => {
        setSearchParams((prev) => {
            const current = parseInt(prev.get("page") || "1");
            const val =
                typeof newPage === "function" ? newPage(current) : newPage;
            const next = new URLSearchParams(prev);
            next.set("page", String(val));
            if (searchQuery) next.set("q", searchQuery);
            return next;
        });
        // Scroll to top when changing page
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Get latest manga
    const {
        data: latestManga,
        isLoading: loadingLatest,
        refetch: refetchLatest,
    } = useQuery({
        queryKey: ["latestManga", page, language],
        queryFn: () => movieAPI.getLatestManga(page),
        enabled: !searchQuery,
    });

    // Search manga
    const { data: searchResults, isLoading: loadingSearch } = useQuery({
        queryKey: ["searchManga", searchQuery, page, language],
        queryFn: () => movieAPI.searchManga(searchQuery, page),
        enabled: searchQuery.length > 2,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const displayData = useMemo(() => {
        if (searchQuery.length > 2 && searchResults) {
            return searchResults.data;
        }
        return latestManga?.data || [];
    }, [searchQuery, searchResults, latestManga]);

    const isLoading = searchQuery.length > 2 ? loadingSearch : loadingLatest;
    const paginationData = searchQuery.length > 2 ? searchResults : latestManga;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t("manga")}
                    </h1>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t("searchManga")}
                            value={localSearchQuery}
                            onChange={(e) =>
                                setLocalSearchQuery(e.target.value)
                            }
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => {
                                setTimeout(() => setIsInputFocused(false), 200);
                            }}
                            className="pl-12 py-6 text-base rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                        />

                        {/* Search Preview Dropdown */}
                        {isInputFocused &&
                            (previewResults.length > 0 ||
                                isPreviewSearching) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 space-y-1">
                                        {isPreviewSearching ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                {t("loading")}...
                                            </div>
                                        ) : (
                                            previewResults.map((result) => (
                                                <button
                                                    key={
                                                        result.id || result.slug
                                                    }
                                                    type="button"
                                                    onClick={() => {
                                                        navigate(
                                                            `/manga/${result.slug || result.id}`,
                                                        );
                                                        setLocalSearchQuery("");
                                                        setPreviewResults([]);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-primary/10 rounded-xl transition-colors text-left group"
                                                >
                                                    <div className="w-10 h-14 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                                                        {result.cover ? (
                                                            <img
                                                                src={
                                                                    result.cover
                                                                }
                                                                alt={
                                                                    result.title
                                                                }
                                                                className="w-full h-full object-cover"
                                                                referrerPolicy="no-referrer"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                                                                No Img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                            {result.title}
                                                        </div>
                                                        {result.latestChapter && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    result.latestChapter
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </form>

                {/* Content Grid */}
                {isLoading ? (
                    <SkeletonGrid count={12} />
                ) : (
                    <>
                        {displayData.length === 0 ? (
                            <div className="rounded-xl p-8 text-center bg-card border border-border">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-secondary">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {searchQuery.length > 2
                                            ? `${t("noResultsFor")} "${searchQuery}"`
                                            : t("noContentAvailable")}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {searchQuery.length > 2
                                            ? t("tryDifferentKeywords")
                                            : t("tryAgainLater")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {displayData.map((manga, index) => (
                                    <Link
                                        key={`${manga.slug || manga.id}-${index}`}
                                        to={`/manga/${manga.slug || manga.id}`}
                                        className="group"
                                    >
                                        <Card className="overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02] bg-card relative">
                                            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                                <img
                                                    src={
                                                        manga.cover ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={manga.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "/placeholder.svg";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                {/* Rating badge */}
                                                {manga.rating && (
                                                    <div className="absolute top-2 left-2">
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-yellow-500 font-bold">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            {manga.rating}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-3">
                                                <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                                    {manga.title}
                                                </h3>
                                                {manga.type && (
                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                                                        {manga.type}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {paginationData &&
                            (displayData.length > 0 || page > 1) && (
                                <div className="flex flex-col items-center gap-4 mt-8">
                                    {/* Page info */}
                                    {paginationData.totalItems > 0 && (
                                        <div className="text-sm text-muted-foreground">
                                            {language === "id"
                                                ? `Menampilkan ${displayData.length} dari ${paginationData.totalItems} manga`
                                                : `Showing ${displayData.length} of ${paginationData.totalItems} manga`}
                                        </div>
                                    )}

                                    {/* Pagination buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(1)}
                                            disabled={page <= 1}
                                        >
                                            {t("first")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                            disabled={page <= 1}
                                        >
                                            {t("previous")}
                                        </Button>

                                        {/* Page numbers */}
                                        <div className="flex items-center gap-1">
                                            {paginationData.totalPages > 1 ? (
                                                Array.from(
                                                    {
                                                        length: Math.min(
                                                            5,
                                                            paginationData.totalPages,
                                                        ),
                                                    },
                                                    (_, i) => {
                                                        let pageNum;
                                                        if (
                                                            paginationData.totalPages <=
                                                            5
                                                        ) {
                                                            pageNum = i + 1;
                                                        } else if (page <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (
                                                            page >=
                                                            paginationData.totalPages -
                                                                2
                                                        ) {
                                                            pageNum =
                                                                paginationData.totalPages -
                                                                4 +
                                                                i;
                                                        } else {
                                                            pageNum =
                                                                page - 2 + i;
                                                        }
                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={
                                                                    page ===
                                                                    pageNum
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                onClick={() =>
                                                                    setPage(
                                                                        pageNum,
                                                                    )
                                                                }
                                                                className={`w-10 h-10 ${
                                                                    page ===
                                                                    pageNum
                                                                        ? "bg-primary hover:bg-primary text-white"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    className="w-10 h-10 bg-primary hover:bg-primary text-white"
                                                >
                                                    {page}
                                                </Button>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setPage((p) => p + 1)
                                            }
                                            disabled={
                                                displayData.length === 0 ||
                                                (paginationData.totalPages >
                                                    0 &&
                                                    page >=
                                                        paginationData.totalPages)
                                            }
                                        >
                                            {t("next")}
                                        </Button>
                                        {paginationData.totalPages > 1 && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setPage(
                                                        paginationData.totalPages,
                                                    )
                                                }
                                                disabled={
                                                    page >=
                                                    paginationData.totalPages
                                                }
                                            >
                                                {t("last")}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Current page info */}
                                    {paginationData.totalPages > 1 && (
                                        <span className="text-muted-foreground">
                                            {language === "id"
                                                ? `Halaman ${page} dari ${paginationData.totalPages}`
                                                : `Page ${page} of ${paginationData.totalPages}`}
                                        </span>
                                    )}
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}
