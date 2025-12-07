import { useParams, Link, useMatch } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    Download,
    Tv,
    ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { commentsService } from "@/services/firebase/comments.service";
import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
};

const fadeInRight = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
};

const fadeInLeft = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
    }
};

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

    const {
        data: movie,
        isLoading,
        error,
    } = useQuery({
        queryKey: [isSeriesRoute ? "series" : "movie", id],
        queryFn: () =>
            isSeriesRoute
                ? movieAPI.getSeriesById(id!)
                : movieAPI.getMovieById(id!),
        enabled: !!id,
    });

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
                    movie.type
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
                        Movie or series not found or failed to load.
                        <Link to="/" className="ml-2 underline block mt-2 font-medium">
                            Return to Home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Backdrop */}
            <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] -mt-16 sm:-mt-20 overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    initial="hidden"
                    animate="visible"
                    variants={scaleIn}
                    style={{
                        backgroundImage: movie.cover
                            ? `url(${movie.cover})`
                            : "none",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
                </motion.div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 -mt-32 sm:-mt-48 md:-mt-64 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-8">
                    {/* Poster & Actions */}
                    <motion.div 
                        className="space-y-6"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInRight}
                    >
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
                                    Trailer
                                </Button>
                            )}
                            <Button variant="outline" className="w-full gap-2 backdrop-blur-sm bg-background/50" size="lg">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </motion.div>

                    {/* Details */}
                    <motion.div 
                        className="space-y-8" 
                        initial="hidden"
                        animate="visible"
                        variants={fadeInLeft}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gradient leading-tight">
                                {movie.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                {movie.rating && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{movie.rating.toFixed(1)}</span>
                                    </div>
                                )}
                                {movie.year && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{movie.year}</span>
                                    </div>
                                )}
                                {movie.country && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                                        <Globe className="h-3.5 w-3.5" />
                                        <span>{movie.country}</span>
                                    </div>
                                )}
                                <Badge variant="secondary" className="uppercase tracking-wider">
                                    {movie.type}
                                </Badge>
                            </div>

                            {movie.genre && movie.genre.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {movie.genre.map((g) => (
                                        <Link
                                            key={g}
                                            to={`/genre/${encodeURIComponent(g)}`}
                                        >
                                            <Badge
                                                variant="outline"
                                                className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer px-3 py-1"
                                            >
                                                {g}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {movie.synopsis && (
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    Synopsis
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                                    {movie.synopsis}
                                </p>
                            </div>
                        )}

                        {/* Cast Section */}
                        {movie.cast && movie.cast.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    Cast
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-linear-fade">
                                    {movie.cast.map((actor) => (
                                        <div
                                            key={actor.id}
                                            className="flex-shrink-0 text-center w-20 sm:w-24 group"
                                        >
                                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all">
                                                <img
                                                    src={actor.profile || "/placeholder.svg"}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium truncate group-hover:text-primary transition-colors">
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
                            <div className="p-6 rounded-xl bg-card border shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <Tv className="h-5 w-5 text-primary" />
                                        Episodes
                                    </h2>
                                    <Link to={`/series/${id}/episodes`}>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            View All <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Select an episode to start watching</p>
                                    <Button className="mt-4" asChild>
                                        <Link to={`/series/${id}/episodes`}>
                                            Browse Episodes
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Watch Section with Multiple Providers */}
                        {movie.type === "movie" && (
                            <Card className="overflow-hidden border-0 shadow-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/10">
                                <CardHeader className="border-b border-white/5 bg-white/5">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Play className="h-5 w-5 text-primary fill-current" />
                                        Watch Movie
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
                                                    <p className="text-sm font-medium">Searching for streams...</p>
                                                </div>
                                            ) : providerError ? (
                                                <div className="text-center text-white space-y-4 p-6 max-w-md mx-auto">
                                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                                                        <AlertCircle className="h-8 w-8 text-red-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold text-lg">Stream Unavailable</h3>
                                                        <p className="text-sm text-white/60">
                                                            This provider is currently experiencing issues. Please try another one.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={tryNextProvider}
                                                        className="gap-2"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                        Try Next Provider
                                                    </Button>
                                                </div>
                                            ) : streamingProviders[selectedProvider] ? (
                                                <iframe
                                                    key={`${streamingProviders[selectedProvider].url}-${selectedProvider}`}
                                                    src={streamingProviders[selectedProvider].url}
                                                    className="absolute inset-0 w-full h-full"
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    frameBorder={0}
                                                    onError={handleIframeError}
                                                    title={`Streaming from ${streamingProviders[selectedProvider].name}`}
                                                />
                                            ) : (
                                                <div className="text-center text-white space-y-4 p-6">
                                                    <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">No streaming providers available.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Controls */}
                                        {streamingProviders.length > 0 && (
                                            <div className="p-4 bg-background/50 backdrop-blur-md border-t border-white/5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <Select
                                                            value={String(selectedProvider)}
                                                            onValueChange={handleProviderChange}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-white/10">
                                                                <SelectValue placeholder="Select provider" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {streamingProviders.map((provider, index) => (
                                                                    <SelectItem key={index} value={String(index)}>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">{provider.name}</span>
                                                                            {provider.quality && (
                                                                                <Badge variant="secondary" className="text-[10px] h-5">
                                                                                    {provider.quality}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {streamingProviders[selectedProvider] && (
                                                            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                                                                {streamingProviders[selectedProvider].quality && (
                                                                    <Badge variant="outline" className="bg-transparent">
                                                                        {streamingProviders[selectedProvider].quality}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(streamingProviders[selectedProvider]?.url, "_blank")}
                                                            className="text-xs gap-2"
                                                            disabled={!streamingProviders[selectedProvider]}
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                            Open in New Tab
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.location.reload()}
                                                            className="text-xs gap-2"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                            Refresh
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments Section */}
                        <motion.div 
                            className="space-y-4 pt-4"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Comments
                            </h2>
                            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            maxLength={50}
                                            className="bg-background/50 border-white/10 focus:border-primary/50"
                                        />
                                        <Textarea
                                            placeholder="Share your thoughts..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="min-h-[100px] bg-background/50 border-white/10 focus:border-primary/50 resize-none"
                                            maxLength={500}
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">
                                                {message.length}/500 characters
                                            </span>
                                            <Button
                                                onClick={addComment}
                                                disabled={!name.trim() || !message.trim() || isLoadingComments}
                                                className="gap-2"
                                            >
                                                {isLoadingComments ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        Posting...
                                                    </>
                                                ) : (
                                                    "Post Comment"
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {isLoadingComments && comments.length === 0 ? (
                                            <div className="text-center py-8">
                                                <RefreshCw className="h-6 w-6 mx-auto animate-spin text-primary" />
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Loading comments...
                                                </p>
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-white/10">
                                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>No comments yet. Be the first to share your thoughts!</p>
                                            </div>
                                        ) : (
                                            comments.map((c, idx) => (
                                                <div
                                                    key={`${c.time}-${idx}`}
                                                    className="p-4 rounded-xl bg-muted/30 border border-white/5 space-y-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-sm text-primary">
                                                            {c.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(c.time).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/90 leading-relaxed">
                                                        {c.message}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
