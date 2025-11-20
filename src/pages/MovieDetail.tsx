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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [comments, setComments] = useState<
        Array<{ name: string; message: string; time: number }>
    >([]);
    const [selectedProvider, setSelectedProvider] = useState(0);
    const [providerError, setProviderError] = useState(false);

    // Get streaming providers
    const streamingProviders = movie
        ? movieAPI.getStreamingUrls(movie.id, movie.type)
        : [];

    useEffect(() => {
        if (!id) return;
        try {
            const raw = localStorage.getItem(`comments:movie:${id}`);
            setComments(raw ? JSON.parse(raw) : []);
        } catch {
            setComments([]);
        }
    }, [id]);

    const addComment = () => {
        const n = name.trim();
        const m = message.trim();
        if (!n || !m || !id) return;
        const next = [{ name: n, message: m, time: Date.now() }, ...comments];
        setComments(next);
        localStorage.setItem(`comments:movie:${id}`, JSON.stringify(next));
        setName("");
        setMessage("");
    };

    const handleProviderChange = (index: number) => {
        setSelectedProvider(index);
        setProviderError(false);
    };

    const handleIframeError = () => {
        setProviderError(true);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Film atau series tidak ditemukan atau gagal dimuat.
                        <Link to="/" className="ml-2 underline">
                            Kembali ke beranda
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Backdrop */}
            <div className="relative h-[400px] -mt-16 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: movie.cover
                            ? `url(${movie.cover})`
                            : "none",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-32 relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Poster */}
                    <div className="space-y-4">
                        <img
                            src={movie.cover || "/placeholder.svg"}
                            alt={movie.title}
                            className="w-full aspect-[2/3] object-cover rounded-lg shadow-card-hover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                            }}
                        />
                        {movie.trailer && (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() =>
                                    window.open(movie.trailer, "_blank")
                                }
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Watch Trailer
                            </Button>
                        )}
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {movie.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                {movie.rating && (
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-accent text-accent" />
                                        <span className="text-xl font-semibold">
                                            {movie.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                {movie.year && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{movie.year}</span>
                                    </div>
                                )}

                                {movie.country && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Globe className="h-4 w-4" />
                                        <span>{movie.country}</span>
                                    </div>
                                )}
                            </div>

                            {movie.genre && movie.genre.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {movie.genre.map((g) => (
                                        <Link
                                            key={g}
                                            to={`/genre/${encodeURIComponent(
                                                g
                                            )}`}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-smooth"
                                            >
                                                {g}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {movie.synopsis && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-3">
                                    Synopsis
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {movie.synopsis}
                                </p>
                            </div>
                        )}

                        {/* Cast Section */}
                        {movie.cast && movie.cast.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-3">
                                    Cast
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {movie.cast.map((actor) => (
                                        <div
                                            key={actor.id}
                                            className="flex-shrink-0 text-center"
                                        >
                                            <img
                                                src={
                                                    actor.profile ||
                                                    "/placeholder.svg"
                                                }
                                                alt={actor.name}
                                                className="w-20 h-20 rounded-full object-cover mb-2"
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.src =
                                                        "/placeholder.svg";
                                                }}
                                            />
                                            <p className="text-sm font-medium">
                                                {actor.name}
                                            </p>
                                            {actor.character && (
                                                <p className="text-xs text-muted-foreground">
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
                            <div>
                                <h2 className="text-2xl font-semibold mb-3">
                                    Episodes
                                </h2>
                                <Link to={`/series/${id}/episodes`}>
                                    <Button variant="outline">
                                        <Play className="mr-2 h-4 w-4" />
                                        View All Episodes
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Watch Section with Multiple Providers */}
                        {movie.type === "movie" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Watch Movie</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Alert className="mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Streaming disediakan oleh pihak
                                            ketiga. Jika player tidak bekerja,
                                            coba provider lain atau refresh
                                            halaman.
                                        </AlertDescription>
                                    </Alert>

                                    {/* Provider Selection */}
                                    <Tabs
                                        value={String(selectedProvider)}
                                        onValueChange={(v) =>
                                            handleProviderChange(Number(v))
                                        }
                                    >
                                        <TabsList className="grid grid-cols-3 lg:grid-cols-5 mb-4">
                                            {streamingProviders.map(
                                                (provider, index) => (
                                                    <TabsTrigger
                                                        key={index}
                                                        value={String(index)}
                                                    >
                                                        {provider.name}
                                                    </TabsTrigger>
                                                )
                                            )}
                                        </TabsList>

                                        {streamingProviders.map(
                                            (provider, index) => (
                                                <TabsContent
                                                    key={index}
                                                    value={String(index)}
                                                >
                                                    <div className="space-y-4">
                                                        {/* Provider Info */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Badge variant="outline">
                                                                Provider:{" "}
                                                                {provider.name}
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    window.open(
                                                                        provider.url,
                                                                        "_blank"
                                                                    )
                                                                }
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                                Open in New Tab
                                                            </Button>
                                                        </div>

                                                        {/* Video Player */}
                                                        {providerError ? (
                                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                                                <div className="text-center text-white space-y-4">
                                                                    <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                                                                    <p>
                                                                        Provider
                                                                        ini
                                                                        tidak
                                                                        tersedia
                                                                        saat ini
                                                                    </p>
                                                                    <Button
                                                                        variant="secondary"
                                                                        onClick={() =>
                                                                            setProviderError(
                                                                                false
                                                                            )
                                                                        }
                                                                    >
                                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                                        Coba
                                                                        Lagi
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
                                                                <iframe
                                                                    key={`${provider.url}-${index}`}
                                                                    src={
                                                                        provider.url
                                                                    }
                                                                    className="absolute inset-0 w-full h-full"
                                                                    allowFullScreen
                                                                    frameBorder={
                                                                        0
                                                                    }
                                                                    onError={
                                                                        handleIframeError
                                                                    }
                                                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Alternative Actions */}
                                                        <div className="flex gap-2 mt-4">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedProvider(
                                                                        (
                                                                            prev
                                                                        ) =>
                                                                            prev <
                                                                            streamingProviders.length -
                                                                                1
                                                                                ? prev +
                                                                                  1
                                                                                : 0
                                                                    );
                                                                    setProviderError(
                                                                        false
                                                                    );
                                                                }}
                                                            >
                                                                Try Next
                                                                Provider
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    window.location.reload()
                                                                }
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Refresh Page
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            )
                                        )}
                                    </Tabs>

                                    {/* Fallback Message */}
                                    {streamingProviders.length === 0 && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Tidak ada provider streaming
                                                yang tersedia saat ini.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments Section */}
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>Comments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <Input
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        maxLength={50}
                                    />
                                    <Textarea
                                        placeholder="Your message"
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        className="md:col-span-2"
                                        maxLength={500}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        {message.length}/500 characters
                                    </span>
                                    <Button
                                        onClick={addComment}
                                        disabled={
                                            !name.trim() || !message.trim()
                                        }
                                    >
                                        Send Comment
                                    </Button>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {comments.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            Belum ada komentar. Jadilah yang
                                            pertama!
                                        </p>
                                    ) : (
                                        comments.map((c, idx) => (
                                            <div
                                                key={`${c.time}-${idx}`}
                                                className="p-4 rounded-lg border bg-background"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold">
                                                        {c.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            c.time
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {c.message}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
