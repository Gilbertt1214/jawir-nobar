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
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 gap-6">
                    <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Film atau series tidak ditemukan atau gagal dimuat.
                        <Link to="/" className="ml-2 underline block mt-2">
                            Kembali ke beranda
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16">
            {/* Backdrop */}
            <div className="relative h-[200px] sm:h-[300px] -mt-16 sm:-mt-24 overflow-hidden">
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

            <div className="container mx-auto px-4 sm:px-6 -mt-20 sm:-mt-32 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                className="w-full text-sm"
                                size="lg"
                                onClick={() =>
                                    window.open(movie.trailer, "_blank")
                                }
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Watch Trailer
                            </Button>
                        )}
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
                                {movie.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {movie.rating && (
                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-accent text-accent" />
                                        <span className="font-semibold text-sm">
                                            {movie.rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                {movie.year && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <Calendar className="h-3 w-3" />
                                        <span>{movie.year}</span>
                                    </div>
                                )}

                                {movie.country && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <Globe className="h-3 w-3" />
                                        <span>{movie.country}</span>
                                    </div>
                                )}
                            </div>

                            {movie.genre && movie.genre.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {movie.genre.map((g) => (
                                        <Link
                                            key={g}
                                            to={`/genre/${encodeURIComponent(
                                                g
                                            )}`}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-smooth text-xs py-1 px-2"
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
                                <h2 className="text-lg font-semibold mb-2">
                                    Synopsis
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {movie.synopsis}
                                </p>
                            </div>
                        )}

                        {/* Cast Section */}
                        {movie.cast && movie.cast.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">
                                    Cast
                                </h2>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {movie.cast.map((actor) => (
                                        <div
                                            key={actor.id}
                                            className="flex-shrink-0 text-center min-w-[70px] sm:min-w-[80px]"
                                        >
                                            <img
                                                src={
                                                    actor.profile ||
                                                    "/placeholder.svg"
                                                }
                                                alt={actor.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mb-1 sm:mb-2"
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.src =
                                                        "/placeholder.svg";
                                                }}
                                            />
                                            <p className="text-xs font-medium truncate max-w-[70px] sm:max-w-[80px]">
                                                {actor.name}
                                            </p>
                                            {actor.character && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[70px] sm:max-w-[80px]">
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
                                <h2 className="text-lg font-semibold mb-2">
                                    Episodes
                                </h2>
                                <Link to={`/series/${id}/episodes`}>
                                    <Button
                                        variant="outline"
                                        className="text-sm"
                                    >
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
                                    <CardTitle className="text-lg">
                                        Watch Movie
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Alert className="mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Streaming disediakan oleh pihak
                                            ketiga. Jika player tidak bekerja,
                                            coba provider lain atau refresh
                                            halaman.
                                        </AlertDescription>
                                    </Alert>

                                    {/* Provider Selection - Scrollable Only on Mobile */}
                                    <Tabs
                                        value={String(selectedProvider)}
                                        onValueChange={(v) =>
                                            handleProviderChange(Number(v))
                                        }
                                    >
                                        <div className="relative">
                                            {/* Mobile: Scrollable Flex */}
                                            <TabsList className="flex flex-wrap gap-1 mb-4 overflow-x-auto pb-2">
                                                {streamingProviders.map(
                                                    (provider, index) => (
                                                        <TabsTrigger
                                                            key={index}
                                                            value={String(
                                                                index
                                                            )}
                                                            className="flex-shrink-0 text-xs py-1.5 px-3 whitespace-nowrap"
                                                        >
                                                            {provider.name}
                                                        </TabsTrigger>
                                                    )
                                                )}
                                            </TabsList>

                                            {/* Desktop: Grid (optional fallback, but we keep flex for consistency) */}
                                            {/* Jika ingin grid di desktop, gunakan ini instead:
                                            <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4">
                                                {streamingProviders.map((provider, index) => (
                                                    <TabsTrigger
                                                        key={index}
                                                        value={String(index)}
                                                        className="text-xs py-1.5"
                                                    >
                                                        {provider.name}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                            */}

                                            {/* Gradient hint for scroll */}
                                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                                        </div>

                                        {streamingProviders.map(
                                            (provider, index) => (
                                                <TabsContent
                                                    key={index}
                                                    value={String(index)}
                                                >
                                                    <div className="space-y-4">
                                                        {/* Provider Info */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs py-1"
                                                            >
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
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                New Tab
                                                            </Button>
                                                        </div>

                                                        {/* Video Player */}
                                                        {providerError ? (
                                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]">
                                                                <div className="text-center text-white space-y-3 p-4">
                                                                    <AlertCircle className="h-10 w-10 mx-auto text-red-500" />
                                                                    <p className="text-sm">
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
                                                                        className="text-xs"
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
                                                        <div className="flex flex-wrap gap-2 mt-2">
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
                                                                className="text-xs"
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
                                                                className="text-xs"
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
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Comments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-3 mb-4">
                                    <Input
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        maxLength={50}
                                        className="text-sm"
                                    />
                                    <Textarea
                                        placeholder="Your message"
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        className="text-sm"
                                        maxLength={500}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {message.length}/500 characters
                                    </span>
                                    <Button
                                        onClick={addComment}
                                        disabled={
                                            !name.trim() || !message.trim()
                                        }
                                        className="text-xs"
                                    >
                                        Send Comment
                                    </Button>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {comments.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4 text-sm">
                                            Belum ada komentar. Jadilah yang
                                            pertama!
                                        </p>
                                    ) : (
                                        comments.map((c, idx) => (
                                            <div
                                                key={`${c.time}-${idx}`}
                                                className="p-3 rounded-lg border bg-background"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                    <span className="font-semibold text-sm">
                                                        {c.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground text-right">
                                                        {new Date(
                                                            c.time
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
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
