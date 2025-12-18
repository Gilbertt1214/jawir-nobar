import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { MovieCarousel } from "@/components/features/movie/MovieCarousel";
import { SkeletonGrid } from "@/components/features/movie/SkeletonCard";
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
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StaggeredText } from "@/components/common/StaggeredText";
import { FadeIn } from "@/components/animations/FadeIn";
import { Section } from "@/components/layout/Section";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
    // Anime filters
    const [animeType, setAnimeType] = useState<"all" | "tv" | "movie">("all");
    const [animeAudio, setAnimeAudio] = useState<"all" | "sub" | "dub">("all");
    const { t, language } = useLanguage();

    // Data queries
    const {
        data: latestMovies,
        isLoading: loadingLatest,
        error: errorLatest,
    } = useQuery({
        queryKey: ["latest-movies", 1, language],
        queryFn: () => movieAPI.getLatestMovies(1),
    });

    const {
        data: popularMovies,
        isLoading: loadingPopular,
        error: errorPopular,
    } = useQuery({
        queryKey: ["popular-movies", 1, language],
        queryFn: () => movieAPI.getPopularMovies(1),
    });

    const {
        data: latestSeries,
        isLoading: loadingSeries,
        error: errorSeries,
    } = useQuery({
        queryKey: ["latest-series", 1, language],
        queryFn: () => movieAPI.getLatestSeries(1),
    });

    const {
        data: anime,
        isLoading: loadingAnime,
        error: errorAnime,
    } = useQuery({
        queryKey: ["anime", 1, animeType, animeAudio, language],
        queryFn: () =>
            movieAPI.getAnime(1, {
                type: animeType,
                audio: animeAudio,
            }),
    });

    const {
        data: indo,
        isLoading: loadingIndo,
        error: errorIndo,
    } = useQuery({
        queryKey: ["indo-movies", 1, language],
        queryFn: () => movieAPI.getIndonesianMovies(1),
    });

    const {
        data: kdrama,
        isLoading: loadingKDrama,
        error: errorKDrama,
    } = useQuery({
        queryKey: ["korean-drama", 1, language],
        queryFn: () => movieAPI.getKoreanDrama(1),
    });

    const {
        data: adult,
        isLoading: loadingAdult,
        error: errorAdult,
    } = useQuery({
        queryKey: ["adult-movies", 1, language],
        queryFn: () => movieAPI.getAdultMovies(1),
    });

    // Ongoing Anime Query (Scraper)
    const { data: ongoingAnime, isLoading: loadingOngoing } = useQuery({
        queryKey: ["ongoing-anime", language],
        queryFn: () => movieAPI.getOngoingAnimeList(),
    });

    // Hero carousel state
    const heroList =
        latestMovies?.data?.slice(0, 5) ||
        popularMovies?.data?.slice(0, 5) ||
        [];
    const [heroIndex, setHeroIndex] = useState(0);
    const heroItem = heroList[heroIndex];

    // Hero auto-scroll effect
    useEffect(() => {
        if (!heroList.length) return;
        const interval = setInterval(() => {
            setHeroIndex((i) => (i + 1) % heroList.length);
        }, 8000); // Slower interval for better UX
        return () => clearInterval(interval);
    }, [heroList.length]);

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
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Hero Skeleton */}
                <div className="relative h-[80vh] w-full bg-muted animate-pulse rounded-3xl overflow-hidden" />

                {/* Content Skeletons */}
                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {t('errorLoadMovies')}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section
                className="relative min-h-[500px] h-[80vh] md:h-[85vh] w-full overflow-hidden -mt-[72px] sm:-mt-24 lg:-mt-28"
                style={{ isolation: "isolate", contain: "layout paint" }}
            >
                {/* Background Images - No Parallax */}
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
                                className="relative min-w-full h-full flex-shrink-0"
                            >
                                {item.cover ? (
                                    <>
                                        <img
                                            src={item.cover}
                                            className="w-full h-full object-cover object-top"
                                            alt={item.title}
                                            loading={
                                                idx === 0 ? "eager" : "lazy"
                                            }
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-muted/20" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative container mx-auto px-4 h-full flex items-center">
                    {heroItem && (
                        <div className="space-y-6 max-w-3xl pt-20">
                            <FadeIn direction="down" delay={0.1}>
                                <div className="flex flex-wrap items-center gap-3">
                                    {heroItem.year && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-white/20 bg-black/40 text-hero-foreground backdrop-blur-md px-3 py-1"
                                        >
                                            {heroItem.year}
                                        </Badge>
                                    )}
                                    {heroItem.rating && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 text-yellow-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-xs font-bold">
                                                {heroItem.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                    {heroItem.quality && (
                                        <Badge className="bg-primary/80 backdrop-blur-md text-xs px-3 py-1">
                                            {heroItem.quality}
                                        </Badge>
                                    )}
                                    <Badge
                                        variant="secondary"
                                        className="text-xs uppercase tracking-wider bg-black/30 hover:bg-black/40 text-hero-foreground border-white/10 backdrop-blur-md"
                                    >
                                        {heroItem.type}
                                    </Badge>
                                </div>
                            </FadeIn>

                            <StaggeredText
                                text={heroItem.title}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-hero-foreground drop-shadow-2xl"
                                delay={0.2}
                                staggerDelay={0.08}
                            />

                            <FadeIn direction="up" delay={0.3}>
                                <p className="text-base sm:text-lg text-hero-muted line-clamp-3 max-w-2xl leading-relaxed drop-shadow-md">
                                    {heroItem.synopsis || t('heroDefaultDescription')}
                                </p>
                            </FadeIn>

                            <FadeIn direction="up" delay={0.4}>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 rounded-full h-12 px-8 text-base"
                                    >
                                        <Link
                                            to={`/${heroItem.type}/${heroItem.id}`}
                                        >
                                            <Play className="w-5 h-5 fill-current" />
                                            <span>{t('watchNow')}</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="gap-2 backdrop-blur-md bg-white/10 border-white/20 text-hero-foreground hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300 rounded-full h-12 px-8 text-base"
                                    >
                                        <Link
                                            to={`/${heroItem.type}/${heroItem.id}`}
                                        >
                                            <Info className="w-5 h-5" />
                                            <span>{t('moreInfo')}</span>
                                        </Link>
                                    </Button>
                                </div>
                            </FadeIn>
                        </div>
                    )}
                </div>

                {/* Hero Indicators */}
                {heroList.length > 1 && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 hidden lg:flex">
                        {heroList.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setHeroIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={cn(
                                    "w-1.5 rounded-full transition-all duration-500",
                                    idx === heroIndex
                                        ? "bg-primary h-12 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                        : "bg-white/20 h-6 hover:bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 space-y-16 relative z-20 -mt-20">
                {/* Latest Movies */}
                {latestMovies?.data && latestMovies.data.length > 0 && (
                    <Section
                        title={t('latestMovies')}
                        icon={
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                        }
                        movies={latestMovies.data}
                        link="/browse/latest-movies"
                        delay={0.1}
                    />
                )}

                {/* Popular Movies */}
                {popularMovies?.data && popularMovies.data.length > 0 && (
                    <Section
                        title={t('popularMovies')}
                        icon={<TrendingUp className="w-6 h-6 text-primary" />}
                        movies={popularMovies.data}
                        link="/browse/popular-movies"
                        delay={0.2}
                    />
                )}

                {/* Latest Series */}
                {latestSeries?.data && latestSeries.data.length > 0 && (
                    <Section
                        title={t('latestSeries')}
                        icon={<Tv className="w-6 h-6 text-primary" />}
                        movies={latestSeries.data}
                        link="/browse/latest-series"
                        delay={0.3}
                    />
                )}

                {/* Anime Section with Filters */}
                {(anime?.data?.length || loadingAnime) && (
                    <FadeIn delay={0.4} direction="up">
                        <section className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 group cursor-pointer">
                                    <div className="h-8 w-1.5 bg-primary rounded-full group-hover:h-10 transition-all duration-300" />
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        Anime
                                    </h2>
                                    <div className="text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                        <Film className="w-6 h-6" />
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="self-start sm:self-auto hover:bg-secondary hover:text-primary transition-all group/btn"
                                >
                                    <Link
                                        to={`/browse/anime?type=${animeType}&audio=${animeAudio}`}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-sm font-medium">
                                            View All
                                        </span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>

                            {anime?.data && anime.data.length > 0 && (
                                <MovieCarousel title="" movies={anime.data} />
                            )}
                        </section>
                    </FadeIn>
                )}

                {/* Ongoing Anime (Scraper) */}
                {loadingOngoing ? (
                    <div className="space-y-6">
                        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                ) : (
                    ongoingAnime &&
                    ongoingAnime.length > 0 && (
                        <Section
                            title={t('ongoingAnime')}
                            icon={<Tv className="w-6 h-6 text-primary" />}
                            movies={ongoingAnime}
                            link="/anime"
                            delay={0.5}
                        />
                    )
                )}

                {/* Indonesian Movies */}
                {indo?.data && indo.data.length > 0 && (
                    <Section
                        title={t('indonesianMovies')}
                        icon={<Globe className="w-6 h-6 text-primary" />}
                        movies={indo.data}
                        link="/browse/indonesian-movies"
                        delay={0.6}
                    />
                )}

                {/* Korean Drama */}
                {kdrama?.data && kdrama.data.length > 0 && (
                    <Section
                        title={t('koreanDrama')}
                        icon={<Heart className="w-6 h-6 text-primary" />}
                        movies={kdrama.data}
                        link="/browse/korean-drama"
                        delay={0.7}
                    />
                )}

                {/* Romance */}
                {adult?.data && adult.data.length > 0 && (
                    <Section
                        title={t('romance')}
                        icon={<Heart className="w-6 h-6 text-rose-500" />}
                        movies={adult.data}
                        link="/browse/adult-movies"
                        delay={0.8}
                    />
                )}
            </main>
        </div>
    );
}
