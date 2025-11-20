import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Film,
    Star,
    Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Episode {
    id: string;
    title: string;
    episodeNumber: number;
    seasonNumber: number;
    cover: string;
    streamUrl: string;
}

export default function SeriesEpisodes() {
    const { id } = useParams<{ id: string }>();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSeason, setSelectedSeason] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"episode" | "newest" | "oldest">(
        "episode"
    );

    // Fetch series details
    const { data: series, isLoading: seriesLoading } = useQuery({
        queryKey: ["series", id],
        queryFn: async () => {
            console.log("Fetching series details for ID:", id);
            const result = await movieAPI.getSeriesById(id!);
            console.log("Series details:", result);
            return result;
        },
        enabled: !!id,
    });

    // Fetch episodes
    const {
        data: episodes = [],
        isLoading: episodesLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["episodes", id],
        queryFn: async () => {
            console.log("=== START FETCHING EPISODES ===");
            console.log("Series ID:", id);
            try {
                const eps = await movieAPI.getEpisodes(id!);
                console.log("Total episodes fetched:", eps.length);
                console.log("Raw episodes data:", eps);
                console.log(
                    "Episodes by season:",
                    eps.reduce((acc: any, ep) => {
                        acc[ep.seasonNumber] = (acc[ep.seasonNumber] || 0) + 1;
                        return acc;
                    }, {})
                );
                console.log("=== END FETCHING EPISODES ===");
                return eps;
            } catch (err) {
                console.error("Error fetching episodes:", err);
                throw err;
            }
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });

    // Group episodes by season
    const seasonGroups = useMemo(() => {
        const groups: Record<number, Episode[]> = {};
        episodes.forEach((ep) => {
            if (!groups[ep.seasonNumber]) {
                groups[ep.seasonNumber] = [];
            }
            groups[ep.seasonNumber].push(ep);
        });

        // Sort episodes within each season
        Object.keys(groups).forEach((season) => {
            groups[Number(season)].sort((a, b) => {
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

    // Filter episodes based on search and season
    const filteredEpisodes = useMemo(() => {
        let filtered = [...episodes];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (ep) =>
                    ep.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    `episode ${ep.episodeNumber}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    `s${ep.seasonNumber}e${ep.episodeNumber}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        // Filter by season
        if (selectedSeason !== "all") {
            filtered = filtered.filter(
                (ep) => ep.seasonNumber === Number(selectedSeason)
            );
        }

        // Sort episodes
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

    // Stats calculation
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

    // Debug info
    console.log("=== COMPONENT STATE ===");
    console.log("Series ID:", id);
    console.log("Is Loading:", isLoading);
    console.log("Series Loading:", seriesLoading);
    console.log("Episodes Loading:", episodesLoading);
    console.log("Episodes count:", episodes.length);
    console.log("Has error:", !!error);
    console.log("Error:", error);
    console.log("======================");

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-4 text-muted-foreground">
                    Loading episodes...
                </div>
                <Skeleton className="h-10 w-32 mb-4" />
                <Skeleton className="h-32 w-full mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !episodes || episodes.length === 0) {
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
                        {episodes?.length === 0
                            ? "Tidak ada episode yang tersedia untuk series ini. Mungkin data episode belum tersedia di TMDB."
                            : "Gagal memuat episode. Silakan coba lagi."}
                        <div className="mt-4 flex gap-2">
                            <Link to={`/series/${id}`}>
                                <Button variant="outline" size="sm">
                                    Kembali ke detail series
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                            >
                                Coba Lagi
                            </Button>
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

                {/* Series Info Card - Refined */}
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
                                            {series.rating && (
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
                                                            .map((g) => (
                                                                <Badge
                                                                    key={g}
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

                                    {/* Stats - Improved Design */}
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

                {/* Controls Bar - Refined */}
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
                                    onValueChange={(v) => setSortBy(v as any)}
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
                // Tabbed view by season - Refined Tabs
                <Tabs defaultValue={String(seasons[0])} className="w-full">
                    <div className="mb-6">
                        <ScrollArea className="w-full">
                            <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 w-auto">
                                {seasons.map((season) => (
                                    <TabsTrigger
                                        key={season}
                                        value={String(season)}
                                        className="inline-flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                                    >
                                        Season {season}
                                        <Badge
                                            variant="secondary"
                                            className="ml-1 text-xs"
                                        >
                                            {seasonGroups[season].length}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>
                    </div>

                    {seasons.map((season) => (
                        <TabsContent
                            key={season}
                            value={String(season)}
                            className="mt-0"
                        >
                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {seasonGroups[season].map((episode) => (
                                        <Link
                                            key={episode.id}
                                            to={`/series/${id}/watch?season=${episode.seasonNumber}&episode=${episode.episodeNumber}`}
                                        >
                                            <Card className="overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full border-muted">
                                                <div className="relative aspect-video overflow-hidden bg-muted">
                                                    <img
                                                        src={
                                                            episode.cover ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={episode.title}
                                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.src =
                                                                "/placeholder.svg";
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                                                            <Play className="h-6 w-6 text-primary-foreground fill-current" />
                                                        </div>
                                                    </div>
                                                    <Badge className="absolute top-2 left-2 font-semibold shadow-lg bg-red-600 hover:bg-red-600">
                                                        EP{" "}
                                                        {episode.episodeNumber}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-3">
                                                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight">
                                                        {episode.title ||
                                                            `Episode ${episode.episodeNumber}`}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Season{" "}
                                                        {episode.seasonNumber} •
                                                        Episode{" "}
                                                        {episode.episodeNumber}
                                                    </p>
                                                </CardContent>
                                            </Card>
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
                                            <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-40 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                                            <img
                                                                src={
                                                                    episode.cover ||
                                                                    "/placeholder.svg"
                                                                }
                                                                alt={
                                                                    episode.title
                                                                }
                                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    const target =
                                                                        e.target as HTMLImageElement;
                                                                    target.src =
                                                                        "/placeholder.svg";
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
                                                                        Season{" "}
                                                                        {
                                                                            episode.seasonNumber
                                                                        }{" "}
                                                                        •
                                                                        Episode{" "}
                                                                        {
                                                                            episode.episodeNumber
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="font-semibold"
                                                                >
                                                                    S
                                                                    {
                                                                        episode.seasonNumber
                                                                    }
                                                                    E
                                                                    {
                                                                        episode.episodeNumber
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    ))}
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
                                    <Card className="overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full border-muted">
                                        <div className="relative aspect-video overflow-hidden bg-muted">
                                            <img
                                                src={
                                                    episode.cover ||
                                                    "/placeholder.svg"
                                                }
                                                alt={episode.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.src =
                                                        "/placeholder.svg";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                                                    <Play className="h-6 w-6 text-primary-foreground fill-current" />
                                                </div>
                                            </div>
                                            <Badge className="absolute top-2 left-2 font-semibold shadow-lg bg-red-600 hover:bg-red-600">
                                                S{episode.seasonNumber} EP
                                                {episode.episodeNumber}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight">
                                                {episode.title ||
                                                    `Episode ${episode.episodeNumber}`}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Season {episode.seasonNumber} •
                                                Episode {episode.episodeNumber}
                                            </p>
                                        </CardContent>
                                    </Card>
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
                                    <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-40 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    <img
                                                        src={
                                                            episode.cover ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={episode.title}
                                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.src =
                                                                "/placeholder.svg";
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
                                                                Season{" "}
                                                                {
                                                                    episode.seasonNumber
                                                                }{" "}
                                                                • Episode{" "}
                                                                {
                                                                    episode.episodeNumber
                                                                }
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className="font-semibold"
                                                        >
                                                            S
                                                            {
                                                                episode.seasonNumber
                                                            }
                                                            E
                                                            {
                                                                episode.episodeNumber
                                                            }
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
