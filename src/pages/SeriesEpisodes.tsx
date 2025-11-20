import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Play,
    ArrowLeft,
    Grid,
    List,
    Search,
    Calendar,
    Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Episode, Movie } from "@/services/api"; 

interface SeasonDetail {
    id: number;
    name: string;
    cover?: string;
    episodeCount: number;
    year?: string;
}

export default function SeriesEpisodes() {
    const { id } = useParams<{ id: string }>();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSeason, setSelectedSeason] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"episode" | "newest" | "oldest">(
        "episode"
    );

    // ✅ Gunakan tipe 'Movie' karena 'Series' tidak didefinisikan
    const {
        data: series, // ❗️ Ini sebenarnya adalah objek 'Movie' dengan type: 'series'
        isLoading: seriesLoading,
        error: seriesError,
    } = useQuery<Movie, Error>({
        queryKey: ["series", id],
        queryFn: async () => {
            if (!id) throw new Error("Series ID is required");
            const response = await movieAPI.getSeriesById(id);
            if (!response) {
                throw new Error("Series not found");
            }
            // ❗️ Pastikan ini adalah series, bukan movie
            if (response.type !== "series") {
                throw new Error("Requested item is not a series");
            }
            return response;
        },
        enabled: !!id,
        retry: 2,
    });

    // Extract season details from series data
    // ✅ Akses 'seasons' dari `series.seasons`, tapi pastikan tipe `series` adalah `any` untuk mengakses properti TMDB
    const seasonDetails = useMemo(() => {
        // ❗️ Type assertion karena 'seasons' bukan bagian dari tipe `Movie`
        const tmdbData = series as any;
        if (!tmdbData?.seasons) return {};
        const details: Record<number, SeasonDetail> = {};
        tmdbData.seasons.forEach((s: any) => {
            if (s.season_number > 0) {
                details[s.season_number] = {
                    id: s.season_number,
                    name: s.name || `Season ${s.season_number}`,
                    cover: s.poster_path
                        ? `https://image.tmdb.org/t/p/w300${s.poster_path}`
                        : undefined,
                    episodeCount: s.episode_count || 0,
                    year: s.air_date ? s.air_date.substring(0, 4) : undefined,
                };
            }
        });
        return details;
    }, [series]);

    // Fetch episodes
    const {
        data: episodes = [],
        isLoading: episodesLoading,
        error: episodesError,
        refetch,
    } = useQuery<Episode[], Error>({
        queryKey: ["episodes", id],
        queryFn: async () => {
            if (!id) throw new Error("Series ID is required");
            const eps = await movieAPI.getEpisodes(id);

            if (!Array.isArray(eps)) {
                console.error("Episodes data is not an array:", eps);
                return [];
            }

            const validEpisodes = eps.filter(
                (ep) =>
                    ep &&
                    typeof ep.seasonNumber === "number" &&
                    typeof ep.episodeNumber === "number"
            );

            if (validEpisodes.length !== eps.length) {
                console.warn(
                    `Some episodes were filtered out due to invalid data.`
                );
            }

            return validEpisodes;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    // Gabungkan error dari kedua query jika perlu
    const error = seriesError || episodesError;

    // Group episodes by season
    const seasonGroups = useMemo(() => {
        const groups: Record<number, Episode[]> = {};

        episodes.forEach((ep) => {
            if (!ep || typeof ep.seasonNumber !== "number") return;

            if (!groups[ep.seasonNumber]) {
                groups[ep.seasonNumber] = [];
            }
            groups[ep.seasonNumber].push(ep);
        });

        Object.keys(groups).forEach((seasonNum) => {
            const season = Number(seasonNum);
            groups[season].sort((a, b) => {
                switch (sortBy) {
                    case "newest":
                        return b.episodeNumber - a.episodeNumber;
                    case "oldest":
                    case "episode":
                    default:
                        return a.episodeNumber - b.episodeNumber;
                }
            });
        });

        return groups;
    }, [episodes, sortBy]);

    const seasons = Object.keys(seasonGroups)
        .map(Number)
        .sort((a, b) => a - b);

    // Filter episodes
    const filteredEpisodes = useMemo(() => {
        let filtered = [...episodes];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (ep) =>
                    ep.title?.toLowerCase().includes(query) ||
                    `episode ${ep.episodeNumber}`.includes(query) ||
                    `s${ep.seasonNumber}e${ep.episodeNumber}`.includes(query)
            );
        }

        if (selectedSeason !== "all") {
            filtered = filtered.filter(
                (ep) => ep.seasonNumber === Number(selectedSeason)
            );
        }

        filtered.sort((a, b) => {
            if (a.seasonNumber !== b.seasonNumber) {
                return a.seasonNumber - b.seasonNumber;
            }
            switch (sortBy) {
                case "newest":
                    return b.episodeNumber - a.episodeNumber;
                case "oldest":
                case "episode":
                default:
                    return a.episodeNumber - b.episodeNumber;
            }
        });

        return filtered;
    }, [episodes, searchQuery, selectedSeason, sortBy]);

    // Stats
    const stats = useMemo(() => {
        const totalEpisodes = episodes.length;
        const totalSeasons = seasons.length;
        const episodesPerSeason =
            totalSeasons > 0 ? Math.round(totalEpisodes / totalSeasons) : 0;

        return {
            totalEpisodes,
            totalSeasons,
            episodesPerSeason,
        };
    }, [episodes, seasons]);

    const isLoading = seriesLoading || episodesLoading;

    if (!id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid series ID. Please go back and try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-10 w-32 mb-4" />
                <Skeleton className="h-32 w-full mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link to={`/series/${id}`}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Series
                    </Button>
                </Link>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load series or episodes.{" "}
                        {error.message || "An error occurred."}
                        <div className="mt-4 flex gap-2">
                            <Link to={`/series/${id}`}>
                                <Button variant="outline" size="sm">
                                    Back to Series Details
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                            >
                                Retry
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (episodes.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link to={`/series/${id}`}>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Series
                    </Button>
                </Link>
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No episodes available for this series. Episode data may
                        not be available yet in TMDB.
                        <div className="mt-4">
                            <Link to={`/series/${id}`}>
                                <Button variant="outline" size="sm">
                                    Back to Series Details
                                </Button>
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <Link to={`/series/${id}`}>
                    <Button variant="ghost" className="mb-4 -ml-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Series
                    </Button>
                </Link>

                {/* Series Info Card */}
                {series && (
                    <Card className="mb-6 bg-gradient-to-br from-background to-muted/20 border-muted">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <img
                                    src={series.cover || "/placeholder.svg"}
                                    alt={series.title}
                                    className="w-32 h-48 object-cover rounded-lg shadow-xl border border-border"
                                    onError={(e) => {
                                        const target =
                                            e.target as HTMLImageElement;
                                        target.src = "/placeholder.svg";
                                    }}
                                />

                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h1 className="text-4xl font-bold mb-3 tracking-tight">
                                            {series.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                                            {series.year && (
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {series.year}
                                                    </span>
                                                </div>
                                            )}
                                            {series.rating != null &&
                                                series.rating > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                        <span className="text-sm font-medium">
                                                            {series.rating.toFixed(
                                                                1
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            {series.genre &&
                                                series.genre.length > 0 && (
                                                    <div className="flex gap-2">
                                                        {series.genre
                                                            .slice(0, 3)
                                                            .map((g, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                    className="font-medium"
                                                                >
                                                                    {g}
                                                                </Badge>
                                                            ))}
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                {stats.totalEpisodes}
                                            </div>
                                            <div className="text-sm text-muted-foreground font-medium">
                                                Episodes
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-4xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                {stats.totalSeasons}
                                            </div>
                                            <div className="text-sm text-muted-foreground font-medium">
                                                Seasons
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-4xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                {stats.episodesPerSeason}
                                            </div>
                                            <div className="text-sm text-muted-foreground font-medium">
                                                Eps/Season
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    {episodes.length > 0 && (
                                        <div className="flex flex-wrap gap-3">
                                            <Link
                                                to={`/series/${id}/watch?season=${episodes[0].seasonNumber}&episode=${episodes[0].episodeNumber}`}
                                            >
                                                <Button
                                                    size="lg"
                                                    className="shadow-lg"
                                                >
                                                    <Play className="mr-2 h-5 w-5 fill-current" />
                                                    Watch First Episode
                                                </Button>
                                            </Link>
                                            {episodes.length > 1 && (
                                                <Link
                                                    to={`/series/${id}/watch?season=${
                                                        episodes[
                                                            episodes.length - 1
                                                        ].seasonNumber
                                                    }&episode=${
                                                        episodes[
                                                            episodes.length - 1
                                                        ].episodeNumber
                                                    }`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                    >
                                                        Watch Latest Episode
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Controls Bar */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            {/* Search */}
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search episodes..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 h-10"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Season Filter */}
                                <Select
                                    value={selectedSeason}
                                    onValueChange={setSelectedSeason}
                                >
                                    <SelectTrigger className="w-[140px] h-10">
                                        <SelectValue placeholder="All Seasons" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Seasons
                                        </SelectItem>
                                        {seasons.map((season) => (
                                            <SelectItem
                                                key={season}
                                                value={String(season)}
                                            >
                                                Season {season}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Sort */}
                                <Select
                                    value={sortBy}
                                    onValueChange={(v) =>
                                        setSortBy(
                                            v as "episode" | "newest" | "oldest"
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-[160px] h-10">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="episode">
                                            Episode Number
                                        </SelectItem>
                                        <SelectItem value="newest">
                                            Newest First
                                        </SelectItem>
                                        <SelectItem value="oldest">
                                            Oldest First
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View Mode */}
                                <div className="flex gap-1 border rounded-lg p-1 bg-muted/50">
                                    <Button
                                        variant={
                                            viewMode === "grid"
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={
                                            viewMode === "list"
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                        className="h-8 w-8 p-0"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {filteredEpisodes.length} of{" "}
                            {episodes.length} episodes
                            {searchQuery && ` matching "${searchQuery}"`}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Episodes Display */}
            {seasons.length > 1 && selectedSeason === "all" && !searchQuery ? (
                // Tabbed view by season
                <Tabs defaultValue={String(seasons[0])} className="w-full">
                    <div className="mb-6">
                        <ScrollArea className="w-full">
                            <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 w-auto">
                                {seasons.map((season) => {
                                    const seasonInfo = seasonDetails[season];
                                    return (
                                        <TabsTrigger
                                            key={season}
                                            value={String(season)}
                                            className="inline-flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                                        >
                                            <div className="flex flex-col items-center">
                                                {seasonInfo?.cover && (
                                                    <img
                                                        src={seasonInfo.cover}
                                                        alt={`Cover ${seasonInfo.name}`}
                                                        className="w-8 h-12 object-cover rounded mb-1"
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                )}
                                                <span>Season {season}</span>
                                                {seasonInfo?.episodeCount && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {
                                                            seasonInfo.episodeCount
                                                        }{" "}
                                                        eps
                                                    </span>
                                                )}
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="ml-1 text-xs"
                                            >
                                                {seasonGroups[season].length}
                                            </Badge>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </ScrollArea>
                    </div>

                    {seasons.map((season) => {
                        const seasonInfo = seasonDetails[season];
                        return (
                            <TabsContent
                                key={season}
                                value={String(season)}
                                className="mt-0"
                            >
                                {/* Info Card for Season */}
                                {seasonInfo && (
                                    <Card className="mb-4">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                {seasonInfo.cover && (
                                                    <img
                                                        src={seasonInfo.cover}
                                                        alt={`Cover ${seasonInfo.name}`}
                                                        className="w-16 h-24 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <h3 className="text-xl font-bold">
                                                        {seasonInfo.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            seasonInfo.episodeCount
                                                        }{" "}
                                                        Episodes •{" "}
                                                        {seasonInfo.year}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {viewMode === "grid" ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {seasonGroups[season].map((episode) => (
                                            <Link
                                                key={episode.id}
                                                to={`/series/${id}/watch?season=${episode.seasonNumber}&episode=${episode.episodeNumber}`}
                                            >
                                                <EpisodeCard
                                                    episode={episode}
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {seasonGroups[season].map((episode) => (
                                            <Link
                                                key={episode.id}
                                                to={`/series/${id}/watch?season=${episode.seasonNumber}&episode=${episode.episodeNumber}`}
                                            >
                                                <EpisodeListItem
                                                    episode={episode}
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        );
                    })}
                </Tabs>
            ) : (
                // Regular view (filtered/searched results)
                <>
                    {filteredEpisodes.length === 0 ? (
                        <Card>
                            <CardContent className="py-16">
                                <div className="text-center text-muted-foreground">
                                    <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-xl font-semibold mb-2">
                                        No episodes found
                                    </p>
                                    <p className="text-sm mb-6">
                                        Try adjusting your search or filters
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedSeason("all");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredEpisodes.map((episode) => (
                                <Link
                                    key={episode.id}
                                    to={`/series/${id}/watch?season=${episode.seasonNumber}&episode=${episode.episodeNumber}`}
                                >
                                    <EpisodeCard episode={episode} showSeason />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredEpisodes.map((episode) => (
                                <Link
                                    key={episode.id}
                                    to={`/series/${id}/watch?season=${episode.seasonNumber}&episode=${episode.episodeNumber}`}
                                >
                                    <EpisodeListItem episode={episode} />
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Episode Card Component
function EpisodeCard({
    episode,
    showSeason = false,
}: {
    episode: Episode;
    showSeason?: boolean;
}) {
    return (
        <Card className="overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full border-muted">
            <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                    src={episode.cover || "/placeholder.svg"}
                    alt={episode.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                        <Play className="h-6 w-6 text-primary-foreground fill-current" />
                    </div>
                </div>
                <Badge className="absolute top-2 left-2 font-semibold shadow-lg bg-red-600 hover:bg-red-600">
                    {showSeason ? `S${episode.seasonNumber} ` : ""}EP{" "}
                    {episode.episodeNumber}
                </Badge>
            </div>
            <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight">
                    {episode.title || `Episode ${episode.episodeNumber}`}
                </h3>
                <p className="text-xs text-muted-foreground">
                    Season {episode.seasonNumber} • Episode{" "}
                    {episode.episodeNumber}
                </p>
            </CardContent>
        </Card>
    );
}

// Episode List Item Component
function EpisodeListItem({ episode }: { episode: Episode }) {
    return (
        <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-40 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                            src={episode.cover || "/placeholder.svg"}
                            alt={episode.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                    {episode.title ||
                                        `Episode ${episode.episodeNumber}`}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Season {episode.seasonNumber} • Episode{" "}
                                    {episode.episodeNumber}
                                </p>
                            </div>
                            <Badge variant="outline" className="font-semibold">
                                S{episode.seasonNumber}E{episode.episodeNumber}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
