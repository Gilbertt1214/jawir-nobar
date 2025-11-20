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
import { useState, useMemo } from "react";

export default function BrowseCategory() {
    const { category } = useParams<{ category: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);

    const animeType =
        (searchParams.get("type") as "all" | "tv" | "movie") || "all";
    const animeAudio =
        (searchParams.get("audio") as "all" | "sub" | "dub") || "all";

    const categoryInfo = useMemo(() => {
        switch (category) {
            case "latest-movies":
                return {
                    title: "Latest Movies",
                    icon: Sparkles,
                    description:
                        "Discover the newest movies just added to our collection",
                };
            case "popular-movies":
                return {
                    title: "Popular Movies",
                    icon: TrendingUp,
                    description:
                        "Trending movies everyone is watching right now",
                };
            case "latest-series":
                return {
                    title: "Latest Series",
                    icon: Tv,
                    description: "Fresh TV series and shows for binge-watching",
                };
            case "anime":
                return {
                    title: "Anime",
                    icon: Sparkles,
                    description: "Your gateway to the best anime content",
                };
            case "indonesian-movies":
                return {
                    title: "Indonesian Movies",
                    icon: Globe,
                    description: "Explore the best of Indonesian cinema",
                };
            case "korean-drama":
                return {
                    title: "Korean Drama",
                    icon: Heart,
                    description:
                        "Immerse yourself in captivating K-Drama stories",
                };
            case "adult-movies":
                return {
                    title: "Romance",
                    icon: Heart,
                    description: "Passionate stories and romantic adventures",
                };
            default:
                return {
                    title: "Browse",
                    icon: Search,
                    description: "Explore our collection",
                };
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

    const IconComponent = categoryInfo.icon;

    if (isLoading) {
        return (
            <div className="min-h-screen">
                {/* Hero Skeleton */}
                <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-accent/20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="container mx-auto px-4 -mt-24">
                    <div className="mb-8 space-y-4">
                        <div className="h-12 w-96 bg-muted animate-pulse rounded-lg" />
                        <div className="h-6 w-64 bg-muted animate-pulse rounded" />
                    </div>
                    <SkeletonGrid />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive" className="shadow-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load data. Please try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Header Section */}
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 overflow-hidden">
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
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Link to="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 hover:gap-3 transition-all -ml-2 mb-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 shadow-lg">
                                <IconComponent className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                    {categoryInfo.title}
                                </h1>
                                <p className="text-muted-foreground text-sm md:text-base mt-1">
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/60 backdrop-blur-sm shadow-sm">
                                <Film className="w-4 h-4 text-primary" />
                                <span className="font-semibold">
                                    {data?.totalItems || 0}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {(data?.totalItems || 0) !== 1
                                        ? "items"
                                        : "item"}{" "}
                                    found
                                </span>
                            </div>
                            {data?.totalPages && data.totalPages > 1 && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/60 backdrop-blur-sm shadow-sm">
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
                                        {data.totalPages}
                                    </span>
                                </div>
                            )}
                        </div>

                        {category === "anime" && (
                            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm">
                                <span className="text-xs font-medium text-muted-foreground px-2">
                                    TYPE
                                </span>
                                <Button
                                    variant={
                                        animeType === "all"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className="transition-all hover:scale-105"
                                    onClick={() =>
                                        setSearchParams({
                                            type: "all",
                                            audio: animeAudio,
                                        })
                                    }
                                >
                                    All
                                </Button>
                                <Button
                                    variant={
                                        animeType === "tv" ? "default" : "ghost"
                                    }
                                    size="sm"
                                    className="transition-all hover:scale-105"
                                    onClick={() =>
                                        setSearchParams({
                                            type: "tv",
                                            audio: animeAudio,
                                        })
                                    }
                                >
                                    EPISODE
                                </Button>
                                <Button
                                    variant={
                                        animeType === "movie"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className="transition-all hover:scale-105"
                                    onClick={() =>
                                        setSearchParams({
                                            type: "movie",
                                            audio: animeAudio,
                                        })
                                    }
                                >
                                    Movie
                                </Button>

                                <div className="w-px h-6 bg-border mx-1" />

                                <span className="text-xs font-medium text-muted-foreground px-2">
                                    AUDIO
                                </span>
                                <Button
                                    variant={
                                        animeAudio === "all"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className="transition-all hover:scale-105"
                                    onClick={() =>
                                        setSearchParams({
                                            type: animeType,
                                            audio: "all",
                                        })
                                    }
                                >
                                    All
                                </Button>
                                <Button
                                    variant={
                                        animeAudio === "sub"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className="transition-all hover:scale-105"
                                    onClick={() =>
                                        setSearchParams({
                                            type: animeType,
                                            audio: "sub",
                                        })
                                    }
                                >
                                    Sub
                                </Button>
                                <Button
                                    variant={
                                        animeAudio === "dub"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className="transition-all hover:scale-105"
                                    onClick={() =>
                                        setSearchParams({
                                            type: animeType,
                                            audio: "dub",
                                        })
                                    }
                                >
                                    Dub
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                {data?.data && data.data.length > 0 ? (
                    <div className="space-y-8">
                        <MovieGrid movies={data.data} />

                        {data.totalPages > 1 && (
                            <div className="flex justify-center">
                                <div className="inline-flex p-2 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={data.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50">
                            <div className="p-4 rounded-full bg-muted">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-semibold">
                                    No Content Found
                                </p>
                                <p className="text-muted-foreground text-sm max-w-md">
                                    We couldn't find any content in this
                                    category. Try adjusting your filters or
                                    check back later.
                                </p>
                            </div>
                            <Link to="/">
                                <Button
                                    variant="outline"
                                    className="gap-2 mt-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Browse Other Categories
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
