// c:\Users\rianf\OneDrive\Documents\belajar ngoding\movie\cinestream-hub\src\pages\BrowseCategory.tsx
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI, PaginatedResponse, Movie } from "@/services/api";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertCircle,
    ArrowLeft,
    Film,
    Sparkles,
    TrendingUp,
    Tv,
    Globe,
    Heart,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";

export default function BrowseCategory() {
    const { category } = useParams<{ category: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);

    const animeType = searchParams.get("type") || "all";
    const animeAudio = searchParams.get("audio") || "all";

    // Reset to page 1 when category or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [category, animeType, animeAudio]);

    const categoryInfo = useMemo(() => {
        switch (category) {
            case "latest-movies":
                return {
                    title: "Latest Movies",
                    icon: Sparkles,
                    description:
                        "Discover the newest movies just added to our collection",
                    apiCall: () => movieAPI.getLatestMovies(currentPage),
                };
            case "popular-movies":
                return {
                    title: "Popular Movies",
                    icon: TrendingUp,
                    description:
                        "Trending movies everyone is watching right now",
                    apiCall: () => movieAPI.getPopularMovies(currentPage),
                };
            case "latest-series":
                return {
                    title: "Latest Series",
                    icon: Tv,
                    description: "Fresh TV series and shows for binge-watching",
                    apiCall: () => movieAPI.getLatestSeries(currentPage),
                };
            case "anime":
                return {
                    title: "Anime",
                    icon: Sparkles,
                    description: "Your gateway to the best anime content",
                    apiCall: () =>
                        movieAPI.getAnime(currentPage, {
                            type: animeType as "all" | "tv" | "movie",
                            audio: animeAudio as "all" | "sub" | "dub",
                        }),
                };
            case "indonesian-movies":
                return {
                    title: "Indonesian Movies",
                    icon: Globe,
                    description: "Explore the best of Indonesian cinema",
                    apiCall: () => movieAPI.getIndonesianMovies(currentPage),
                };
            case "korean-drama":
                return {
                    title: "Korean Drama",
                    icon: Heart,
                    description:
                        "Immerse yourself in captivating K-Drama stories",
                    apiCall: () => movieAPI.getKoreanDrama(currentPage),
                };
            case "adult-movies":
                return {
                    title: "Romance",
                    icon: Heart,
                    description: "Passionate stories and romantic adventures",
                    apiCall: () => movieAPI.getAdultMovies(currentPage),
                };
            default:
                return {
                    title: "Browse",
                    icon: Search,
                    description: "Explore our collection",
                    apiCall: () =>
                        Promise.resolve({
                            data: [],
                            page: 1,
                            totalPages: 1,
                            totalItems: 0,
                        }),
                };
        }
    }, [category, currentPage, animeType, animeAudio]);

    const { data, isLoading, error, isFetching } = useQuery<
        PaginatedResponse<Movie>
    >({
        queryKey: ["browse", category, currentPage, animeType, animeAudio],
        queryFn: categoryInfo.apiCall,
        enabled: !!category,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFilterChange = (updates: { type?: string; audio?: string }) => {
        const newParams = new URLSearchParams(searchParams);

        if (updates.type !== undefined) {
            if (updates.type === "all") {
                newParams.delete("type");
            } else {
                newParams.set("type", updates.type);
            }
        }

        if (updates.audio !== undefined) {
            if (updates.audio === "all") {
                newParams.delete("audio");
            } else {
                newParams.set("audio", updates.audio);
            }
        }

        setSearchParams(newParams);
    };

    const IconComponent = categoryInfo.icon;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="destructive" className="shadow-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Failed to load {categoryInfo.title.toLowerCase()}.
                            Please try again.
                        </AlertDescription>
                    </Alert>
                    <div className="text-center mt-6">
                        <Link to="/">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header Section */}
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 overflow-hidden border-b">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
                    <div
                        className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                        <Link to="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 hover:gap-3 transition-all -ml-2 mb-2 hover:bg-primary/10"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </Link>

                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="p-3 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 shadow-lg">
                                <IconComponent className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight truncate">
                                    {categoryInfo.title}
                                </h1>
                                <p className="text-muted-foreground text-sm md:text-base mt-1 line-clamp-2">
                                    {categoryInfo.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats and Filters Section */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 backdrop-blur-sm border">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/60 backdrop-blur-sm shadow-sm border">
                                <Film className="w-4 h-4 text-primary" />
                                <span className="font-semibold">
                                    {(
                                        data as PaginatedResponse<Movie>
                                    )?.totalItems?.toLocaleString() || 0}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {((data as PaginatedResponse<Movie>)
                                        ?.totalItems || 0) !== 1
                                        ? "items"
                                        : "item"}{" "}
                                    found
                                </span>
                            </div>
                            {(data as PaginatedResponse<Movie>)?.totalPages &&
                                (data as PaginatedResponse<Movie>).totalPages >
                                    1 && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/60 backdrop-blur-sm shadow-sm border">
                                        <span className="text-sm text-muted-foreground">
                                            Page
                                        </span>
                                        <span className="font-semibold">
                                            {currentPage}
                                        </span>
                                        <span className="text-muted-foreground">
                                            /
                                        </span>
                                        <span className="font-semibold">
                                            {
                                                (
                                                    data as PaginatedResponse<Movie>
                                                ).totalPages
                                            }
                                        </span>
                                    </div>
                                )}
                            {(isLoading || isFetching) && (
                                <div className="px-4 py-2 rounded-lg bg-background/60 backdrop-blur-sm shadow-sm border">
                                    <span className="text-sm text-muted-foreground animate-pulse">
                                        Loading...
                                    </span>
                                </div>
                            )}
                        </div>

                        {category === "anime" && (
                            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border">
                                <span className="text-xs font-medium text-muted-foreground px-2">
                                    TYPE
                                </span>
                                {(["all", "tv", "movie"] as const).map(
                                    (type) => (
                                        <Button
                                            key={type}
                                            variant={
                                                animeType === type
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="transition-all hover:scale-105 capitalize"
                                            onClick={() =>
                                                handleFilterChange({ type })
                                            }
                                            disabled={isFetching}
                                        >
                                            {type === "all"
                                                ? "All"
                                                : type === "tv"
                                                ? "Series"
                                                : "Movie"}
                                        </Button>
                                    )
                                )}

                                <div className="w-px h-6 bg-border mx-1" />

                                <span className="text-xs font-medium text-muted-foreground px-2">
                                    AUDIO
                                </span>
                                {(["all", "sub", "dub"] as const).map(
                                    (audio) => (
                                        <Button
                                            key={audio}
                                            variant={
                                                animeAudio === audio
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="transition-all hover:scale-105 capitalize"
                                            onClick={() =>
                                                handleFilterChange({ audio })
                                            }
                                            disabled={isFetching}
                                        >
                                            {audio === "all"
                                                ? "All"
                                                : audio === "sub"
                                                ? "Sub"
                                                : "Dub"}
                                        </Button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                {(isLoading || isFetching) && !data ? (
                    <SkeletonGrid />
                ) : (data as PaginatedResponse<Movie>)?.data &&
                  (data as PaginatedResponse<Movie>).data.length > 0 ? (
                    <div className="space-y-8">
                        <MovieGrid
                            movies={(data as PaginatedResponse<Movie>).data}
                        />

                        {(data as PaginatedResponse<Movie>).totalPages > 1 && (
                            <div className="flex justify-center">
                                <div className="inline-flex p-2 rounded-xl bg-muted/30 backdrop-blur-sm border">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={
                                            (data as PaginatedResponse<Movie>)
                                                .totalPages
                                        }
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border max-w-md">
                            <div className="p-4 rounded-full bg-muted">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-semibold">
                                    No Content Found
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {category === "anime"
                                        ? "Try adjusting your filters or check back later for new anime content."
                                        : "We couldn't find any content in this category. Check back later for new additions."}
                                </p>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <Link to="/">
                                    <Button variant="outline" className="gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Browse Other Categories
                                    </Button>
                                </Link>
                                {category === "anime" && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setSearchParams({});
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Reset Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
