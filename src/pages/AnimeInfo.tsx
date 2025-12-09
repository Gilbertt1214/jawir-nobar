import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    AlertCircle,
    Play,
    BookOpen,
    Check,
    Tv,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useMemo } from "react";

// Local storage key for watched episodes
const getWatchedKey = (animeSlug: string) => `watched_${animeSlug}`;

export default function AnimeInfo() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(
        new Set()
    );

    // Load watched episodes from localStorage
    useEffect(() => {
        if (slug) {
            const stored = localStorage.getItem(getWatchedKey(slug));
            if (stored) {
                setWatchedEpisodes(new Set(JSON.parse(stored)));
            }
        }
    }, [slug]);

    // Detect if slug is numeric (Jikan/MAL) or string (Wajik/Otakudesu)
    const isNumericId = slug && /^\d+$/.test(slug);

    const {
        data: anime,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["animeDetail", slug],
        queryFn: async () => {
            if (!slug) return null;

            if (isNumericId) {
                return movieAPI.getAnimeDetail(slug);
            }

            console.log("Fetching anime detail from Otakudesu API:", slug);
            const otakudesuDetail = await movieAPI.getAnimeScraperDetail(slug);
            if (otakudesuDetail) {
                console.log("✅ Otakudesu API success:", otakudesuDetail.title);
                return otakudesuDetail;
            }

            const searchQuery = slug
                .replace(/-sub-indo$/, "")
                .replace(/-/g, " ")
                .trim();
            console.log("Otakudesu failed, searching Jikan for:", searchQuery);
            const searchResults = await movieAPI.searchAnime(searchQuery);

            if (searchResults && searchResults.length > 0) {
                const firstResult = searchResults[0];
                return movieAPI.getAnimeDetail(firstResult.id);
            }

            return null;
        },
        enabled: !!slug,
    });

    // Sort episodes from 1 to latest (ascending order)
    const sortedEpisodes = useMemo(() => {
        if (!anime?.episodes) return [];
        return [...anime.episodes].sort((a, b) => {
            const numA = parseInt(a.title.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.title.match(/\d+/)?.[0] || "0");
            return numA - numB;
        });
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

    // Get status badge color
    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("ongoing") || s.includes("airing")) {
            return "bg-green-500 text-white";
        }
        if (s.includes("completed") || s.includes("finished")) {
            return "bg-red-500 text-white";
        }
        return "bg-gray-500 text-white";
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" disabled className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                    <div className="space-y-4">
                        <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                        <div className="h-32 bg-muted animate-pulse rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <div className="h-10 w-3/4 bg-muted animate-pulse rounded-lg" />
                        <div className="h-6 w-1/2 bg-muted animate-pulse rounded-lg" />
                        <div className="h-40 bg-muted animate-pulse rounded-lg" />
                        <div className="h-64 bg-muted animate-pulse rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !anime) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Gagal memuat detail anime. Silakan coba lagi.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 md:py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 hover:bg-white/10 gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
                    {/* Left Column - Poster & Info */}
                    <div className="space-y-4">
                        {/* Poster */}
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl mx-auto lg:mx-0 max-w-[280px]">
                            <img
                                src={anime.cover}
                                alt={anime.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                }}
                            />
                        </div>

                        {/* Anime Info Box */}
                        <div className="bg-card/80 backdrop-blur rounded-lg border border-white/10 overflow-hidden max-w-[280px] mx-auto lg:mx-0">
                            <div className="bg-red-600 px-4 py-3">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Tv className="w-4 h-4" />
                                    Anime Info
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Status
                                    </span>
                                    <Badge
                                        className={`${getStatusColor(
                                            anime.status || "Unknown"
                                        )} text-xs font-medium rounded-md`}
                                    >
                                        {anime.status || "Unknown"}
                                    </Badge>
                                </div>

                                {/* Episodes */}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Episode
                                    </span>
                                    <span className="text-white font-medium text-sm">
                                        {anime.totalEpisodes ||
                                            sortedEpisodes.length ||
                                            "?"}
                                    </span>
                                </div>

                                {/* Studio */}
                                {anime.studio && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm">
                                            Studio
                                        </span>
                                        <span className="text-white font-medium text-sm truncate ml-2 max-w-[140px]">
                                            {anime.studio}
                                        </span>
                                    </div>
                                )}

                                {/* Duration */}
                                {anime.duration && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm">
                                            Durasi
                                        </span>
                                        <span className="text-white font-medium text-sm">
                                            {anime.duration}
                                        </span>
                                    </div>
                                )}

                                {/* Release Date */}
                                {anime.releaseDate && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm">
                                            Rilis
                                        </span>
                                        <span className="text-white font-medium text-sm">
                                            {anime.releaseDate}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Title, Genre, Synopsis, Episodes */}
                    <div className="space-y-6">
                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                            {anime.title}
                        </h1>

                        {/* Genre Pills */}
                        {anime.genre && anime.genre.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {anime.genre.map((genre, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-full"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Synopsis Box */}
                        <div className="bg-card/80 backdrop-blur rounded-lg border border-white/10 overflow-hidden">
                            <div className="bg-red-600 px-4 py-3">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Sinopsis
                                </h3>
                            </div>
                            <div className="p-4">
                                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                    {anime.synopsis ||
                                        "Sinopsis tidak tersedia."}
                                </p>
                            </div>
                        </div>

                        {/* Episode List */}
                        <div className="bg-card/80 backdrop-blur rounded-lg border border-white/10 overflow-hidden">
                            <div className="bg-red-600 px-4 py-3 flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Daftar Episode
                                </h3>
                                <span className="text-white/80 text-sm">
                                    {sortedEpisodes.length} Episode
                                </span>
                            </div>
                            <ScrollArea className="h-[400px] md:h-[450px]">
                                <div className="divide-y divide-white/5">
                                    {sortedEpisodes.map((ep, i) => {
                                        const episodeNum = parseInt(
                                            ep.title.match(/\d+/)?.[0] ||
                                                String(i + 1)
                                        );
                                        const isWatched = watchedEpisodes.has(
                                            ep.slug
                                        );

                                        return (
                                            <div
                                                key={ep.slug}
                                                className={`flex items-center gap-4 p-4 transition-colors group cursor-pointer ${
                                                    isWatched
                                                        ? "bg-green-500/10 hover:bg-green-500/20"
                                                        : "hover:bg-white/5"
                                                }`}
                                            >
                                                {/* Episode Number Circle */}
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                                                        isWatched
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-600 text-white group-hover:bg-red-500"
                                                    }`}
                                                >
                                                    {isWatched ? (
                                                        <Check className="w-5 h-5" />
                                                    ) : (
                                                        episodeNum
                                                    )}
                                                </div>

                                                {/* Episode Title */}
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/anime/watch/${ep.slug}`}
                                                        className={`font-medium transition-colors block truncate ${
                                                            isWatched
                                                                ? "text-green-400 hover:text-green-300"
                                                                : "text-white group-hover:text-red-400"
                                                        }`}
                                                    >
                                                        Episode {episodeNum}
                                                    </Link>
                                                    {isWatched && (
                                                        <span className="text-xs text-green-500">
                                                            Sudah ditonton
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            markAsWatched(
                                                                ep.slug
                                                            );
                                                        }}
                                                        className={`h-8 px-2 ${
                                                            isWatched
                                                                ? "text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                                                : "text-muted-foreground hover:text-white hover:bg-white/10"
                                                        }`}
                                                        title={
                                                            isWatched
                                                                ? "Tandai belum ditonton"
                                                                : "Tandai sudah ditonton"
                                                        }
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        className="bg-red-600 hover:bg-red-500 text-white h-8 px-3 rounded-lg"
                                                    >
                                                        <Link
                                                            to={`/anime/watch/${ep.slug}`}
                                                        >
                                                            <Play className="w-3 h-3 mr-1" />
                                                            Tonton
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
