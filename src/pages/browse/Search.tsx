import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { movieAPI } from "@/services/api";
import { MovieGrid } from "@/components/features/movie/MovieGrid";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonGrid } from "@/components/features/movie/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search as SearchIcon, Film, Tv, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

type SearchCategory = "all" | "movies" | "series" | "anime";

export default function Search() {
    const { t, language } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Get state from URL params
    const query = searchParams.get("q") || "";
    const currentPage = parseInt(searchParams.get("page") || "1");
    const activeCategory = (searchParams.get("category") as SearchCategory) || "all";
    
    // Local state for the search input to keep typing fast (Low INP)
    const [localQuery, setLocalQuery] = useState(query);

    // Debounce query update to URL (Low INP)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localQuery !== query) {
                setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    if (localQuery) {
                        next.set("q", localQuery);
                    } else {
                        next.delete("q");
                    }
                    next.set("page", "1");
                    if (activeCategory) next.set("category", activeCategory);
                    return next;
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localQuery, activeCategory, setSearchParams, query]);

    // Update local state when URL changes
    useEffect(() => {
        setLocalQuery(query);
    }, [query]);

    // Search Movies & Series (TMDB)
    const {
        data: movieData,
        isLoading: loadingMovies,
        error: errorMovies,
    } = useQuery({
        queryKey: ["searchMovies", query, currentPage, language],
        queryFn: () => movieAPI.searchMovies(query, currentPage),
        enabled: !!query,
        retry: 1, // Don't retry indefinitely
    });

    // Search Anime (Sanka/Otakudesu/Jikan)
    const {
        data: animeList,
        isLoading: loadingAnime,
        error: errorAnime,
    } = useQuery({
        queryKey: ["searchAnime", query, language],
        // Anime search is typically unified (no pagination in simple search endpoint or handled differently)
        queryFn: () => movieAPI.searchAnime(query), 
        enabled: !!query,
        retry: 1,
    });

    // Combined Loading & Error States
    const isLoading = loadingMovies || loadingAnime;
    const error = errorMovies || errorAnime;

    // Separate data
    const movies =
        movieData?.data?.filter((item) => item.type === "movie") || [];
    const series =
        movieData?.data?.filter((item) => item.type === "series") || [];
    const animes = animeList || [];

    // Calculate totals
    const totalMovies = movies.length;
    const totalSeries = series.length;
    const totalAnime = animes.length;
    const totalAll = totalMovies + totalSeries + totalAnime;

    // Get display data based on active category
    const getDisplayData = () => {
        switch (activeCategory) {
            case "movies":
                return {
                    data: movies,
                    total: totalMovies,
                    totalPages: movieData?.totalPages || 1,
                };
            case "series":
                return {
                    data: series,
                    total: totalSeries,
                    totalPages: movieData?.totalPages || 1,
                };
            case "anime":
                return {
                    data: animes,
                    total: totalAnime,
                    totalPages: 1, // Anime search API currently returns flat list
                };
            default: // "all"
                return {
                    data: [...movies, ...series, ...animes],
                    total: totalAll,
                    totalPages: movieData?.totalPages || 1,
                };
        }
    };

    const displayData = getDisplayData();

    const handleCategoryChange = (category: SearchCategory) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set("category", category);
            newParams.set("page", "1"); // Reset to page 1 on category change
            if (query) newParams.set("q", query); // Preserve query
            return newParams;
        });
    };

    const handlePageChange = (page: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set("page", String(page));
            if (activeCategory) newParams.set("category", activeCategory); // Preserve category
            if (query) newParams.set("q", query); // Preserve query
            return newParams;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!query) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <SearchIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">
                        {t('search')}
                    </h2>
                    <p className="text-muted-foreground">
                        {t('minCharSearch')}
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-8 w-64 bg-muted animate-pulse rounded mb-4" />
                    <div className="flex gap-2 mb-6">
                        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                    </div>
                </div>
                <SkeletonGrid />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {t('failedToLoadContent')}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 space-y-6">
                {/* Title */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {t('searchResultsFor')} "{query}"
                    </h1>
                    <p className="text-muted-foreground">
                        {t('resultsFound').replace('{count}', String(displayData.total))}
                        {activeCategory === "all" && totalAll > 0 && (
                            <span className="ml-2 text-sm hidden sm:inline">
                                ({totalMovies} {t('movies')}, {totalSeries} {t('series')}, {totalAnime} {t('anime')})
                            </span>
                        )}
                    </p>
                </div>

                {/* Category Filter Buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={activeCategory === "all" ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleCategoryChange("all")}
                        className="gap-2 transition-all"
                    >
                        <SearchIcon className="h-4 w-4" />
                        {t('all')}
                        <Badge
                            variant={activeCategory === "all" ? "secondary" : "outline"}
                            className="ml-1"
                        >
                            {totalAll}
                        </Badge>
                    </Button>

                    <Button
                        variant={activeCategory === "movies" ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleCategoryChange("movies")}
                        className="gap-2 transition-all"
                    >
                        <Film className="h-4 w-4" />
                        {t('movies')}
                        <Badge
                            variant={activeCategory === "movies" ? "secondary" : "outline"}
                            className="ml-1"
                        >
                            {totalMovies}
                        </Badge>
                    </Button>

                    <Button
                        variant={activeCategory === "series" ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleCategoryChange("series")}
                        className="gap-2 transition-all"
                    >
                        <Tv className="h-4 w-4" />
                        {t('series')}
                        <Badge
                            variant={activeCategory === "series" ? "secondary" : "outline"}
                            className="ml-1"
                        >
                            {totalSeries}
                        </Badge>
                    </Button>

                    <Button
                        variant={activeCategory === "anime" ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleCategoryChange("anime")}
                        className="gap-2 transition-all"
                    >
                        <Clapperboard className="h-4 w-4" />
                        {t('anime')}
                        <Badge
                            variant={activeCategory === "anime" ? "secondary" : "outline"}
                            className="ml-1"
                        >
                            {totalAnime}
                        </Badge>
                    </Button>
                </div>
            </div>

            {/* Results */}
            {displayData.total > 0 ? (
                <>
                    {/* Show category sections when "All" is selected */}
                    {activeCategory === "all" ? (
                        <div className="space-y-12">
                            {/* Movies Section */}
                            {movies.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Film className="h-5 w-5 text-primary" />
                                        <h2 className="text-2xl font-bold">
                                            {t('movies')}
                                        </h2>
                                        <Badge variant="secondary">
                                            {totalMovies}
                                        </Badge>
                                    </div>
                                    <MovieGrid movies={movies} />
                                </div>
                            )}

                            {/* Series Section */}
                            {series.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Tv className="h-5 w-5 text-primary" />
                                        <h2 className="text-2xl font-bold">
                                            {t('series')}
                                        </h2>
                                        <Badge variant="secondary">
                                            {totalSeries}
                                        </Badge>
                                    </div>
                                    <MovieGrid movies={series} />
                                </div>
                            )}

                            {/* Anime Section */}
                             {animes.length > 0 && (
                                <div className="space-y-4" id="anime-section">
                                    <div className="flex items-center gap-2">
                                        <Clapperboard className="h-5 w-5 text-primary" />
                                        <h2 className="text-2xl font-bold">
                                            {t('anime')}
                                        </h2>
                                        <Badge variant="secondary">
                                            {totalAnime}
                                        </Badge>
                                    </div>
                                    <MovieGrid movies={animes} />
                                </div>
                            )}
                        </div>
                    ) : (
                        // Show filtered results
                        <MovieGrid movies={displayData.data} />
                    )}

                    {/* Pagination (Only for Movies/Series or All if it has pages) */}
                    {/* Anime search often doesn't have standard pagination in this basic search context */}
                    {activeCategory !== 'anime' && movieData && movieData.totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={movieData.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                        {t('noResultsFound')}
                    </h2>
                    <p className="text-muted-foreground">
                        {activeCategory === "all"
                            ? `${t('noResultsFor')} "${query}"`
                            : t('noCategoryFound')
                                  .replace('{category}', activeCategory)
                                  .replace('{query}', query) + ` "${query}"`}
                    </p>
                    {activeCategory !== "all" && (
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleCategoryChange("all")}
                        >
                            {t('viewAllCategories')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
