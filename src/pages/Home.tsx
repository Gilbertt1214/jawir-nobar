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
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ParallaxWrapper } from "@/components/ParallaxWrapper";
import { StaggeredText } from "@/components/StaggeredText";
import { motion } from "framer-motion";

const slideInRight = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
};

export default function Home() {
    // Anime filters
    const [animeType, setAnimeType] = useState<"all" | "tv" | "movie">("all");
    const [animeAudio, setAnimeAudio] = useState<"all" | "sub" | "dub">("all");

    // Data queries
    const {
        data: latestMovies,
        isLoading: loadingLatest,
        error: errorLatest,
    } = useQuery({
        queryKey: ["latest-movies", 1],
        queryFn: () => movieAPI.getLatestMovies(1),
    });

    const {
        data: popularMovies,
        isLoading: loadingPopular,
        error: errorPopular,
    } = useQuery({
        queryKey: ["popular-movies", 1],
        queryFn: () => movieAPI.getPopularMovies(1),
    });

    const {
        data: latestSeries,
        isLoading: loadingSeries,
        error: errorSeries,
    } = useQuery({
        queryKey: ["latest-series", 1],
        queryFn: () => movieAPI.getLatestSeries(1),
    });

    const {
        data: anime,
        isLoading: loadingAnime,
        error: errorAnime,
    } = useQuery({
        queryKey: ["anime", 1, animeType, animeAudio],
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
        queryKey: ["indo-movies", 1],
        queryFn: () => movieAPI.getIndonesianMovies(1),
    });

    const {
        data: kdrama,
        isLoading: loadingKDrama,
        error: errorKDrama,
    } = useQuery({
        queryKey: ["korean-drama", 1],
        queryFn: () => movieAPI.getKoreanDrama(1),
    });

    const {
        data: adult,
        isLoading: loadingAdult,
        error: errorAdult,
    } = useQuery({
        queryKey: ["adult-movies", 1],
        queryFn: () => movieAPI.getAdultMovies(1),
    });

    // Hero carousel state
    const heroList = latestMovies?.data?.slice(0, 5) || popularMovies?.data?.slice(0, 5) || [];
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
        <motion.section 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-primary to-purple-500 rounded-full group-hover:h-10 transition-all duration-300" />
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient group-hover:text-primary transition-colors">
                        {title}
                    </h2>
                    {icon && (
                        <div className="text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                            {icon}
                        </div>
                    )}
                </div>
                {children}
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="self-start sm:self-auto hover:bg-white/5 hover:text-primary transition-all group/btn"
                >
                    <Link to={link} className="flex items-center gap-2">
                        <span className="text-sm font-medium">View All</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </Button>
            </div>
            <MovieCarousel title="" movies={movies} />
        </motion.section>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="relative min-h-[500px] h-[80vh] md:h-[85vh] w-full overflow-hidden">
                {/* Background Images with Parallax */}
                <ParallaxWrapper speed={0.5} className="absolute inset-0">
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
                                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                                )}
                            </div>
                        ))}
                    </div>
                </ParallaxWrapper>

                {/* Hero Content */}
                <div className="relative container mx-auto px-4 h-full flex items-center">
                    {heroItem && (
                        <motion.div 
                            className="space-y-6 max-w-3xl pt-20"
                            initial="hidden"
                            animate="visible"
                            variants={slideInRight}
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                {heroItem.year && (
                                    <Badge variant="outline" className="text-xs border-white/20 bg-black/40 backdrop-blur-md px-3 py-1">
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
                                <Badge variant="secondary" className="text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 backdrop-blur-md">
                                    {heroItem.type}
                                </Badge>
                            </div>

                            <StaggeredText 
                                text={heroItem.title}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-gradient drop-shadow-2xl"
                                delay={0.2}
                                staggerDelay={0.08}
                            />

                            <p className="text-base sm:text-lg text-muted-foreground line-clamp-3 max-w-2xl leading-relaxed">
                                {heroItem.synopsis ||
                                    "Discover the latest movies and series to watch. Immerse yourself in the world of cinema."}
                            </p>

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
                                        <span>Watch Now</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 rounded-full h-12 px-8 text-base"
                                >
                                    <Link
                                        to={`/${heroItem.type}/${heroItem.id}`}
                                    >
                                        <Info className="w-5 h-5" />
                                        <span>More Info</span>
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
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
            <main className="container mx-auto px-4 py-12 space-y-16 -mt-20 relative z-10">
                {/* Latest Movies */}
                {latestMovies?.data && latestMovies.data.length > 0 && (
                    <Section
                        title="Latest Movies"
                        icon={<Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />}
                        movies={latestMovies.data}
                        link="/browse/latest-movies"
                    />
                )}

                {/* Popular Movies */}
                {popularMovies?.data && popularMovies.data.length > 0 && (
                    <Section
                        title="Popular Movies"
                        icon={<TrendingUp className="w-6 h-6 text-red-500" />}
                        movies={popularMovies.data}
                        link="/browse/popular-movies"
                    />
                )}

                {/* Latest Series */}
                {latestSeries?.data && latestSeries.data.length > 0 && (
                    <Section
                        title="Latest Series"
                        icon={<Tv className="w-6 h-6 text-blue-500" />}
                        movies={latestSeries.data}
                        link="/browse/latest-series"
                    />
                )}

                {/* Anime Section with Filters */}
                {(anime?.data?.length || loadingAnime) && (
                    <motion.section 
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="h-8 w-1.5 bg-gradient-to-b from-primary to-purple-500 rounded-full group-hover:h-10 transition-all duration-300" />
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient group-hover:text-primary transition-colors">
                                    Anime
                                </h2>
                                <Film className="w-6 h-6 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                            </div>

                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="self-start lg:self-auto hover:bg-white/5 hover:text-primary transition-all group/btn"
                            >
                                <Link
                                    to={`/browse/anime?type=${animeType}&audio=${animeAudio}`}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-sm font-medium">View All</span>
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                        </div>

                        {anime?.data && anime.data.length > 0 && (
                            <MovieCarousel title="" movies={anime.data} />
                        )}
                    </motion.section>
                )}

                {/* Indonesian Movies */}
                {indo?.data && indo.data.length > 0 && (
                    <Section
                        title="Indonesian Movies"
                        icon={<Globe className="w-6 h-6 text-green-500" />}
                        movies={indo.data}
                        link="/browse/indonesian-movies"
                    />
                )}

                {/* Korean Drama */}
                {kdrama?.data && kdrama.data.length > 0 && (
                    <Section
                        title="Korean Drama"
                        icon={<Heart className="w-6 h-6 text-pink-500" />}
                        movies={kdrama.data}
                        link="/browse/korean-drama"
                    />
                )}

                {/* Romance */}
                {adult?.data && adult.data.length > 0 && (
                    <Section
                        title="Romance"
                        icon={<Heart className="w-6 h-6 text-rose-500" />}
                        movies={adult.data}
                        link="/browse/adult-movies"
                    />
                )}
            </main>
        </div>
    );


}
