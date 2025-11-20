// c:\Users\rianf\OneDrive\Documents\belajar ngoding\movie\cinestream-hub\src\pages\BrowseCategory.tsx
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI, PaginatedResponse, Movie } from "@/services/api";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

export default function BrowseCategory() {
    const { category } = useParams<{ category: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);

    const animeType =
        (searchParams.get("type") as "all" | "tv" | "movie") || "all";
    const animeAudio =
        (searchParams.get("audio") as "all" | "sub" | "dub") || "all";

    const title = useMemo(() => {
        switch (category) {
            case "latest-movies":
                return "Latest Movies";
            case "popular-movies":
                return "Popular Movies";
            case "latest-series":
                return "Latest Series";
            case "anime":
                return "Anime";
            case "indonesian-movies":
                return "Indonesian Movies";
            case "korean-drama":
                return "Korean Drama";
            case "adult-movies":
                return "Romance";
            default:
                return "Browse";
        }
    }, [category]);

    const { data, isLoading, error } = useQuery<PaginatedResponse<Movie>>({
        queryKey: ["browse", category, currentPage, animeType, animeAudio],
        queryFn: async () => {
            switch (category) {
                case "latest-movies":
                    return movieAPI.getLatestMovies(currentPage);
                case "popular-movies":
                    return movieAPI.getPopularMovies(currentPage);
                case "latest-series":
                    return movieAPI.getLatestSeries(currentPage);
                case "anime":
                    return movieAPI.getAnime(currentPage, {
                        type: animeType,
                        audio: animeAudio,
                    });
                case "indonesian-movies":
                    return movieAPI.getIndonesianMovies(currentPage);
                case "korean-drama":
                    return movieAPI.getKoreanDrama(currentPage);
                case "adult-movies":
                    return movieAPI.getAdultMovies(currentPage);
                default:
                    return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
        },
        enabled: !!category,
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-8 w-64 bg-muted animate-pulse rounded" />
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
                        Failed to load data. Please try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {title}
                    </h1>
                    <p className="text-muted-foreground">
                        {data?.totalItems || 0} item
                        {(data?.totalItems || 0) !== 1 ? "s" : ""} found
                    </p>
                </div>
                <Link to="/">
                    <Button variant="ghost">Back to Home</Button>
                </Link>
            </div>

            {category === "anime" && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Filter:
                    </span>
                    <Button
                        variant={animeType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                            setSearchParams({ type: "all", audio: animeAudio })
                        }
                    >
                        Semua
                    </Button>
                    <Button
                        variant={animeType === "tv" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                            setSearchParams({ type: "tv", audio: animeAudio })
                        }
                    >
                        TV Series
                    </Button>
                    <Button
                        variant={animeType === "movie" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                            setSearchParams({
                                type: "movie",
                                audio: animeAudio,
                            })
                        }
                    >
                        Movie
                    </Button>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <Button
                        variant={animeAudio === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                            setSearchParams({ type: animeType, audio: "all" })
                        }
                    >
                        All
                    </Button>
                    <Button
                        variant={animeAudio === "sub" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                            setSearchParams({ type: animeType, audio: "sub" })
                        }
                    >
                        Sub
                    </Button>
                    <Button
                        variant={animeAudio === "dub" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                            setSearchParams({ type: animeType, audio: "dub" })
                        }
                    >
                        Dub
                    </Button>
                </div>
            )}

            {data?.data && data.data.length > 0 ? (
                <>
                    <MovieGrid movies={data.data} />
                    {data.totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No data found for this category.
                    </p>
                </div>
            )}
        </div>
    );
}
