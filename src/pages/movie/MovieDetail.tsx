import { useParams, Link, useMatch } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import {
    Star,
    Calendar,
    Globe,
    Play,
    AlertCircle,
    ExternalLink,
    RefreshCw,
    MessageSquare,
    Share2,
    Tv,
    Info,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Episode } from "@/services/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { commentsService } from "@/services/firebase/comments.service";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScaleIn } from "@/components/animations/ScaleIn";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedMovie } from "@/hooks/useTranslatedData";

// Animations moved to components/animations

interface Comment {
    name: string;
    message: string;
    time: number;
}

interface StreamingProvider {
    name: string;
    url: string;
    available: boolean;
    quality?: string;
    language?: string;
}

export default function MovieDetail() {
    const { id } = useParams<{ id: string }>();
    const isSeriesRoute = !!useMatch("/series/:id");

    const { t, language } = useLanguage();

    const {
        data: movie,
        isLoading,
        error,
    } = useQuery({
        queryKey: [isSeriesRoute ? "series" : "movie", id, language],
        queryFn: () =>
            isSeriesRoute
                ? movieAPI.getSeriesById(id!)
                : movieAPI.getMovieById(id!),
        enabled: !!id,
    });

    // Auto-translate movie data when language is Indonesian
    const translatedMovie = useTranslatedMovie(movie);

    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(0);
    const [providerError, setProviderError] = useState(false);
    const [streamingProviders, setStreamingProviders] = useState<
        StreamingProvider[]
    >([]);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);

    // FIXED: Load streaming providers properly
    useEffect(() => {
        const loadStreamingProviders = async () => {
            if (!movie?.id) return;

            setIsLoadingProviders(true);
            try {
                const providers = await movieAPI.getStreamingUrls(
                    movie.id,
                    movie.type as "movie" | "series"
                );
                // FIXED: Ensure providers is always an array
                const safeProviders = Array.isArray(providers) ? providers : [];
                setStreamingProviders(safeProviders);

                if (safeProviders.length > 0) {
                    setSelectedProvider(0);
                    setProviderError(false);
                }
            } catch (err) {
                console.error("Error loading streaming providers:", err);
                // FIXED: Set empty array as fallback
                setStreamingProviders([]);
            } finally {
                setIsLoadingProviders(false);
            }
        };

        loadStreamingProviders();
    }, [movie?.id, movie?.type]);

    // Fetch episodes for series
    const { data: episodes = [], isLoading: episodesLoading } = useQuery<
        Episode[],
        Error
    >({
        queryKey: ["episodes", id],
        queryFn: async () => {
            if (!id || !isSeriesRoute) return [];
            const eps = await movieAPI.getEpisodes(id);
            if (!Array.isArray(eps)) return [];

            return eps.filter(
                (ep) =>
                    ep &&
                    typeof ep.seasonNumber === "number" &&
                    typeof ep.episodeNumber === "number"
            );
        },
        enabled: !!id && isSeriesRoute,
    });

    // Group episodes by season
    const seasonGroups = useMemo(() => {
        const groups: Record<number, Episode[]> = {};
        episodes.forEach((ep) => {
            if (!groups[ep.seasonNumber]) groups[ep.seasonNumber] = [];
            groups[ep.seasonNumber].push(ep);
        });
        // Sort episodes
        Object.keys(groups).forEach((key) => {
            groups[Number(key)].sort(
                (a, b) => a.episodeNumber - b.episodeNumber
            );
        });
        return groups;
    }, [episodes]);

    const seasons = useMemo(
        () =>
            Object.keys(seasonGroups)
                .map(Number)
                .sort((a, b) => a - b),
        [seasonGroups]
    );
    const [selectedSeason, setSelectedSeason] = useState<string>("1");

    // Update selected season when seasons change
    useEffect(() => {
        if (seasons.length > 0 && !seasons.includes(Number(selectedSeason))) {
            setSelectedSeason(String(seasons[0]));
        }
        setShowAllEpisodes(false);
    }, [seasons, selectedSeason]);

    const [showAllEpisodes, setShowAllEpisodes] = useState(false);

    useEffect(() => {
        const loadComments = async () => {
            if (!id) return;
            setIsLoadingComments(true);
            try {
                const firebaseComments = await commentsService.getComments(id);
                setComments(firebaseComments);
            } catch (error) {
                console.error("Error loading comments:", error);
                // Fallback to localStorage if Firebase fails
                try {
                    const raw = localStorage.getItem(`comments:movie:${id}`);
                    setComments(raw ? JSON.parse(raw) : []);
                } catch {
                    setComments([]);
                }
            } finally {
                setIsLoadingComments(false);
            }
        };

        loadComments();
    }, [id]);

    const addComment = async () => {
        const n = name.trim();
        const m = message.trim();
        if (!n || !m || !id) return;

        setIsLoadingComments(true);
        try {
            const newComment = await commentsService.addComment(id, {
                name: n,
                message: m,
            });

            setComments([newComment, ...comments]);
            // Also save to localStorage as backup/cache
            const currentLocal = localStorage.getItem(`comments:movie:${id}`);
            const localComments = currentLocal ? JSON.parse(currentLocal) : [];
            localStorage.setItem(
                `comments:movie:${id}`,
                JSON.stringify([newComment, ...localComments])
            );

            setName("");
            setMessage("");
            toast({
                title: t("commentSent"),
                description: t("commentThanks"),
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            // Fallback to localStorage
            const fallbackComment = { name: n, message: m, time: Date.now() };
            const next = [fallbackComment, ...comments];
            setComments(next);
            localStorage.setItem(`comments:movie:${id}`, JSON.stringify(next));
            setName("");
            setMessage("");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleProviderChange = (value: string) => {
        setSelectedProvider(Number(value));
        setProviderError(false);
    };

    const handleIframeError = () => {
        setProviderError(true);
    };

    const tryNextProvider = () => {
        if (streamingProviders.length === 0) return;

        const nextProvider =
            selectedProvider < streamingProviders.length - 1
                ? selectedProvider + 1
                : 0;

        setSelectedProvider(nextProvider);
        setProviderError(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="relative h-[40vh] sm:h-[50vh] w-full bg-muted animate-pulse" />
                <div className="container mx-auto px-4 -mt-32 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Skeleton className="aspect-[2/3] w-full rounded-xl shadow-lg" />
                        <div className="md:col-span-2 space-y-6 pt-12">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {t("errorMovieNotFound")}
                        <Link
                            to="/"
                            className="ml-2 underline block mt-2 font-medium"
                        >
                            {t("returnHome")}
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Backdrop */}
            <div className="relative h-[65vh] sm:h-[75vh] md:h-[85vh] -mt-[72px] sm:-mt-24 lg:-mt-28 overflow-hidden bg-background">
                <ScaleIn className="absolute inset-0 h-full w-full">
                    <div className="relative w-full h-full">
                        <img
                            src={movie.backdrops?.[0] || movie.cover || "/placeholder.svg"}
                            className="w-full h-full object-cover object-center"
                            alt={movie.title}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                            }}
                        />
                        {/* Improved Gradients for consistency - Darker overlay for better contrast */}
                        <div className="absolute inset-0 bg-background/60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-hero" />
                    </div>
                </ScaleIn>
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10 -mt-40 sm:-mt-56 md:-mt-64">
                <Breadcrumb className="mb-4 sm:mb-6 px-0" />
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-8">
                    {/* Poster & Actions */}
                    <FadeIn className="space-y-6" direction="right" delay={0.1}>
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                            <img
                                src={movie.cover || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.svg";
                                }}
                            />
                            {movie.quality && (
                                <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md text-xs font-bold px-2 py-1 shadow-lg">
                                    {movie.quality}
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {movie.trailer && (
                                <Button
                                    className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                    size="lg"
                                    onClick={() =>
                                        window.open(movie.trailer, "_blank")
                                    }
                                >
                                    <Play className="h-4 w-4 fill-current" />
                                    {t("trailer")}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full gap-2 backdrop-blur-sm bg-background/50"
                                size="lg"
                                aria-label={t("share")}
                            >
                                <Share2 className="h-4 w-4" />
                                {t("share")}
                            </Button>
                        </div>
                    </FadeIn>

                    {/* Details */}
                    <FadeIn className="space-y-8" direction="left" delay={0.2}>
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gradient leading-tight drop-shadow-lg [text-shadow:_0_2px_10px_rgb(0_0_0_/_80%)]">
                                {movie.title?.includes(';') && movie.title.split(';')[0].trim() === movie.title.split(';')[1]?.trim() 
                                    ? movie.title.split(';')[0].trim() 
                                    : movie.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                {movie.rating && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{movie.rating.toFixed(1)}</span>
                                    </div>
                                )}
                                {movie.year && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-hero-foreground shadow-sm">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                        <span>{movie.year}</span>
                                    </div>
                                )}
                                {translatedMovie?.country && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-hero-foreground shadow-sm">
                                        <Globe className="h-3.5 w-3.5 text-primary" />
                                        <span>{translatedMovie.country}</span>
                                    </div>
                                )}
                                <Badge
                                    variant="secondary"
                                    className="uppercase tracking-wider"
                                >
                                    {movie.type}
                                </Badge>
                            </div>

                            {translatedMovie?.genre &&
                                translatedMovie.genre.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {translatedMovie.genre.map((g, idx) => (
                                            <Link
                                                key={idx}
                                                to={`/genre/${encodeURIComponent(
                                                    movie?.genre?.[idx] || g
                                                )}`}
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer px-3 py-1 bg-secondary/80 backdrop-blur-sm border border-white/10"
                                                >
                                                    {g}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                        </div>

                        {translatedMovie && (
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    {t("synopsis")}
                                </h2>
                                <div className="relative group/synopsis">
                                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-3xl opacity-0 group-hover/synopsis:opacity-100 transition-opacity duration-500" />
                                    <p className="relative p-5 rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 text-muted-foreground leading-relaxed text-base sm:text-lg shadow-inner">
                                        {translatedMovie.synopsis || t("noSynopsisAvailable")}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Cast Section */}
                        {movie.cast && movie.cast.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    {t("cast")}
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-linear-fade">
                                    {/* Deduplicate cast by ID */}
                                    {movie.cast
                                        .filter((actor, index, self) => 
                                            index === self.findIndex((t) => t.id === actor.id)
                                        )
                                        .map((actor) => (
                                        <div
                                            key={actor.id}
                                            className="flex-shrink-0 text-center w-20 sm:w-24 group"
                                        >
                                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all">
                                                <img
                                                    src={
                                                        actor.profile ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        const target =
                                                            e.target as HTMLImageElement;
                                                        target.src =
                                                            "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors h-8 flex items-center justify-center">
                                                {actor.name}
                                            </p>
                                            {actor.character && (
                                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                                    {actor.character}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Episodes for Series */}
                        {movie.type === "series" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Tv className="h-5 w-5 text-primary" />
                                        {t("episodes")}
                                    </h2>
                                </div>

                                {episodesLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-10 w-full md:w-1/3" />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[...Array(6)].map((_, i) => (
                                                <Skeleton
                                                    key={i}
                                                    className="aspect-video rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : seasons.length > 0 ? (
                                    <Tabs
                                        value={selectedSeason}
                                        onValueChange={setSelectedSeason}
                                        className="w-full"
                                    >
                                        <ScrollArea className="w-full pb-4">
                                            <TabsList className="inline-flex w-auto h-auto p-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-xl">
                                                {seasons.map((season) => (
                                                    <TabsTrigger
                                                        key={season}
                                                        value={String(season)}
                                                        className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                                                    >
                                                        {t('season')?.replace('{season}', String(season)) || `Season ${season}`}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </ScrollArea>

                                        {seasons.map((season) => {
                                            const seasonInfo =
                                                movie.seasons?.find(
                                                    (s) =>
                                                        s.seasonNumber ===
                                                        season
                                                );
                                            return (
                                                <TabsContent
                                                    key={season}
                                                    value={String(season)}
                                                    className="mt-4 space-y-6"
                                                >
                                                    {/* Season Info */}
                                                    {seasonInfo && (
                                                        <div className="flex flex-col md:flex-row gap-6 bg-card/50 p-6 rounded-xl border border-border/50">
                                                            {seasonInfo.cover && (
                                                                <div className="flex-shrink-0 w-32 md:w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                                                                    <img
                                                                        src={
                                                                            seasonInfo.cover
                                                                        }
                                                                        alt={
                                                                            seasonInfo.name
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="space-y-4 flex-1">
                                                                <div>
                                                                    <h3 className="text-2xl font-bold">
                                                                        {
                                                                            seasonInfo.name
                                                                        }
                                                                    </h3>
                                                                    <div className="flex items-center gap-3 text-muted-foreground mt-2 text-sm">
                                                                        {seasonInfo.year && (
                                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary">
                                                                                <Calendar className="h-3.5 w-3.5" />
                                                                                <span>
                                                                                    {
                                                                                        seasonInfo.year
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary">
                                                                            <Tv className="h-3.5 w-3.5" />
                                                                            <span>
                                                                                {
                                                                                    seasonInfo.episodeCount
                                                                                }{" "}
                                                                                {t('episodes')}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {seasonInfo.overview && (
                                                                    <div className="space-y-2">
                                                                        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
                                                                            {t('overview')}
                                                                        </h4>
                                                                        <p className="text-muted-foreground leading-relaxed">
                                                                            {
                                                                                seasonInfo.overview
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(showAllEpisodes
                                                            ? seasonGroups[
                                                                  season
                                                              ]
                                                            : seasonGroups[
                                                                  season
                                                              ].slice(0, 12)
                                                        ).map((episode) => (
                                                            <Link
                                                                key={episode.id}
                                                                to={`/series/${id}/watch?season=${episode.seasonNumber}&episode=${episode.episodeNumber}`}
                                                            >
                                                                <Card className="group flex flex-row overflow-hidden border-border/50 bg-card hover:bg-accent/50 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/5 h-24 sm:h-28">
                                                                    <div className="relative w-32 sm:w-44 flex-shrink-0 overflow-hidden">
                                                                        <img
                                                                            src={
                                                                                episode.cover ||
                                                                                "/placeholder.svg"
                                                                            }
                                                                            alt={
                                                                                episode.title
                                                                            }
                                                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                const target =
                                                                                    e.target as HTMLImageElement;
                                                                                target.src =
                                                                                    "/placeholder.svg";
                                                                            }}
                                                                        />
                                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                                                                        <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                                                                            <Badge className="bg-black/60 backdrop-blur border-white/10 text-[10px] sm:text-xs px-1.5 py-0">
                                                                                {t('episode')}
                                                                                {" "}
                                                                                {
                                                                                    episode.episodeNumber
                                                                                }
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[1px]">
                                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 transform scale-50 group-hover:scale-100 transition-transform">
                                                                                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground fill-current ml-0.5" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-3 sm:p-4 flex flex-col justify-center flex-1 min-w-0">
                                                                        <h3 className="font-medium text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                                                                            {episode.title ||
                                                                                `${t('episode')} ${episode.episodeNumber}`}
                                                                        </h3>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-xs text-muted-foreground">
                                                                                S
                                                                                {
                                                                                    episode.seasonNumber
                                                                                }{" "}
                                                                                •
                                                                                E
                                                                                {
                                                                                    episode.episodeNumber
                                                                                }
                                                                            </span>
                                                                            {episode.airDate && (
                                                                                <>
                                                                                    <span className="text-muted-foreground/30 text-[10px]">
                                                                                        •
                                                                                    </span>
                                                                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                                                        {new Date(
                                                                                            episode.airDate
                                                                                        ).getFullYear()}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        {episode.overview && (
                                                                            <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-1.5 hidden sm:block">
                                                                                {
                                                                                    episode.overview
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </Card>
                                                            </Link>
                                                        ))}
                                                    </div>

                                                    {seasonGroups[season]
                                                        .length > 12 &&
                                                        !showAllEpisodes && (
                                                            <div className="flex justify-center pt-4">
                                                                    <Button
                                                                        variant="outline"
                                                                        className="min-w-[200px] border-white/10 hover:bg-primary hover:text-primary-foreground transition-all"
                                                                        onClick={() =>
                                                                            setShowAllEpisodes(
                                                                                true
                                                                            )
                                                                        }
                                                                        aria-label={t("seeMoreEpisodes")}
                                                                    >
                                                                    {t(
                                                                        "seeMoreEpisodes"
                                                                    )}{" "}
                                                                    (
                                                                    {seasonGroups[
                                                                        season
                                                                    ].length -
                                                                        12}{" "}
                                                                    {t('remaining')})
                                                                </Button>
                                                            </div>
                                                        )}

                                                    {showAllEpisodes &&
                                                        seasonGroups[season]
                                                            .length > 12 && (
                                                            <div className="flex justify-center pt-4">
                                                                <Button
                                                                    variant="ghost"
                                                                    className="text-muted-foreground hover:text-foreground"
                                                                    onClick={() =>
                                                                        setShowAllEpisodes(
                                                                            false
                                                                        )
                                                                    }
                                                                >
                                                                    {t(
                                                                        "showLess"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        )}
                                                </TabsContent>
                                            );
                                        })}
                                    </Tabs>
                                ) : (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {t("noEpisodes")}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* Watch Section with Multiple Providers */}
                        {movie.type === "movie" && (
                            <Card className="overflow-hidden border-border/50 shadow-2xl bg-card backdrop-blur-xl ring-1 ring-border/10">
                                <CardHeader className="border-b border-border/10 bg-muted/20">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Play className="h-5 w-5 text-primary fill-current" />
                                        {t("watchMovie")}
                                        {isLoadingProviders && (
                                            <RefreshCw className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="space-y-0">
                                        {/* Video Player */}
                                        <div className="relative aspect-video bg-black flex items-center justify-center">
                                            {isLoadingProviders ? (
                                                <div className="text-center text-white/50 space-y-4">
                                                    <RefreshCw className="h-10 w-10 mx-auto animate-spin" />
                                                    <p className="text-sm font-medium">
                                                        {t("searchingStreams")}
                                                    </p>
                                                </div>
                                            ) : providerError ? (
                                                <div className="text-center text-white space-y-4 p-6 max-w-md mx-auto">
                                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                                                        <AlertCircle className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {t(
                                                                "streamUnavailable"
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-white/60">
                                                            {t("providerIssue")}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={
                                                            tryNextProvider
                                                        }
                                                        className="gap-2"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                        {t("tryNextProvider")}
                                                    </Button>
                                                </div>
                                            ) : streamingProviders[
                                                  selectedProvider
                                              ] ? (
                                                <iframe
                                                    key={`${streamingProviders[selectedProvider].url}-${selectedProvider}`}
                                                    src={
                                                        streamingProviders[
                                                            selectedProvider
                                                        ].url
                                                    }
                                                    className="absolute inset-0 w-full h-full"
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; keyboard-map"
                                                    frameBorder={0}
                                                    onError={handleIframeError}
                                                    title={`Streaming from ${streamingProviders[selectedProvider].name}`}
                                                />
                                            ) : (
                                                <div className="text-center text-white space-y-4 p-6">
                                                    <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No streaming providers
                                                        available.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Controls */}
                                        {streamingProviders.length > 0 && (
                                            <div className="p-4 bg-background/50 backdrop-blur-md border-t border-white/5">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                                                            <Tv className="h-4 w-4 text-primary" />
                                                            Select Server:
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    window.open(
                                                                        streamingProviders[
                                                                            selectedProvider
                                                                        ]?.url,
                                                                        "_blank"
                                                                    )
                                                                }
                                                                className="text-xs gap-2 hover:bg-white/10"
                                                                disabled={
                                                                    !streamingProviders[
                                                                        selectedProvider
                                                                    ]
                                                                }
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                                Open in New Tab
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    window.location.reload()
                                                                }
                                                                className="text-xs gap-2 hover:bg-white/10"
                                                            >
                                                                <RefreshCw className="h-3.5 w-3.5" />
                                                                Refresh
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {streamingProviders.map((provider, index) => (
                                                            <Button
                                                                key={index}
                                                                variant={selectedProvider === index ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => handleProviderChange(String(index))}
                                                                className={cn(
                                                                    "gap-2 transition-all",
                                                                    selectedProvider === index 
                                                                        ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 scale-105" 
                                                                        : "bg-background/50 border-white/10 hover:bg-white/10 hover:text-white dark:hover:bg-white/10"
                                                                )}
                                                            >
                                                                <Play className={cn("h-3 w-3", selectedProvider === index ? "fill-current" : "")} />
                                                                Server {index + 1} ({provider.name})
                                                                {provider.quality && (
                                                                    <Badge 
                                                                        variant="secondary" 
                                                                        className={cn(
                                                                            "ml-1 text-[10px] h-4 px-1 leading-none pointer-events-none",
                                                                            selectedProvider === index ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                                                                        )}
                                                                    >
                                                                        {provider.quality}
                                                                    </Badge>
                                                                )}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>

                                                
                                                {/* Ad Tips */}
                                                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-white/5">
                                                    <Info className="h-3.5 w-3.5 text-primary" />
                                                    <span>Jika muncul pop-up, silakan tutup dan klik play kembali.</span>
                                                </div>

                                                {/* Subtitle Tips */}
                                                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                    <div className="flex items-start gap-3">
                                                        <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                        <div className="space-y-2 text-sm">
                                                            <h4 className="font-semibold text-blue-100">Tips Agar Subtitle Indonesia Selalu Muncul:</h4>
                                                            <ul className="space-y-1.5 text-blue-100/80 list-disc ml-4">
                                                                <li>
                                                                    <span className="font-medium text-blue-200">Gunakan Multi-Server:</span> Jika di Server 1 (misal: VidLink) tidak ada sub Indo, cobalah Server 2 (misal: Vidsrc).
                                                                </li>
                                                                <li>
                                                                    <span className="font-medium text-blue-200">Cek Ikon CC:</span> Klik ikon CC di pojok kanan bawah player untuk melihat daftar bahasa.
                                                                </li>
                                                                <li>
                                                                    <span className="font-medium text-blue-200">Update Otomatis:</span> Subtitle Indonesia biasanya muncul otomatis beberapa hari setelah rilis HD.
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments Section */}
                        <FadeIn className="space-y-4 pt-10" direction="up">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                {t("comments")}
                            </h2>
                            <Card className="bg-card/50 backdrop-blur-sm border-white/5 overflow-hidden shadow-xl">
                                <CardContent className="p-6 space-y-8">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <Input
                                                    placeholder={t("yourName")}
                                                    value={name}
                                                    onChange={(e) =>
                                                        setName(e.target.value)
                                                    }
                                                    maxLength={50}
                                                    className="bg-background/50 border-white/10 focus:border-primary/50 h-11"
                                                />
                                                <Textarea
                                                    placeholder={t("writeComment")}
                                                    value={message}
                                                    onChange={(e) =>
                                                        setMessage(e.target.value)
                                                    }
                                                    className="min-h-[120px] bg-background/50 border-white/10 focus:border-primary/50 resize-none p-4"
                                                    maxLength={500}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center bg-background/30 p-2 pl-4 rounded-lg border border-white/5">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {message.length}/500 {t("characters")}
                                                </span>
                                                <Button
                                                    onClick={addComment}
                                                    disabled={
                                                        !name.trim() ||
                                                        !message.trim() ||
                                                        isLoadingComments
                                                    }
                                                    className="gap-2 px-6 shadow-lg shadow-primary/20"
                                                >
                                                    {isLoadingComments ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                            {t("posting")}...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-3.5 w-3.5 fill-current" />
                                                            {t("submitComment")}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {isLoadingComments &&
                                            comments.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary opacity-50" />
                                                    <p className="text-sm text-muted-foreground mt-4">
                                                        {t("loadingComments")}...
                                                    </p>
                                                </div>
                                            ) : comments.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-white/10 group/empty">
                                                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20 group-hover:opacity-40 transition-opacity" />
                                                    <p className="text-sm">
                                                        {t("noCommentsYet")}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4">
                                                    {comments.map((c, idx) => (
                                                        <div
                                                            key={`${c.time}-${idx}`}
                                                            className="p-5 rounded-2xl bg-muted/20 border border-white/5 space-y-3 transition-colors hover:bg-muted/30"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/20">
                                                                        {c.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-bold text-sm text-foreground/90">
                                                                        {c.name}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                                                    {new Date(
                                                                        c.time
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                                                                {c.message}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
