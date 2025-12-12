import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { MovieGrid } from "@/components/features/movie/MovieGrid";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonGrid } from "@/components/features/movie/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search as SearchIcon, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

type SearchCategory = "all" | "movies" | "series";

export default function Search() {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Get state from URL params
    const query = searchParams.get("q") || "";
    const currentPage = parseInt(searchParams.get("page") || "1");
    const activeCategory = (searchParams.get("category") as SearchCategory) || "all";

    // Search Movies & Series (TMDB only - anime removed from general search)
    const {
        data: movieData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["searchMovies", query, currentPage],
        queryFn: () => movieAPI.searchMovies(query, currentPage),
        enabled: !!query,
    });

    // Separate movies and series from TMDB data
    const movies =
        movieData?.data?.filter((item) => item.type === "movie") || [];
    const series =
        movieData?.data?.filter((item) => item.type === "series") || [];

    // Calculate totals
    const totalMovies = movies.length;
    const totalSeries = series.length;
    const totalAll = totalMovies + totalSeries;

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
            default: // "all"
                return {
                    data: [...movies, ...series],
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
                        Search for Movies & Series
                    </h2>
                    <p className="text-muted-foreground">
                        Use the search bar above to find your favorite content.
                        For anime, use the Anime page search.
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
                        Failed to search. Please try again.
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
                            <span className="ml-2 text-sm">
                                ({totalMovies} {t('movies').toLowerCase()} • {totalSeries} {t('series').toLowerCase()})
                            </span>
                        )}
                    </p>
                </div>

                {/* Category Filter Buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={
                            activeCategory === "all" ? "default" : "outline"
                        }
                        size="lg"
                        onClick={() => handleCategoryChange("all")}
                        className="gap-2 transition-all"
                    >
                        <SearchIcon className="h-4 w-4" />
                        {t('all')}
                        <Badge
                            variant={
                                activeCategory === "all"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="ml-1"
                        >
                            {totalAll}
                        </Badge>
                    </Button>

                    <Button
                        variant={
                            activeCategory === "movies" ? "default" : "outline"
                        }
                        size="lg"
                        onClick={() => handleCategoryChange("movies")}
                        className="gap-2 transition-all"
                    >
                        <Film className="h-4 w-4" />
                        {t('movies')}
                        <Badge
                            variant={
                                activeCategory === "movies"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="ml-1"
                        >
                            {totalMovies}
                        </Badge>
                    </Button>

                    <Button
                        variant={
                            activeCategory === "series" ? "default" : "outline"
                        }
                        size="lg"
                        onClick={() => handleCategoryChange("series")}
                        className="gap-2 transition-all"
                    >
                        <Tv className="h-4 w-4" />
                        {t('series')}
                        <Badge
                            variant={
                                activeCategory === "series"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="ml-1"
                        >
                            {totalSeries}
                        </Badge>
                    </Button>
                </div>
            </div>

            {/* Results */}
            {displayData.data.length > 0 ? (
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
                                            Movies
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
                                            Series
                                        </h2>
                                        <Badge variant="secondary">
                                            {totalSeries}
                                        </Badge>
                                    </div>
                                    <MovieGrid movies={series} />
                                </div>
                            )}
                        </div>
                    ) : (
                        // Show filtered results
                        <MovieGrid movies={displayData.data} />
                    )}

                    {/* Pagination */}
                    {movieData && movieData.totalPages > 1 && (
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
