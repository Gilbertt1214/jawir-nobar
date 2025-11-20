import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

export default function AnimeDetail() {
    const { endpoint, number, subOrDub } = useParams<{
        endpoint: string;
        number: string;
        subOrDub: string;
    }>();
    const navigate = useNavigate();
    const [selectedProvider, setSelectedProvider] = useState(0);
    const [providerError, setProviderError] = useState(false);

    useEffect(() => {
        console.log("AnimeDetail mounted with params:", {
            endpoint,
            number,
            subOrDub,
        });
    }, [endpoint, number, subOrDub]);

    if (!endpoint || !number || !subOrDub) {
        console.error("Missing parameters:", { endpoint, number, subOrDub });
        return (
            <div className="container mx-auto px-4 py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid anime parameters.
                        <br />
                        Required: endpoint={endpoint}, number={number},
                        subOrDub={subOrDub}
                        <Link to="/" className="ml-2 underline block mt-2">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (subOrDub !== "sub" && subOrDub !== "dub") {
        console.error("Invalid subOrDub value:", subOrDub);
        return (
            <div className="container mx-auto px-4 py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid type: {subOrDub}. Must be 'sub' or 'dub'.
                        <Link to="/" className="ml-2 underline block mt-2">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const {
        data: animeDetail,
        isLoading: animeLoading,
        error: animeError,
    } = useQuery({
        queryKey: ["otakudesuAnimeDetail", endpoint],
        queryFn: () => movieAPI.getOtakudesuAnimeDetail(endpoint),
        enabled: !!endpoint,
        retry: 1,
    });

    const currentEpisode = animeDetail?.episodeList.find(
        (ep) => ep.episodeNumber === parseInt(number, 10)
    );

    const malId = animeDetail?.malId;

    const streamingProviders = [
        {
            name: "VidLink",
            url: malId
                ? `https://vidlink.pro/anime/${malId}/${number}/${subOrDub}?player=jw`
                : `https://vidlink.pro/anime/unknown/${number}/${subOrDub}?player=jw`,
            available: true,
        },
        {
            name: "VidLink (Alt)",
            url: malId
                ? `https://vidlink.pro/anime/${malId}/${number}/${subOrDub}`
                : `https://vidlink.pro/anime/unknown/${number}/${subOrDub}`,
            available: true,
        },
    ];

    const handleProviderChange = (index: number) => {
        console.log("Changing to provider:", index);
        setSelectedProvider(index);
        setProviderError(false);
    };

    const handleIframeError = () => {
        console.error("Iframe failed to load for provider:", selectedProvider);
        setProviderError(true);
    };

    const handleRefresh = () => {
        setProviderError(false);
        const temp = selectedProvider;
        setSelectedProvider(-1);
        setTimeout(() => setSelectedProvider(temp), 100);
    };

    const currentProvider = streamingProviders[selectedProvider];
    if (!currentProvider) {
        console.error(
            "Selected provider index is out of bounds:",
            selectedProvider
        );
        return (
            <div className="container mx-auto px-4 py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Selected provider not found. Please try again.
                        <Link to="/" className="ml-2 underline block mt-2">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (animeLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold mb-2">Loading...</h1>
                    </div>
                    <Card>
                        <CardContent className="p-6 flex justify-center items-center">
                            <p>Loading anime details...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (animeError) {
        console.error("Failed to fetch anime details:", animeError);
        return (
            <div className="container mx-auto px-4 py-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load anime details:{" "}
                        {animeError.message || "An error occurred"}
                        <Link to="/" className="ml-2 underline block mt-2">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!animeDetail) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Anime not found.
                        <Link to="/" className="ml-2 underline block mt-2">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!currentEpisode) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Episode {number} not found for this anime.
                        <Link
                            to={`/anime/${endpoint}`}
                            className="ml-2 underline block mt-2"
                        >
                            Back to Anime Details
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const sortedEpisodes = [...animeDetail.episodeList].sort(
        (a, b) => a.episodeNumber - b.episodeNumber
    );
    const currentIndex = sortedEpisodes.findIndex(
        (ep) => ep.episodeNumber === parseInt(number, 10)
    );
    const previousEpisode =
        currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
    const nextEpisode =
        currentIndex < sortedEpisodes.length - 1
            ? sortedEpisodes[currentIndex + 1]
            : null;

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Link to="/">
                    <Button variant="ghost" className="w-full sm:w-auto">
                        Home
                    </Button>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto">
                {/* Title & Info Card */}
                <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        {animeDetail.title} - Episode {number}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs py-1 px-2">
                            Status: {animeDetail.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-2">
                            Type: {animeDetail.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-2">
                            Episodes: {animeDetail.totalEpisodes}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-2">
                            Year: {animeDetail.year}
                        </Badge>
                        {malId && (
                            <Badge
                                variant="outline"
                                className="text-xs py-1 px-2"
                            >
                                MAL ID: {malId}
                            </Badge>
                        )}
                        <Badge
                            variant={
                                subOrDub === "sub" ? "default" : "secondary"
                            }
                            className="text-xs py-1 px-2"
                        >
                            {subOrDub === "sub" ? "Subtitled" : "Dubbed"}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {animeDetail.synopsis}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Watch Episode {number}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Streaming provided by third-party services. If
                                the player doesn't work, try another provider or
                                refresh the page.
                            </AlertDescription>
                        </Alert>

                        {/* Provider Selection */}
                        <Tabs
                            value={String(selectedProvider)}
                            onValueChange={(v) =>
                                handleProviderChange(Number(v))
                            }
                        >
                            <TabsList className="grid grid-cols-2 mb-4">
                                {streamingProviders.map((provider, index) => (
                                    <TabsTrigger
                                        key={index}
                                        value={String(index)}
                                        className="text-xs py-2"
                                    >
                                        {provider.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {streamingProviders.map((provider, index) => (
                                <TabsContent key={index} value={String(index)}>
                                    <div className="space-y-4">
                                        {/* Provider Info */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground">
                                                Current Provider:{" "}
                                                {provider.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        provider.url,
                                                        "_blank"
                                                    )
                                                }
                                                className="px-3 py-1 text-xs"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                New Tab
                                            </Button>
                                        </div>

                                        {/* Video Player */}
                                        {providerError ? (
                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                                <div className="text-center text-white space-y-4 p-4">
                                                    <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                                                    <p className="text-base">
                                                        This provider is not
                                                        available
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        The video couldn't be
                                                        loaded. Try another
                                                        provider.
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={
                                                                handleRefresh
                                                            }
                                                            className="text-xs"
                                                        >
                                                            <RefreshCw className="h-4 w-4 mr-2" />
                                                            Try Again
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => {
                                                                const nextProvider =
                                                                    (selectedProvider +
                                                                        1) %
                                                                    streamingProviders.length;
                                                                handleProviderChange(
                                                                    nextProvider
                                                                );
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            Next Provider
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                                                {selectedProvider >= 0 && (
                                                    <iframe
                                                        key={`${
                                                            provider.url
                                                        }-${index}-${Date.now()}`}
                                                        src={provider.url}
                                                        className="absolute inset-0 w-full h-full"
                                                        allowFullScreen
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        frameBorder={0}
                                                        onError={
                                                            handleIframeError
                                                        }
                                                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Controls */}
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const nextProvider =
                                                        (selectedProvider + 1) %
                                                        streamingProviders.length;
                                                    handleProviderChange(
                                                        nextProvider
                                                    );
                                                }}
                                                className="text-xs"
                                            >
                                                Try Next Provider →
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRefresh}
                                                className="text-xs"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Refresh Player
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.location.reload()
                                                }
                                                className="text-xs"
                                            >
                                                Reload Page
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>

                        {/* Episode Navigation */}
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Episode Navigation
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {previousEpisode && (
                                        <Link
                                            to={`/anime/${endpoint}/${previousEpisode.episodeNumber}/${subOrDub}`}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                ← Ep{" "}
                                                {previousEpisode.episodeNumber}
                                            </Button>
                                        </Link>
                                    )}
                                    {nextEpisode && (
                                        <Link
                                            to={`/anime/${endpoint}/${nextEpisode.episodeNumber}/${subOrDub}`}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                Ep {nextEpisode.episodeNumber} →
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Switch Sub/Dub */}
                            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Audio:
                                </span>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/anime/${endpoint}/${number}/sub`}
                                    >
                                        <Button
                                            variant={
                                                subOrDub === "sub"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="text-xs"
                                        >
                                            Sub
                                        </Button>
                                    </Link>
                                    <Link
                                        to={`/anime/${endpoint}/${number}/dub`}
                                    >
                                        <Button
                                            variant={
                                                subOrDub === "dub"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="text-xs"
                                        >
                                            Dub
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
