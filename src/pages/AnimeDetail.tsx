import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api"; // Pastikan ini adalah path ke file api.ts Anda
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

export default function AnimeDetail() {
    // Ganti useParams untuk menggunakan endpoint, number, subOrDub
    const { endpoint, number, subOrDub } = useParams<{
        endpoint: string;
        number: string;
        subOrDub: string;
    }>();
    const navigate = useNavigate();
    const [selectedProvider, setSelectedProvider] = useState(0);
    const [providerError, setProviderError] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log("AnimeDetail mounted with params:", {
            endpoint,
            number,
            subOrDub,
        });
    }, [endpoint, number, subOrDub]);

    // Validasi parameters
    if (!endpoint || !number || !subOrDub) {
        console.error("Missing parameters:", { endpoint, number, subOrDub });
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid anime parameters.
                        <br />
                        Required: endpoint={endpoint}, number={number},
                        subOrDub={subOrDub}
                        <Link to="/" className="ml-2 underline">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Validate subOrDub value
    if (subOrDub !== "sub" && subOrDub !== "dub") {
        console.error("Invalid subOrDub value:", subOrDub);
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid type: {subOrDub}. Must be 'sub' or 'dub'.
                        <Link to="/" className="ml-2 underline">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Gunakan useQuery untuk mengambil detail anime dari API Otakudesu
    const {
        data: animeDetail,
        isLoading: animeLoading,
        error: animeError,
    } = useQuery({
        queryKey: ["otakudesuAnimeDetail", endpoint],
        queryFn: () => movieAPI.getOtakudesuAnimeDetail(endpoint),
        enabled: !!endpoint, // Hanya jalankan jika endpoint tersedia
        retry: 1, // Coba ulang 1 kali jika gagal
    });

    // Cari episode saat ini berdasarkan number
    const currentEpisode = animeDetail?.episodeList.find(
        (ep) => ep.episodeNumber === parseInt(number, 10)
    );

    // Dapatkan MAL ID dari detail anime
    const malId = animeDetail?.malId; // Gunakan MAL ID dari response API Otakudesu

    // Define anime streaming providers (gunakan MAL ID jika tersedia)
    const streamingProviders = [
        {
            name: "VidLink",
            url: malId
                ? `https://vidlink.pro/anime/${malId}/${number}/${subOrDub}?player=jw`
                : `https://vidlink.pro/anime/unknown/${number}/${subOrDub}?player=jw`, // Fallback jika MAL ID tidak ditemukan
            available: true,
        },
        {
            name: "VidLink (Alt)",
            url: malId
                ? `https://vidlink.pro/anime/${malId}/${number}/${subOrDub}`
                : `https://vidlink.pro/anime/unknown/${number}/${subOrDub}`, // Fallback jika MAL ID tidak ditemukan
            available: true,
        },
        // Tambahkan provider lain jika diperlukan, atau hapus yang tidak valid
        // {
        //     name: "Embed Player",
        //     url: `https://embed.anime/${malId}/${number}/${subOrDub}`, // Ini bukan URL valid
        //     available: true,
        // },
        // {
        //     name: "Stream Player",
        //     url: `https://stream.anime/${malId}/${number}/${subOrDub}`, // Ini bukan URL valid
        //     available: true,
        // },
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
        // Force re-render of iframe
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
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Selected provider not found. Please try again.
                        <Link to="/" className="ml-2 underline">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (animeLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Loading...</h1>
                    </div>
                    <Card>
                        <CardContent className="p-8 flex justify-center items-center">
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
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load anime details:{" "}
                        {animeError.message || "An error occurred"}
                        <Link to="/" className="ml-2 underline">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!animeDetail) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Anime not found.
                        <Link to="/" className="ml-2 underline">
                            Back to home
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!currentEpisode) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Episode {number} not found for this anime.
                        <Link
                            to={`/anime/${endpoint}`}
                            className="ml-2 underline"
                        >
                            Back to Anime Details
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Temukan episode sebelumnya dan berikutnya
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
        <div className="container mx-auto px-4 py-8">
            {/* Navigation */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Link to="/">
                    <Button variant="ghost">Home</Button>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Title & Info Card */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">
                        {animeDetail.title} - Episode {number}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            Status: {animeDetail.status}
                        </Badge>
                        <Badge variant="outline">
                            Type: {animeDetail.type}
                        </Badge>
                        <Badge variant="outline">
                            Episodes: {animeDetail.totalEpisodes}
                        </Badge>
                        <Badge variant="outline">
                            Year: {animeDetail.year}
                        </Badge>
                        {malId && (
                            <Badge variant="outline">MAL ID: {malId}</Badge>
                        )}
                        <Badge
                            variant={
                                subOrDub === "sub" ? "default" : "secondary"
                            }
                        >
                            {subOrDub === "sub" ? "Subtitled" : "Dubbed"}
                        </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {animeDetail.synopsis}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Watch Episode {number}</CardTitle>
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
                            <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-4">
                                {streamingProviders.map((provider, index) => (
                                    <TabsTrigger
                                        key={index}
                                        value={String(index)}
                                    >
                                        {provider.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {streamingProviders.map((provider, index) => (
                                <TabsContent key={index} value={String(index)}>
                                    <div className="space-y-4">
                                        {/* Provider Info */}
                                        <div className="flex items-center justify-between mb-2">
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
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Open in New Tab
                                            </Button>
                                        </div>

                                        {/* Video Player */}
                                        {providerError ? (
                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                                <div className="text-center text-white space-y-4 p-8">
                                                    <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                                                    <p className="text-lg">
                                                        This provider is not
                                                        available
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        The video couldn't be
                                                        loaded. Try another
                                                        provider.
                                                    </p>
                                                    <div className="flex gap-2 justify-center">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={
                                                                handleRefresh
                                                            }
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
                                            >
                                                Try Next Provider →
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRefresh}
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Episode Navigation
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {previousEpisode && (
                                        <Link
                                            to={`/anime/${endpoint}/${previousEpisode.episodeNumber}/${subOrDub}`}
                                        >
                                            <Button variant="outline" size="sm">
                                                ← Episode{" "}
                                                {previousEpisode.episodeNumber}
                                            </Button>
                                        </Link>
                                    )}
                                    {nextEpisode && (
                                        <Link
                                            to={`/anime/${endpoint}/${nextEpisode.episodeNumber}/${subOrDub}`}
                                        >
                                            <Button variant="outline" size="sm">
                                                Episode{" "}
                                                {nextEpisode.episodeNumber} →
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Switch Sub/Dub */}
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Audio:
                                </span>
                                <Link to={`/anime/${endpoint}/${number}/sub`}>
                                    <Button
                                        variant={
                                            subOrDub === "sub"
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                    >
                                        Subtitled
                                    </Button>
                                </Link>
                                <Link to={`/anime/${endpoint}/${number}/dub`}>
                                    <Button
                                        variant={
                                            subOrDub === "dub"
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                    >
                                        Dubbed
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
