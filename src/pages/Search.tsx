import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search as SearchIcon, Film, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [currentPage, setCurrentPage] = useState(1);
    const [searchType, setSearchType] = useState<"all" | "movies" | "hentai">(
        "all"
    );

    // Search untuk Movies & Series (TMDB)
    const {
        data: movieData,
        isLoading: movieLoading,
        error: movieError,
    } = useQuery({
        queryKey: ["search", query, currentPage, "movies"],
        queryFn: () => movieAPI.searchMovies(query, currentPage),
        enabled: !!query && searchType !== "hentai",
    });

    // Search untuk Hentai (Nekopoi)
    const {
        data: hentaiData,
        isLoading: hentaiLoading,
        error: hentaiError,
    } = useQuery({
        queryKey: ["searchHentai", query],
        queryFn: () => movieAPI.searchNekopoi(query),
        enabled: !!query && searchType !== "movies",
    });

    const isLoading = movieLoading || hentaiLoading;
    const error = movieError || hentaiError;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearchTypeChange = (type: "all" | "movies" | "hentai") => {
        setSearchType(type);
        setCurrentPage(1);
    };

    // Filter data berdasarkan search type
    const getDisplayData = () => {
        if (searchType === "movies") {
            return {
                type: "movies" as const,
                data: movieData?.data || [],
                totalItems: movieData?.totalItems || 0,
                totalPages: movieData?.totalPages || 1,
            };
        } else if (searchType === "hentai") {
            return {
                type: "hentai" as const,
                data: hentaiData || [],
                totalItems: hentaiData?.length || 0,
                totalPages: 1,
            };
        } else {
            // All - gabungkan data
            const movies = movieData?.data || [];
            const hentai = hentaiData || [];
            return {
                type: "all" as const,
                data: [...movies, ...hentai],
                totalItems:
                    (movieData?.totalItems || 0) + (hentaiData?.length || 0),
                totalPages: movieData?.totalPages || 1,
            };
        }
    };

    const displayData = getDisplayData();

    if (!query) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <SearchIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">
                        Search for Movies & Series
                    </h2>
                    <p className="text-muted-foreground">
                        Use the search bar above to find your favorite content
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
                        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
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
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Search Results for "{query}"
                </h1>

                {/* Search Type Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                        variant={searchType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSearchTypeChange("all")}
                    >
                        <SearchIcon className="h-4 w-4 mr-2" />
                        All ({displayData.totalItems})
                    </Button>
                    <Button
                        variant={
                            searchType === "movies" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleSearchTypeChange("movies")}
                    >
                        <Film className="h-4 w-4 mr-2" />
                        Movies & Series ({movieData?.totalItems || 0})
                    </Button>
                    
                </div>

                <p className="text-muted-foreground">
                    {displayData.totalItems} result
                    {displayData.totalItems !== 1 ? "s" : ""} found
                    {searchType === "all" && (
                        <span className="ml-2">
                            ({movieData?.totalItems || 0} movies/series •{" "}
                            {hentaiData?.length || 0} hentai)
                        </span>
                    )}
                </p>
            </div>

            {displayData.data.length > 0 ? (
                <>
                    {/* Tampilkan Movies & Series dengan MovieGrid */}
                    {(searchType === "all" || searchType === "movies") &&
                        movieData?.data &&
                        movieData.data.length > 0 && (
                            <>
                                {searchType === "all" && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                            <Film className="h-5 w-5" />
                                            Movies & Series (
                                            {movieData.totalItems})
                                        </h2>
                                    </div>
                                )}
                                <MovieGrid movies={movieData.data} />
                            </>
                        )}

                    {/* Tampilkan Hentai dengan custom grid */}
                    {(searchType === "all" || searchType === "hentai") &&
                        hentaiData &&
                        hentaiData.length > 0 && (
                            <>
                                {searchType === "all" && (
                                    <div className="mb-6 mt-8">
                                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                            <Heart className="h-5 w-5" />
                                            Hentai ({hentaiData.length})
                                        </h2>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {hentaiData.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={`/hentai/nekopoi/${item.id}`}
                                            className="group"
                                        >
                                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                                <div className="relative aspect-[2/3] overflow-hidden">
                                                    <img
                                                        src={item.cover}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "/placeholder.svg";
                                                        }}
                                                    />
                                                    <div className="absolute top-2 right-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs backdrop-blur-sm bg-black/50 text-white border-none"
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <CardContent className="p-3">
                                                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.genre
                                                            .slice(0, 2)
                                                            .map((g, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="outline"
                                                                    className="text-xs px-1 py-0"
                                                                >
                                                                    {g}
                                                                </Badge>
                                                            ))}
                                                        {item.genre.length >
                                                            2 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs px-1 py-0"
                                                            >
                                                                +
                                                                {item.genre
                                                                    .length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                    {/* Pagination hanya untuk movies (karena hentai tidak support pagination) */}
                    {searchType !== "hentai" &&
                        movieData &&
                        movieData.totalPages > 1 && (
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
                        No Results Found
                    </h2>
                    <p className="text-muted-foreground">
                        {searchType === "all"
                            ? "Try searching with different keywords"
                            : `No ${searchType} found for "${query}"`}
                    </p>
                </div>
            )}
        </div>
    );
}
        <AlertDescription>
                    This search feature is powered by TMDB for 
                </AlertDescription>