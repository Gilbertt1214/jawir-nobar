import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    AlertCircle,
    Calendar,
    Clock,
    Play,
    Tag,
    Layers,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonGrid } from "@/components/SkeletonCard";

export default function AnimeInfo() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const {
        data: anime,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["animeDetail", slug],
        queryFn: () => movieAPI.getAnimeScraperDetail(slug!),
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <Button variant="ghost" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                    <div className="md:col-span-2 space-y-4">
                        <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                        <div className="h-32 bg-muted animate-pulse rounded" />
                        <SkeletonGrid count={3} />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !anime) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load anime details. Please try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6 hover:bg-white/10"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                {/* Sidebar: Poster & Info */}
                <div className="space-y-6">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                        <img
                            src={anime.cover}
                            alt={anime.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                            }}
                        />
                    </div>

                    <Card className="bg-card/50 backdrop-blur border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Anime Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {anime.status && (
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {anime.status}
                                    </Badge>
                                </div>
                            )}
                            {anime.studio && (
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-muted-foreground">Studio</span>
                                    <span className="text-right truncate ml-4">
                                        {anime.studio}
                                    </span>
                                </div>
                            )}
                            {anime.releaseDate && (
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-muted-foreground">Released</span>
                                    <span className="text-right">{anime.releaseDate}</span>
                                </div>
                            )}
                            {anime.duration && (
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="text-right">{anime.duration}</span>
                                </div>
                            )}
                            {anime.totalEpisodes && (
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-muted-foreground">Episodes</span>
                                    <span className="text-right">{anime.totalEpisodes}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            {anime.title}
                        </h1>

                        <div className="flex flex-wrap gap-2">
                            {anime.genre && Array.isArray(anime.genre) && anime.genre.length > 0 ? (
                                anime.genre.map((genre, i) => (
                                    <Badge key={i} variant="outline" className="border-primary/50 text-primary">
                                       <Tag className="w-3 h-3 mr-1" /> {genre}
                                    </Badge>
                                ))
                            ) : null}
                        </div>
                    </div>

                    {/* Synopsis */}
                    <Card className="bg-card/50 backdrop-blur border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" />
                                Synopsis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {anime.synopsis}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Episode List */}
                    <div className="space-y-4">
                         <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Play className="w-6 h-6 text-primary" />
                            Episodes
                        </h2>
                        
                        <Card className="bg-card/50 backdrop-blur border-white/10">
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px]">
                                    <div className="divide-y divide-white/5">
                                        {anime.episodes.map((ep, i) => (
                                            <div
                                                key={i}
                                                className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {anime.episodes.length - i}
                                                    </div>
                                                    <span className="font-medium group-hover:text-primary transition-colors">
                                                        {ep.title}
                                                    </span>
                                                </div>
                                                <Button asChild size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link to={`/anime/watch/${ep.slug}`}>
                                                        Watch
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
