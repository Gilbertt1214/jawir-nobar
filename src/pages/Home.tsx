import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { MovieCarousel } from "@/components/MovieCarousel";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertCircle,
    Info,
    Play,
    Star,
    TrendingUp,
    Sparkles,
    Film,
    Tv,
    Globe,
    Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
    // Query states
    const [pageLatest, setPageLatest] = useState(1);
    const [pagePopular, setPagePopular] = useState(1);
    const [pageSeries, setPageSeries] = useState(1);
    const [pageAnime, setPageAnime] = useState(1);
    const [pageIndo, setPageIndo] = useState(1);
    const [pageKdrama, setPageKdrama] = useState(1);

    // Anime filters
    const [animeType, setAnimeType] = useState<"all" | "tv" | "movie">("all");
    const [animeAudio, setAnimeAudio] = useState<"all" | "sub" | "dub">("all");

    // Data queries
    const {
        data: latestMovies,
        isLoading: loadingLatest,
        error: errorLatest,
    } = useQuery({
        queryKey: ["latest-movies", pageLatest],
        queryFn: () => movieAPI.getLatestMovies(pageLatest),
    });

    const {
        data: popularMovies,
        isLoading: loadingPopular,
        error: errorPopular,
    } = useQuery({
        queryKey: ["popular-movies", pagePopular],
        queryFn: () => movieAPI.getPopularMovies(pagePopular),
    });

    const {
        data: latestSeries,
        isLoading: loadingSeries,
        error: errorSeries,
    } = useQuery({
        queryKey: ["latest-series", pageSeries],
        queryFn: () => movieAPI.getLatestSeries(pageSeries),
    });

    const {
        data: anime,
        isLoading: loadingAnime,
        error: errorAnime,
    } = useQuery({
        queryKey: ["anime", pageAnime, animeType, animeAudio],
        queryFn: () =>
            movieAPI.getAnime(pageAnime, {
                type: animeType,
                audio: animeAudio,
            }),
    });

    const {
        data: indo,
        isLoading: loadingIndo,
        error: errorIndo,
    } = useQuery({
        queryKey: ["indo-movies", pageIndo],
        queryFn: () => movieAPI.getIndonesianMovies(pageIndo),
    });

    const {
        data: kdrama,
        isLoading: loadingKDrama,
        error: errorKDrama,
    } = useQuery({
        queryKey: ["korean-drama", pageKdrama],
        queryFn: () => movieAPI.getKoreanDrama(pageKdrama),
    });

    const {
        data: adult,
        isLoading: loadingAdult,
        error: errorAdult,
    } = useQuery({
        queryKey: ["adult-movies", 1],
        queryFn: () => movieAPI.getAdultMovies(1),
    });

    // Local state for accumulated data
    const [listLatest, setListLatest] = useState<any[]>([]);
    const [listPopular, setListPopular] = useState<any[]>([]);
    const [listSeries, setListSeries] = useState<any[]>([]);
    const [listAnime, setListAnime] = useState<any[]>([]);
    const [listIndo, setListIndo] = useState<any[]>([]);
    const [listKdrama, setListKdrama] = useState<any[]>([]);

    // Hero carousel state
    const heroList = listLatest.length
        ? listLatest.slice(0, 5)
        : listPopular.length
        ? listPopular.slice(0, 5)
        : [];
    const [heroIndex, setHeroIndex] = useState(0);
    const heroItem = heroList[heroIndex];

    // Hero auto-scroll effect
    useEffect(() => {
        if (!heroList.length) return;
        const interval = setInterval(() => {
            setHeroIndex((i) => (i + 1) % heroList.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroList.length]);

    // Data accumulation effects
    useEffect(() => {
        if (latestMovies?.data) {
            setListLatest((prev) => {
                const map = new Map(prev.map((m: any) => [m.id, m]));
                latestMovies.data.forEach((x) => map.set(x.id, x));
                return Array.from(map.values());
            });
        }
    }, [latestMovies]);

    useEffect(() => {
        if (popularMovies?.data) {
            setListPopular((prev) => {
                const map = new Map(prev.map((m: any) => [m.id, m]));
                popularMovies.data.forEach((x) => map.set(x.id, x));
                return Array.from(map.values());
            });
        }
    }, [popularMovies]);

    useEffect(() => {
        if (latestSeries?.data) {
            setListSeries((prev) => {
                const map = new Map(prev.map((m: any) => [m.id, m]));
                latestSeries.data.forEach((x) => map.set(x.id, x));
                return Array.from(map.values());
            });
        }
    }, [latestSeries]);

    useEffect(() => {
        if (anime?.data) {
            setListAnime((prev) => {
                const map = new Map(prev.map((m: any) => [m.id, m]));
                anime.data.forEach((x) => map.set(x.id, x));
                return Array.from(map.values());
            });
        }
    }, [anime]);

    useEffect(() => {
        if (indo?.data) {
            setListIndo((prev) => {
                const map = new Map(prev.map((m: any) => [m.id, m]));
                indo.data.forEach((x) => map.set(x.id, x));
                return Array.from(map.values());
            });
        }
    }, [indo]);

    useEffect(() => {
        if (kdrama?.data) {
            setListKdrama((prev) => {
                const map = new Map(prev.map((m: any) => [m.id, m]));
                kdrama.data.forEach((x) => map.set(x.id, x));
                return Array.from(map.values());
            });
        }
    }, [kdrama]);

    // Loading and error states
    const isLoading =
        loadingLatest ||
        loadingPopular ||
        loadingSeries ||
        loadingAnime ||
        loadingIndo ||
        loadingKDrama ||
        loadingAdult;
    const hasError =
        errorLatest ||
        errorPopular ||
        errorSeries ||
        errorAnime ||
        errorIndo ||
        errorKDrama ||
        errorAdult;

    if (isLoading) {
        return (
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
                {/* Hero Skeleton */}
                <div className="relative h-[45vh] sm:h-[55vh] md:h-[65vh] lg:h-[75vh] bg-muted animate-pulse rounded-lg sm:rounded-xl" />

                {/* Content Skeletons */}
                <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="h-6 sm:h-8 w-32 sm:w-48 bg-muted animate-pulse rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="h-6 sm:h-8 w-32 sm:w-48 bg-muted animate-pulse rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        Failed to load movies. Please check your internet
                        connection and try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Section component for cleaner code
    const Section = ({
        title,
        icon,
        movies,
        link,
        children,
    }: {
        title: string;
        icon?: React.ReactNode;
        movies: any[];
        link: string;
        children?: React.ReactNode;
    }) => (
        <section className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-6 sm:h-7 md:h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                        {title}
                    </h2>
                    {icon && (
                        <div className="text-primary text-sm sm:text-base">
                            {icon}
                        </div>
                    )}
                </div>
                {children}
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="self-start sm:self-auto hover:bg-primary/10 transition-all group hover:bg-yellow-500 hover:text-black text-xs sm:text-sm h-8 sm:h-9 px-3"
                >
                    <Link to={link}>
                        <span>See More</span>
                        <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                </Button>
            </div>
            <MovieCarousel title="" movies={movies} />
        </section>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[45vh] sm:h-[55vh] md:h-[65vh] lg:h-[75vh] overflow-hidden">
                {/* Background Images */}
                <div className="absolute inset-0">
                    <div
                        className="flex h-full transition-transform duration-1000 ease-out"
                        style={{
                            transform: `translateX(-${heroIndex * 100}%)`,
                        }}
                    >
                        {heroList.map((item, idx) => (
                            <div
                                key={item.id ?? idx}
                                className="relative min-w-full h-full"
                            >
                                {item.cover ? (
                                    <>
                                        <img
                                            src={item.cover}
                                            className="w-full h-full object-cover"
                                            alt={item.title}
                                            loading={
                                                idx === 0 ? "eager" : "lazy"
                                            }
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative container mx-auto px-3 sm:px-4 h-full flex items-end pb-6 sm:pb-10 md:pb-14">
                    {heroItem && (
                        <div className="space-y-2 sm:space-y-3 md:space-y-5 max-w-full sm:max-w-2xl lg:max-w-3xl">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight line-clamp-2 drop-shadow-lg">
                                {heroItem.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                {heroItem.year && (
                                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-background/80 backdrop-blur-sm text-[10px] sm:text-xs font-medium">
                                        {heroItem.year}
                                    </span>
                                )}
                                {heroItem.rating && (
                                    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-background/80 backdrop-blur-sm">
                                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-primary text-primary" />
                                        <span className="text-[10px] sm:text-xs font-bold">
                                            {heroItem.rating.toFixed
                                                ? heroItem.rating.toFixed(1)
                                                : heroItem.rating}
                                        </span>
                                    </div>
                                )}
                                {heroItem.quality && (
                                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/20 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-primary">
                                        {heroItem.quality}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm md:text-base text-foreground/80 line-clamp-2 sm:line-clamp-3 max-w-xl lg:max-w-2xl hidden sm:block">
                                {heroItem.synopsis ||
                                    "Discover the latest movies and series to watch."}
                            </p>

                            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                                <Button
                                    asChild
                                    size="sm"
                                    className="gap-1.5 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                                >
                                    <Link
                                        to={`/${heroItem.type}/${heroItem.id}`}
                                    >
                                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>Play</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 backdrop-blur-sm bg-background/60 hover:bg-background/80 shadow-lg transition-all hover:scale-105 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                                >
                                    <Link
                                        to={`/${heroItem.type}/${heroItem.id}`}
                                    >
                                        <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>Info</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hero Indicators */}
                {heroList.length > 1 && (
                    <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                        {heroList.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setHeroIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={cn(
                                    "h-1 sm:h-1.5 rounded-full transition-all duration-300",
                                    idx === heroIndex
                                        ? "bg-primary w-6 sm:w-8"
                                        : "bg-white/40 hover:bg-white/60 w-3 sm:w-4"
                                )}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-8 sm:space-y-12 md:space-y-14">
                {/* Latest Movies */}
                {listLatest.length > 0 && (
                    <Section
                        title="Latest Movies"
                        icon={<Sparkles className="w-5 h-5 animate-pulse" />}
                        movies={listLatest}
                        link="/browse/latest-movies"
                    />
                )}

                {/* Popular Movies */}
                {listPopular.length > 0 && (
                    <Section
                        title="Popular Movies"
                        icon={<TrendingUp className="w-5 h-5" />}
                        movies={listPopular}
                        link="/browse/popular-movies"
                    />
                )}

                {/* Latest Series */}
                {listSeries.length > 0 && (
                    <Section
                        title="Latest Series"
                        icon={<Tv className="w-5 h-5" />}
                        movies={listSeries}
                        link="/browse/latest-series"
                    />
                )}

                {/* Anime Section with Filters */}
                {(listAnime.length > 0 || loadingAnime) && (
                    <section className="space-y-3 sm:space-y-4 md:space-y-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="h-6 sm:h-7 md:h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                                    Anime
                                </h2>
                                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>

                            {/* Filter Buttons */}
                            {/* <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center p-1 rounded-lg bg-muted/50">
                                    {(["all", "tv", "movie"] as const).map(
                                        (type) => (
                                            <Button
                                                key={type}
                                                variant={
                                                    animeType === type
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setAnimeType(type)
                                                }
                                                className="capitalize text-xs sm:text-sm transition-all"
                                            >
                                                {type === "all"
                                                    ? "All"
                                                    : type === "tv"
                                                    ? "TV"
                                                    : "Movie"}
                                            </Button>
                                        )
                                    )}
                                </div>

                                <div className="flex items-center p-1 rounded-lg bg-muted/50">
                                    {(["all", "sub", "dub"] as const).map(
                                        (audio) => (
                                            <Button
                                                key={audio}
                                                variant={
                                                    animeAudio === audio
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setAnimeAudio(audio)
                                                }
                                                className="capitalize text-xs sm:text-sm transition-all"
                                            >
                                                {audio === "all"
                                                    ? "All"
                                                    : audio.toUpperCase()}
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div> */}

                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="self-start lg:self-auto hover:bg-primary/10 transition-all group hover:bg-yellow-500 hover:text-black text-xs sm:text-sm h-8 sm:h-9 px-3"
                            >
                                <Link
                                    to={`/browse/anime?type=${animeType}&audio=${animeAudio}`}
                                >
                                    <span>See More</span>
                                    <svg
                                        className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </Button>
                        </div>

                        {listAnime.length > 0 && (
                            <MovieCarousel title="" movies={listAnime} />
                        )}
                    </section>
                )}

                {/* Indonesian Movies */}
                {listIndo.length > 0 && (
                    <Section
                        title="Indonesian Movies"
                        icon={<Globe className="w-5 h-5" />}
                        movies={listIndo}
                        link="/browse/indonesian-movies"
                    />
                )}

                {/* Korean Drama */}
                {listKdrama.length > 0 && (
                    <Section
                        title="Korean Drama"
                        icon={<Heart className="w-5 h-5" />}
                        movies={listKdrama}
                        link="/browse/korean-drama"
                    />
                )}

                {/* Romance */}
                {adult?.data && adult.data.length > 0 && (
                    <Section
                        title="Romance"
                        icon={<Heart className="w-5 h-5 text-pink-500" />}
                        movies={adult.data}
                        link="/browse/adult-movies"
                    />
                )}
            </main>
        </div>
    );
}
