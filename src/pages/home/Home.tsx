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
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { HeroParticles } from "@/components/features/hero/HeroParticles";
import { useLanguage } from "@/contexts/LanguageContext";

function HeroBackground({ heroList, heroIndex }: { heroList: any[], heroIndex: number }) {
    const { scrollY } = useScroll();
    const yKey = useTransform(scrollY, [0, 500], [0, 150]); // Parallax effect

    return (
        <div className="absolute inset-0">
            <HeroParticles />
            <motion.div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${heroIndex * 100}%)`,
                    y: yKey
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
                                        idx === 0 || idx === 1 ? "eager" : "lazy"
                                    }
                                    decoding="async"
                                    {...(idx === 0 || idx === 1 ? { fetchpriority: "high" } : {})}
                                />
                                {/* Improved Gradients for Contrast */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent sm:via-black/40" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                <div className="absolute inset-0 bg-black/20" /> 
                            </>
                        ) : (
                            <div className="w-full h-full bg-muted/20" />
                        )}
                    </div>
                ))}
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
        </div>
    );
}

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
    const [stableHeroList, setStableHeroList] = useState<any[]>([]);

    useEffect(() => {
        if (stableHeroList.length > 0) return; // Already set

        if (latestMovies?.data?.length) {
            setStableHeroList(latestMovies.data.slice(0, 5));
        } else if (popularMovies?.data?.length) {
            setStableHeroList(popularMovies.data.slice(0, 5));
        }
    }, [latestMovies?.data, popularMovies?.data, stableHeroList.length]);

    const heroList = stableHeroList;
    const [heroIndex, setHeroIndex] = useState(0);
    const heroItem = heroList[heroIndex];

    // Carousel State
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const AUTO_PLAY_DURATION = 8000;

    // Improved Auto-play with requestAnimationFrame
    useEffect(() => {
        if (!heroList.length || isPaused) return;

        let lastTime = performance.now();
        let animationFrameId: number;

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            setProgress((prev) => {
                const newProgress = prev + (deltaTime / AUTO_PLAY_DURATION) * 100;
                if (newProgress >= 100) {
                    setHeroIndex((prevIndex) => (prevIndex + 1) % heroList.length);
                    return 0;
                }
                return newProgress;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [heroList.length, isPaused]);

    // Reset progress when index changes manually
    useEffect(() => {
        setProgress(0);
    }, [heroIndex]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setHeroIndex((prev) => (prev - 1 + heroList.length) % heroList.length);
                setProgress(0);
            } else if (e.key === "ArrowRight") {
                setHeroIndex((prev) => (prev + 1) % heroList.length);
                setProgress(0);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [heroList.length]);

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);

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
            <div className="min-h-screen bg-background pb-20">
                {/* Hero Skeleton - Match the real Hero's negative margin and height */}
                <div className="relative h-[80vh] md:h-[85vh] w-full -mt-[72px] sm:-mt-24 lg:-mt-28 bg-muted animate-shimmer rounded-b-3xl overflow-hidden" />

                {/* Content Skeletons - Match the real main container structure */}
                <main className="container mx-auto px-4 py-12 space-y-16 relative z-10 -mt-20">
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-muted animate-shimmer rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-muted animate-shimmer rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-muted animate-shimmer rounded" />
                        <SkeletonGrid count={6} />
                    </div>
                </main>
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
                className="relative min-h-[500px] h-[80vh] md:h-[85vh] w-full overflow-hidden -mt-[72px] sm:-mt-24 lg:-mt-28 group/hero"
                style={{ isolation: "isolate", contain: "layout paint" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Parallax Background */}
                <HeroBackground heroList={heroList} heroIndex={heroIndex} />

                {/* Hero Content */}
                <div className="relative container mx-auto px-4 h-full flex items-center z-10">
                    <AnimatePresence mode="wait">
                        {heroItem && (
                            <motion.div
                                key={heroItem.id ?? heroIndex}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6 max-w-3xl pt-20"
                            >
                                {/* Meta Badges */}
                                <motion.div 
                                    className="flex flex-wrap items-center gap-3"
                                    variants={{
                                        initial: { opacity: 0, y: 20 },
                                        animate: { 
                                            opacity: 1, 
                                            y: 0,
                                            transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
                                        },
                                        exit: { opacity: 0, transition: { duration: 0.3 } }
                                    }}
                                >
                                    {heroItem.year && (
                                        <motion.div variants={{ initial: { rotate: -10, opacity: 0 }, animate: { rotate: 0, opacity: 1 } }}>
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-white/20 bg-black/40 text-white backdrop-blur-md px-3 py-1"
                                            >
                                                {heroItem.year}
                                            </Badge>
                                        </motion.div>
                                    )}
                                    {heroItem.rating && (
                                        <motion.div variants={{ initial: { rotate: -10, opacity: 0 }, animate: { rotate: 0, opacity: 1 } }}>
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 text-yellow-500">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-xs font-bold">
                                                    {heroItem.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                    {heroItem.quality && (
                                        <motion.div variants={{ initial: { rotate: -10, opacity: 0 }, animate: { rotate: 0, opacity: 1 } }}>
                                            <Badge className="bg-primary/90 backdrop-blur-md text-xs px-3 py-1 text-primary-foreground border border-primary/20">
                                                {heroItem.quality}
                                            </Badge>
                                        </motion.div>
                                    )}
                                    <motion.div variants={{ initial: { rotate: -10, opacity: 0 }, animate: { rotate: 0, opacity: 1 } }}>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs uppercase tracking-wider bg-white/20 hover:bg-white/30 text-white border-white/10 backdrop-blur-md"
                                        >
                                            {heroItem.type}
                                        </Badge>
                                    </motion.div>
                                </motion.div>

                                {/* Title */}
                                <div className="overflow-hidden">
                                    <motion.h1 
                                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white drop-shadow-2xl"
                                        variants={{
                                            initial: { y: 50, opacity: 0 },
                                            animate: { 
                                                y: 0, 
                                                opacity: 1, 
                                                transition: { duration: 0.8, ease: "easeOut", delay: 0.1 } 
                                            },
                                            exit: { y: -20, opacity: 0, transition: { duration: 0.4 } }
                                        }}
                                    >
                                        {heroItem.title}
                                    </motion.h1>
                                </div>

                                {/* Synopsis */}
                                <motion.div 
                                    className="max-w-2xl rounded-xl bg-black/30 backdrop-blur-[2px] p-4 -ml-4 border border-white/5 shadow-sm sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-none sm:shadow-none"
                                    variants={{
                                        initial: { opacity: 0, y: 30 },
                                        animate: { 
                                            opacity: 1, 
                                            y: 0,
                                            transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } 
                                        },
                                        exit: { opacity: 0, transition: { duration: 0.3 } }
                                    }}
                                >
                                    <p className="text-base sm:text-lg text-white/90 sm:text-white line-clamp-3 leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-medium text-shadow-sm">
                                        {heroItem.synopsis || t('heroDefaultDescription')}
                                    </p>
                                </motion.div>

                                {/* Buttons */}
                                <motion.div 
                                    className="flex flex-wrap gap-4 pt-4"
                                    variants={{
                                        initial: { opacity: 0, scale: 0.9 },
                                        animate: { 
                                            opacity: 1, 
                                            scale: 1,
                                            transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.3 }
                                        },
                                        exit: { opacity: 0, scale: 0.95 }
                                    }}
                                >
                                    <Button
                                        asChild
                                        size="lg"
                                        className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 rounded-full h-12 px-8 text-base font-semibold"
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
                                        className="gap-2 backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300 rounded-full h-12 px-8 text-base font-medium"
                                    >
                                        <Link
                                            to={`/${heroItem.type}/${heroItem.id}`}
                                        >
                                            <Info className="w-5 h-5" />
                                            <span>{t('moreInfo')}</span>
                                        </Link>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Hero Indicators (Unified & Less Intrusive) */}
                {heroList.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                        {heroList.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setHeroIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className="group relative p-2"
                            >
                                <span className={cn(
                                    "block rounded-full transition-all duration-300",
                                    idx === heroIndex
                                        ? "w-8 h-1.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.6)]"
                                        : "w-2 h-2 bg-white/40 group-hover:bg-white/70 group-hover:scale-125"
                                )} />
                                {idx === heroIndex && !isPaused && (
                                    <span className="absolute bottom-0 left-0 h-0.5 bg-white/50 w-full animate-progress-bar" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 space-y-16 relative z-20 -mt-20 w-full overflow-hidden">
                {/* Latest Movies */}
                {latestMovies?.data && latestMovies.data.length > 0 && (
                    <Section
                        title={t('latestMovies')}
                        icon={
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                        }
                        movies={latestMovies.data.slice(0, 10)}
                        link="/browse/latest-movies"
                        delay={0.1}
                    />
                )}

                {/* Popular Movies */}
                {popularMovies?.data && popularMovies.data.length > 0 && (
                    <Section
                        title={t('popularMovies')}
                        icon={<TrendingUp className="w-6 h-6 text-primary" />}
                        movies={popularMovies.data.slice(0, 10)}
                        link="/browse/popular-movies"
                        delay={0.2}
                    />
                )}

                {/* Latest Series */}
                {latestSeries?.data && latestSeries.data.length > 0 && (
                    <Section
                        title={t('latestSeries')}
                        icon={<Tv className="w-6 h-6 text-primary" />}
                        movies={latestSeries.data.slice(0, 10)}
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
                                <MovieCarousel title="" movies={anime.data.slice(0, 10)} />
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
                            movies={ongoingAnime.slice(0, 10)}
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
                        movies={indo.data.slice(0, 10)}
                        link="/browse/indonesian-movies"
                        delay={0.6}
                    />
                )}

                {/* Korean Drama */}
                {kdrama?.data && kdrama.data.length > 0 && (
                    <Section
                        title={t('koreanDrama')}
                        icon={<Heart className="w-6 h-6 text-primary" />}
                        movies={kdrama.data.slice(0, 10)}
                        link="/browse/korean-drama"
                        delay={0.7}
                    />
                )}

                {/* Romance */}
                {adult?.data && adult.data.length > 0 && (
                    <Section
                        title={t('romance')}
                        icon={<Heart className="w-6 h-6 text-rose-500" />}
                        movies={adult.data.slice(0, 10)}
                        link="/browse/adult-movies"
                        delay={0.8}
                    />
                )}
            </main>
        </div>
    );
}
