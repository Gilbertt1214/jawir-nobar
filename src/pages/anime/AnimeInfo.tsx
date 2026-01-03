import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertCircle,
    Play,
    Check,
    Tv,
    Star,
    Calendar,
    MessageSquare,
    RefreshCw,
    Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useMemo, useRef } from "react";
import { commentsService } from "@/services/firebase/comments.service";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedMovie } from "@/hooks/useTranslatedData";

interface Comment {
    name: string;
    message: string;
    time: number;
}

// Local storage key for watched episodes
const getWatchedKey = (animeSlug: string) => `watched_${animeSlug}`;

export default function AnimeInfo() {
    const { slug } = useParams<{ slug: string }>();
    const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(
        new Set()
    );
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Parallax scroll effect for backdrop
    const { scrollY } = useScroll();
    const yVideo = useTransform(scrollY, [0, 300], [0, 100]);
    const opacityVideo = useTransform(scrollY, [0, 300], [1, 0.5]);

    useEffect(() => {
        if (slug) {
            const stored = localStorage.getItem(getWatchedKey(slug));
            if (stored) {
                setWatchedEpisodes(new Set(JSON.parse(stored)));
            }
        }
    }, [slug]);

    // Load comments
    useEffect(() => {
        const loadComments = async () => {
            if (!slug) return;
            setIsLoadingComments(true);
            try {
                const firebaseComments = await commentsService.getComments(
                    `anime-${slug}`
                );
                setComments(firebaseComments);
            } catch (error) {
                console.error("Error loading comments:", error);
                try {
                    const raw = localStorage.getItem(`comments:anime:${slug}`);
                    setComments(raw ? JSON.parse(raw) : []);
                } catch {
                    setComments([]);
                }
            } finally {
                setIsLoadingComments(false);
            }
        };
        loadComments();
    }, [slug]);

    const addComment = async () => {
        const n = name.trim();
        const m = message.trim();
        if (!n || !m || !slug) return;

        setIsLoadingComments(true);
        try {
            const newComment = await commentsService.addComment(
                `anime-${slug}`,
                {
                    name: n,
                    message: m,
                }
            );
            setComments([newComment, ...comments]);
            const currentLocal = localStorage.getItem(`comments:anime:${slug}`);
            const localComments = currentLocal ? JSON.parse(currentLocal) : [];
            localStorage.setItem(
                `comments:anime:${slug}`,
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
            const fallbackComment = { name: n, message: m, time: Date.now() };
            const next = [fallbackComment, ...comments];
            setComments(next);
            localStorage.setItem(
                `comments:anime:${slug}`,
                JSON.stringify(next)
            );
            setName("");
            setMessage("");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const isNumericId = slug && /^\d+$/.test(slug);
    const { t, language } = useLanguage();

    const {
        data: animeData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["animeDetail", slug, language],
        queryFn: async () => {
            if (!slug) return null;
            if (isNumericId) return null;
            const detail = await movieAPI.getAnimeScraperDetail(slug);
            return detail;
        },
        enabled: !!slug,
    });

    // Auto-translate anime data when language is Indonesian
    const anime = useTranslatedMovie(animeData);

    const sortedEpisodes = useMemo(() => {
        if (!anime?.episodes) return [];
        return [...anime.episodes]
            .map((ep, index) => ({
                ...ep,
                // Extract episode number from title "Episode X" or use index + 1
                _epNum: (() => {
                    const match = ep.title.match(/Episode\s*(\d+)/i);
                    return match ? parseInt(match[1]) : index + 1;
                })()
            }))
            .sort((a, b) => a._epNum - b._epNum);
    }, [anime?.episodes]);

    const markAsWatched = (episodeSlug: string) => {
        if (!slug) return;
        const newWatched = new Set(watchedEpisodes);
        if (newWatched.has(episodeSlug)) {
            newWatched.delete(episodeSlug);
        } else {
            newWatched.add(episodeSlug);
        }
        setWatchedEpisodes(newWatched);
        localStorage.setItem(
            getWatchedKey(slug),
            JSON.stringify([...newWatched])
        );
    };

    const getStatusColor = (status?: string) => {
        if (status?.toLowerCase().includes("ongoing")) return "bg-green-500";
        if (status?.toLowerCase().includes("completed")) return "bg-blue-500";
        return "bg-primary";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="relative h-[30vh] sm:h-[40vh] w-full bg-muted animate-pulse" />
                <div className="container mx-auto px-4 -mt-24 sm:-mt-32 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-6">
                        <div className="aspect-[2/3] w-full max-w-[250px] mx-auto md:mx-0 rounded-xl bg-muted animate-pulse shadow-lg" />
                        <div className="space-y-4 pt-4 md:pt-8">
                            <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-1/2 bg-muted animate-pulse rounded" />
                            <div className="h-32 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !anime) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {isNumericId
                            ? t("tmdbAnimeError")
                            : t("failedToLoadAnimeDetails")}
                    </AlertDescription>
                </Alert>
                <Button asChild className="bg-primary hover:bg-primary">
                    <Link to="/anime">
                        <Tv className="h-4 w-4 mr-2" />
                        {t("viewAnimeList")}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Backdrop */}
            <div className="relative h-[65vh] sm:h-[75vh] md:h-[85vh] -mt-[72px] sm:-mt-24 lg:-mt-28 overflow-hidden bg-background">
                <div className="relative w-full h-full">
                    <img
                        src={anime.cover}
                        className="w-full h-full object-cover object-center"
                        alt={anime.title}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                        }}
                    />
                    {/* Improved Gradients for consistency */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-gradient-hero" />
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10 -mt-40 sm:-mt-56 md:-mt-64">
                <Breadcrumb className="mb-4 sm:mb-6 px-0" />
                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
                    {/* Poster */}
                    <div className="space-y-4">
                        <FadeIn delay={0.3} direction="up">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 max-w-[250px] lg:max-w-[300px] mx-auto md:mx-0">
                                <img
                                    src={anime.cover}
                                    alt={anime.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/placeholder.svg";
                                    }}
                                />
                                {anime.status && (
                                    <Badge
                                        className={`absolute top-3 right-3 ${getStatusColor(
                                            anime.status
                                        )} text-white text-xs`}
                                    >
                                        {anime.status}
                                    </Badge>
                                )}
                            </div>
                        </FadeIn>

                        {/* Quick Info - Mobile */}
                        <FadeIn
                            delay={0.4}
                            className="md:hidden bg-card/80 backdrop-blur rounded-lg border border-white/10 p-4"
                        >
                            <div className="grid grid-cols-3 gap-4 text-center">
                                {anime.rating && (
                                    <div>
                                        <Star className="h-4 w-4 mx-auto mb-1 text-primary" />
                                        <span className="text-sm font-medium">
                                            {anime.rating}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <Tv className="h-4 w-4 mx-auto mb-1 text-primary" />
                                    <span className="text-sm font-medium">
                                        {sortedEpisodes.length} Ep
                                    </span>
                                </div>
                                {anime.duration && (
                                    <div>
                                        <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                                        <span className="text-sm font-medium">
                                            {anime.duration}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {/* Title */}
                        <FadeIn delay={0.4} direction="left">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                                {anime.title}
                            </h1>
                        </FadeIn>

                        {/* Meta Info */}
                        <FadeIn delay={0.5} direction="left">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                                {anime.rating && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{anime.rating}</span>
                                    </div>
                                )}
                                {anime.releaseDate && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{anime.releaseDate}</span>
                                    </div>
                                )}
                                {anime.studio && (
                                    <div className="px-3 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground">
                                        {anime.studio}
                                    </div>
                                )}
                                <Badge
                                    variant="secondary"
                                    className="uppercase tracking-wider"
                                >
                                    Anime
                                </Badge>
                            </div>
                        </FadeIn>

                        {/* Genres */}
                        {anime.genre && anime.genre.length > 0 && (
                            <FadeIn delay={0.6} direction="left">
                                <div className="flex flex-wrap gap-2">
                                    {anime.genre.map((genre, i) => (
                                        <Badge
                                            key={i}
                                            variant="outline"
                                            className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer px-3 py-1"
                                        >
                                            {genre}
                                        </Badge>
                                    ))}
                                </div>
                            </FadeIn>
                        )}

                        {/* Synopsis */}
                        {anime.synopsis && (
                            <FadeIn delay={0.7} direction="up">
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                                        <span className="w-1 h-6 bg-primary rounded-full" />
                                        {t("synopsis")}
                                    </h2>
                                    <div className="relative group/synopsis">
                                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-3xl opacity-0 group-hover/synopsis:opacity-100 transition-opacity duration-500" />
                                        <p className="relative p-5 rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 text-muted-foreground leading-relaxed text-base sm:text-lg shadow-inner">
                                            {anime.synopsis}
                                        </p>
                                    </div>
                                </div>
                            </FadeIn>
                        )}

                        {/* Episodes */}
                        <div className="space-y-4">
                            <FadeIn delay={0.8} direction="up">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-1 h-6 bg-primary rounded-full" />
                                        {t("episodeList")}
                                    </h2>
                                    <span className="text-muted-foreground text-sm">
                                        {sortedEpisodes.length}{" "}
                                        {t("episodesCount")}
                                    </span>
                                </div>
                            </FadeIn>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sortedEpisodes.map((ep, i) => {
                                    // Use pre-computed episode number
                                    const episodeNum = ep._epNum;
                                    const isWatched = watchedEpisodes.has(
                                        ep.slug
                                    );

                                    return (
                                        <FadeIn
                                            key={ep.slug}
                                            delay={
                                                0.1 * (i % 5)
                                            } /* Stagger first few */
                                            direction="up"
                                            className="h-full"
                                        >
                                            <Link
                                                to={`/anime/watch/${ep.slug}`}
                                                className="block h-full"
                                            >
                                                <div
                                                    className={`group flex flex-row overflow-hidden rounded-lg border transition-all hover:scale-[1.01] hover:shadow-xl h-24 sm:h-28 ${
                                                        isWatched
                                                            ? "border-primary/30 bg-primary/10 hover:bg-primary/20"
                                                            : "border-border/50 bg-card hover:bg-accent/50"
                                                    }`}
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="relative w-32 sm:w-44 flex-shrink-0 overflow-hidden bg-gray-800">
                                                        <img
                                                            src={
                                                                anime.cover ||
                                                                "/placeholder.svg"
                                                            }
                                                            alt={`Episode ${episodeNum}`}
                                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    "/placeholder.svg";
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                                                        <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                                                            <Badge
                                                                className={`backdrop-blur border-white/10 text-[10px] sm:text-xs px-1.5 py-0 ${
                                                                    isWatched
                                                                        ? "bg-primary"
                                                                        : "bg-black/60"
                                                                }`}
                                                            >
                                                                {isWatched ? (
                                                                    <Check className="w-3 h-3" />
                                                                ) : (
                                                                    `EP ${episodeNum}`
                                                                )}
                                                            </Badge>
                                                        </div>

                                                    </div>
                                                    {/* Info */}
                                                    <div className="p-3 sm:p-4 flex flex-col justify-center flex-1 min-w-0">
                                                        <h3
                                                            className={`font-medium text-sm sm:text-base line-clamp-1 transition-colors ${
                                                                isWatched
                                                                    ? "text-primary"
                                                                    : "group-hover:text-primary"
                                                            }`}
                                                        >
                                                            Episode {episodeNum}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-muted-foreground">
                                                                {anime.title}
                                                            </span>
                                                        </div>
                                                        {isWatched && (
                                                            <span className="text-[10px] sm:text-xs text-primary mt-1">
                                                                ✓{" "}
                                                                {t(
                                                                    "alreadyWatched"
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Mark as watched button */}
                                                    <div className="flex items-center pr-2 sm:pr-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                markAsWatched(
                                                                    ep.slug
                                                                );
                                                            }}
                                                            className={`h-8 w-8 p-0 ${
                                                                isWatched
                                                                    ? "text-primary hover:bg-primary/20"
                                                                    : "text-muted-foreground hover:bg-white/10"
                                                            }`}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Link>
                                        </FadeIn>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <FadeIn delay={0.9} direction="up">
                            <div className="space-y-4 pt-10">
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
                                                    {message.length}/500{" "}
                                                    {t("characters")}
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
                                                            {t("posting")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-3.5 w-3.5 fill-current" />
                                                            {t("sendComment")}
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
                                                        {t("loadingComments")}
                                                    </p>
                                                </div>
                                            ) : comments.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-white/10 group/empty">
                                                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20 group-hover:opacity-40 transition-opacity" />
                                                    <p className="text-sm">{t("noCommentsYet")}</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4">
                                                    {comments.map((c, idx) => (
                                                        <FadeIn
                                                            key={`${c.time}-${idx}`}
                                                            direction="up"
                                                            delay={0.1}
                                                        >
                                                            <div className="p-5 rounded-2xl bg-muted/20 border border-white/5 space-y-3 transition-colors hover:bg-muted/30">
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
                                                        </FadeIn>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    );
}
