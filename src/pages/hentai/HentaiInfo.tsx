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
    Clock,
    MessageSquare,
    RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useMemo } from "react";
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

const getWatchedKey = (hentaiSlug: string) => `watched_hentai_${hentaiSlug}`;

const extractBaseTitle = (title: string): string => {
    return title
        .replace(/\s*[-–]\s*episode\s*\d+/gi, "")
        .replace(/\s*episode\s*\d+/gi, "")
        .replace(/\s*ep\s*\d+/gi, "")
        .replace(/\s*[-–]\s*\d+\s*$/gi, "")
        .replace(/\s*subtitle\s*indonesia/gi, "")
        .replace(/\s*sub\s*indo/gi, "")
        .trim();
};

const extractEpisodeNumber = (title: string): number => {
    const match =
        title.match(/episode\s*(\d+)/i) ||
        title.match(/ep\s*(\d+)/i) ||
        title.match(/[-–]\s*(\d+)\s*$/);
    return match ? parseInt(match[1]) : 1;
};

export default function HentaiInfo() {
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
                    `hentai-${slug}`
                );
                setComments(firebaseComments);
            } catch (error) {
                console.error("Error loading comments:", error);
                try {
                    const raw = localStorage.getItem(`comments:hentai:${slug}`);
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
                `hentai-${slug}`,
                {
                    name: n,
                    message: m,
                }
            );
            setComments([newComment, ...comments]);
            const currentLocal = localStorage.getItem(
                `comments:hentai:${slug}`
            );
            const localComments = currentLocal ? JSON.parse(currentLocal) : [];
            localStorage.setItem(
                `comments:hentai:${slug}`,
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
                `comments:hentai:${slug}`,
                JSON.stringify(next)
            );
            setName("");
            setMessage("");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const { t, language } = useLanguage();

    const isNumericId = !isNaN(Number(slug));

    const {
        data: hentaiData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["hentaiDetail", slug, language],
        queryFn: async () => {
            if (!slug) return null;
            return await movieAPI.getNekopoiDetail(slug);
        },
        enabled: !!slug,
    });

    // Auto-translate hentai data when language is Indonesian
    const hentaiDetail = useTranslatedMovie(hentaiData);

    const { data: allHentai } = useQuery({
        queryKey: ["allHentaiForEpisodes", language],
        queryFn: async () => {
            const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const results = await Promise.all(
                pages.map((p) => movieAPI.getAllHentaiLatest(p))
            );
            return results.flatMap((r) => r.nekopoi.data);
        },
        staleTime: 5 * 60 * 1000,
    });

    const relatedEpisodes = useMemo(() => {
        if (!hentaiDetail || !allHentai) return [];
        const baseTitle = extractBaseTitle(hentaiDetail.title);
        const episodes = allHentai.filter((item) => {
            const itemBaseTitle = extractBaseTitle(item.title);
            return itemBaseTitle.toLowerCase() === baseTitle.toLowerCase();
        });
        return episodes.sort(
            (a, b) =>
                extractEpisodeNumber(a.title) - extractEpisodeNumber(b.title)
        );
    }, [hentaiDetail, allHentai]);

    const markAsWatched = (episodeId: string) => {
        if (!slug) return;
        const newWatched = new Set(watchedEpisodes);
        if (newWatched.has(episodeId)) {
            newWatched.delete(episodeId);
        } else {
            newWatched.add(episodeId);
        }
        setWatchedEpisodes(newWatched);
        localStorage.setItem(
            getWatchedKey(slug),
            JSON.stringify([...newWatched])
        );
    };

    const getCoverUrl = (cover: string | undefined) => {
        if (!cover || cover === "/placeholder.svg" || cover === "")
            return "/placeholder.svg";
        if (!cover.startsWith("http")) return "/placeholder.svg";
        return cover;
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

    if (error || !hentaiDetail) {
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
                    <Link to="/hentai">
                        <Tv className="h-4 w-4 mr-2" />
                        {t('returnHome')}
                    </Link>
                </Button>
            </div>
        );
    }

    const baseTitle = extractBaseTitle(hentaiDetail.title);
    const totalEpisodes = relatedEpisodes.length || 1;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Backdrop */}
            <div className="relative h-[65vh] sm:h-[75vh] md:h-[85vh] -mt-[72px] sm:-mt-24 lg:-mt-28 overflow-hidden bg-background">
                <div className="relative w-full h-full">
                    <img
                        src={getCoverUrl(hentaiDetail.cover)}
                        className="w-full h-full object-cover object-center"
                        alt={baseTitle}
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
                                    src={getCoverUrl(hentaiDetail.cover)}
                                    alt={baseTitle}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/placeholder.svg";
                                    }}
                                />
                                <Badge className="absolute top-3 right-3 bg-primary text-white text-xs">
                                    Hentai
                                </Badge>
                            </div>
                        </FadeIn>

                        {/* Quick Info - Mobile */}
                        <FadeIn
                            delay={0.4}
                            className="md:hidden bg-card/80 backdrop-blur rounded-lg border border-white/10 p-4"
                        >
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <Tv className="h-4 w-4 mx-auto mb-1 text-primary" />
                                    <span className="text-sm font-medium">
                                        {totalEpisodes} Ep
                                    </span>
                                </div>
                                {hentaiDetail.duration && (
                                    <div>
                                        <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                                        <span className="text-sm font-medium">
                                            {hentaiDetail.duration}
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
                                {baseTitle}
                            </h1>
                        </FadeIn>

                        {/* Meta Info */}
                        <FadeIn delay={0.5} direction="left">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                                    <Tv className="h-3.5 w-3.5" />
                                    <span>{totalEpisodes} {t('episodesCount')}</span>
                                </div>
                                {hentaiDetail.duration && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{hentaiDetail.duration}</span>
                                    </div>
                                )}
                                <Badge
                                    variant="secondary"
                                    className="bg-primary text-white uppercase tracking-wider"
                                >
                                    Hentai
                                </Badge>
                            </div>
                        </FadeIn>

                        {/* Genres */}
                        {hentaiDetail.genre &&
                            hentaiDetail.genre.length > 0 && (
                                <FadeIn delay={0.6} direction="left">
                                    <div className="flex flex-wrap gap-2">
                                        {hentaiDetail.genre.map((genre, i) => (
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
                        <FadeIn delay={0.7} direction="up">
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    {t('synopsis')}
                                </h2>
                                <div className="relative group/synopsis">
                                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-3xl opacity-0 group-hover/synopsis:opacity-100 transition-opacity duration-500" />
                                    <p className="relative p-5 rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 text-muted-foreground leading-relaxed text-base sm:text-lg shadow-inner">
                                        {hentaiDetail.synopsis ||
                                            t('noCategoryFound').replace('{category}', 'Hentai')}
                                    </p>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Episodes */}
                        <div className="space-y-4">
                            <FadeIn delay={0.8} direction="up">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-1 h-6 bg-primary rounded-full" />
                                        {t('episodeList')}
                                    </h2>
                                    <span className="text-muted-foreground text-sm">
                                        {totalEpisodes} {t('episodesCount')}
                                    </span>
                                </div>
                            </FadeIn>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {relatedEpisodes.length > 0 ? (
                                    relatedEpisodes.map((ep, i) => {
                                        const episodeNum = extractEpisodeNumber(
                                            ep.title
                                        );
                                        const isWatched = watchedEpisodes.has(
                                            ep.id
                                        );

                                        return (
                                            <FadeIn
                                                key={ep.id}
                                                delay={0.1 * (i % 5)}
                                                direction="up"
                                                className="h-full"
                                            >
                                                <Link
                                                    to={`/hentai/watch/${ep.id}`}
                                                    className="block h-full"
                                                >
                                                    <div
                                                        className={`group flex flex-row overflow-hidden rounded-lg border transition-all hover:scale-[1.01] hover:shadow-xl h-24 sm:h-28 ${
                                                            isWatched
                                                                ? "border-primary/30 bg-primary/10 hover:bg-primary/20"
                                                                : "border-border/50 bg-card hover:bg-accent"
                                                        }`}
                                                    >
                                                        {/* Thumbnail */}
                                                        <div className="relative w-32 sm:w-44 flex-shrink-0 overflow-hidden bg-gray-800">
                                                            <img
                                                                src={getCoverUrl(
                                                                    hentaiDetail.cover
                                                                )}
                                                                alt={`Episode ${episodeNum}`}
                                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                                referrerPolicy="no-referrer"
                                                                onError={(
                                                                    e
                                                                ) => {
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
                                                                    {t('episode')}{" "}
                                                                    {episodeNum}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                                    {baseTitle}
                                                                </span>
                                                            </div>
                                                            {isWatched && (
                                                                <span className="text-[10px] sm:text-xs text-primary mt-1">
                                                                    ✓ {t('alreadyWatched')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Mark as watched button */}
                                                        <div className="flex items-center pr-2 sm:pr-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    markAsWatched(
                                                                        ep.id
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
                                    })
                                ) : (
                                    <FadeIn
                                        delay={0.9}
                                        direction="up"
                                        className="h-full"
                                    >
                                        <Link
                                            to={`/hentai/watch/${slug}`}
                                            className="block h-full"
                                        >
                                            <div className="group flex flex-row overflow-hidden rounded-lg border border-border/50 bg-card hover:bg-accent transition-all hover:scale-[1.01] hover:shadow-xl h-24 sm:h-28">
                                                {/* Thumbnail */}
                                                <div className="relative w-32 sm:w-44 flex-shrink-0 overflow-hidden bg-gray-800">
                                                    <img
                                                        src={getCoverUrl(
                                                            hentaiDetail.cover
                                                        )}
                                                        alt={`Episode ${extractEpisodeNumber(
                                                            hentaiDetail.title
                                                        )}`}
                                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "/placeholder.svg";
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                                                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                                                        <Badge className="bg-black/60 backdrop-blur border-white/10 text-[10px] sm:text-xs px-1.5 py-0">
                                                            EP{" "}
                                                            {extractEpisodeNumber(
                                                                hentaiDetail.title
                                                            )}
                                                        </Badge>
                                                    </div>

                                                </div>
                                                {/* Info */}
                                                <div className="p-3 sm:p-4 flex flex-col justify-center flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                                                        Episode{" "}
                                                        {extractEpisodeNumber(
                                                            hentaiDetail.title
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {baseTitle}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </FadeIn>
                                )}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <FadeIn delay={0.9} direction="up">
                            <div className="space-y-4 pt-10">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    {t('comments')}
                                </h2>
                                <Card className="bg-card/50 backdrop-blur-sm border-white/5 overflow-hidden shadow-xl">
                                    <CardContent className="p-6 space-y-8">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <Input
                                                    placeholder={t('yourName')}
                                                    value={name}
                                                    onChange={(e) =>
                                                        setName(e.target.value)
                                                    }
                                                    maxLength={50}
                                                    className="bg-background/50 border-white/10 focus:border-primary/50 h-11"
                                                />
                                                <Textarea
                                                    placeholder={t('writeComment')}
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
                                                    {message.length}/500
                                                    karakter
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
                                                            {t('posting')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-3.5 w-3.5 fill-current" />
                                                            {t('sendComment')}
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
                                                        {t('loadingComments')}
                                                    </p>
                                                </div>
                                            ) : comments.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-white/10 group/empty">
                                                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20 group-hover:opacity-40 transition-opacity" />
                                                    <p className="text-sm">
                                                        Belum ada komentar.
                                                        Jadilah yang pertama!
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4">
                                                    {comments.map((c, idx) => (
                                                        <FadeIn
                                                            key={`${c.time}-${idx}`}
                                                            delay={0.1}
                                                            direction="up"
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
