import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Download,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function HentaiDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedProvider, setSelectedProvider] = useState(0);
    const [selectedDownload, setSelectedDownload] = useState(0);
    const [providerError, setProviderError] = useState(false);
    const [activeTab, setActiveTab] = useState<"stream" | "download">("stream");

    useEffect(() => {
        console.log("HentaiDetail mounted with id:", id);
    }, [id]);

    if (!id) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid JAV ID.
                        <br />
                        <Link
                            to="/hentai"
                            className="ml-2 underline block mt-2"
                        >
                            Back to JAV list
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Try to fetch from NekoBocc first (since it works without proxy)
    const {
        data: hentaiDetail,
        isLoading: hentaiLoading,
        error: hentaiError,
    } = useQuery({
        queryKey: ["hentaiDetail", id],
        queryFn: async () => {
            console.log("Fetching detail for ID:", id);

            // Try NekoBocc first (works without proxy)
            try {
                console.log("Trying NekoBocc...");
                const nekoboccDetail = await movieAPI.getNekoBoccDetail(id!);
                console.log("NekoBocc result:", nekoboccDetail);
                if (nekoboccDetail) {
                    console.log("✅ NekoBocc success!");
                    return nekoboccDetail;
                }
            } catch (error) {
                console.warn("NekoBocc fetch failed:", error);
            }

            // Fallback to Nekopoi (requires proxy)
            try {
                console.log("Trying Nekopoi...");
                const nekopoiDetail = await movieAPI.getNekopoiDetail(id!);
                console.log("Nekopoi result:", nekopoiDetail);
                if (nekopoiDetail) {
                    console.log("✅ Nekopoi success!");
                    return nekopoiDetail;
                }
            } catch (error) {
                console.warn("Nekopoi fetch failed:", error);
            }

            // Fallback to Nekopoi.care (requires CORS)
            try {
                console.log("Trying Nekopoi.care...");
                const nekopoiCareDetail = await movieAPI.getNekopoiCareDetail(
                    id!
                );
                console.log("Nekopoi.care result:", nekopoiCareDetail);
                if (nekopoiCareDetail) {
                    console.log("✅ Nekopoi.care success!");
                    return nekopoiCareDetail;
                }
            } catch (error) {
                console.warn("Nekopoi.care fetch failed:", error);
            }

            console.error("❌ All sources failed for ID:", id);
            throw new Error(
                "Content not found in any source. Please check console for details."
            );
        },
        enabled: !!id,
        retry: false,
    });

    // Build streaming providers from nekopoi.care API response only
    const streamingProviders =
        hentaiDetail?.streamLinks?.map((link) => ({
            name: `${link.provider || "Stream"} (${link.quality || "HD"})`,
            url: link.url,
            available: true,
        })) || [];

    // If no stream available, add placeholder
    if (streamingProviders.length === 0) {
        streamingProviders.push({
            name: "No stream available",
            url: "#",
            available: false,
        });
    }

    // Build download providers from Nekopoi response
    const downloadProviders =
        hentaiDetail?.downloadLinks?.map((link) => ({
            name: `${link.type || "Download"} (${link.quality || "HD"} - ${
                link.size || "Unknown"
            })`,
            url: link.url,
            available: true,
        })) || [];

    // If no download available, add placeholder
    if (downloadProviders.length === 0) {
        downloadProviders.push({
            name: "No download available",
            url: "#",
            available: false,
        });
    }

    const handleProviderChange = (value: string) => {
        const index = Number(value);
        setSelectedProvider(index);
        setProviderError(false);
    };

    const handleDownloadChange = (value: string) => {
        const index = Number(value);
        setSelectedDownload(index);
    };

    const handleIframeError = () => {
        setProviderError(true);
    };

    const handleRefresh = () => {
        setProviderError(false);
        const temp = selectedProvider;
        setSelectedProvider(-1);
        setTimeout(() => setSelectedProvider(temp), 100);
    };

    const currentProvider = streamingProviders[selectedProvider];
    const currentDownload = downloadProviders[selectedDownload];

    if (hentaiLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                {/* Simplified Navigation */}
                <div className="flex items-center gap-3 mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-2">Loading...</h1>
                    <Card>
                        <CardContent className="p-6 flex justify-center items-center">
                            <p>Loading hentai details...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (hentaiError || !hentaiDetail) {
        return (
            <div className="container mx-auto px-4 py-6">
                {/* Simplified Navigation */}
                <div className="flex items-center gap-3 mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-2">
                            <p className="font-semibold">Content Not Found</p>
                            <p className="text-sm">
                                {hentaiError
                                    ? `Error: ${
                                          hentaiError.message || "Unknown error"
                                      }`
                                    : "Content not found in any source."}
                            </p>
                            <div className="text-sm mt-2 space-y-1">
                                <p className="font-semibold">Debug Info:</p>
                                <p>ID: {id}</p>
                                <p>
                                    Check browser console (F12) for detailed
                                    error logs.
                                </p>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-semibold mb-2">
                                    Possible causes:
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>NekoBocc API returned invalid data</li>
                                    <li>Content ID is incorrect</li>
                                    <li>All API sources are unavailable</li>
                                </ul>
                            </div>
                            <Link
                                to="/hentai"
                                className="inline-block mt-4 underline"
                            >
                                ← Back to hentai list
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Simplified Navigation - Sesuai Screenshot */}
            <div className="flex items-center gap-3 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Link to="/">
                    <Button variant="ghost" className="px-3 py-2">
                        Home
                    </Button>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Title & Info */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Cover Image */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <img
                                src={hentaiDetail.cover}
                                alt={hentaiDetail.title}
                                className="w-full h-auto rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                }}
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold mb-3">
                                {hentaiDetail.title}
                            </h1>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge
                                    variant="outline"
                                    className="text-xs py-1 px-2"
                                >
                                    JAV
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="text-xs py-1 px-2"
                                >
                                    {hentaiDetail.duration}
                                </Badge>
                                {hentaiDetail.genre.map((genre, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs py-1 px-2"
                                    >
                                        {genre}
                                    </Badge>
                                ))}
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {hentaiDetail.synopsis}
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex space-x-1">
                            <Button
                                variant={
                                    activeTab === "stream" ? "default" : "ghost"
                                }
                                onClick={() => setActiveTab("stream")}
                                className="flex-1"
                            >
                                Stream
                            </Button>
                            <Button
                                variant={
                                    activeTab === "download"
                                        ? "default"
                                        : "ghost"
                                }
                                onClick={() => setActiveTab("download")}
                                className="flex-1"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Demo Mode:</strong> Currently using mock
                                data. Stream links are placeholders. To use real
                                content, set{" "}
                                <code>VITE_USE_MOCK_DATA=false</code> in your
                                .env file and ensure NekoBocc API is accessible.
                            </AlertDescription>
                        </Alert>

                        {activeTab === "stream" && (
                            <div className="space-y-4">
                                {/* Provider Selector */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <Select
                                        value={String(selectedProvider)}
                                        onValueChange={handleProviderChange}
                                    >
                                        <SelectTrigger className="w-full sm:w-[300px]">
                                            <SelectValue placeholder="Select streaming provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {streamingProviders.map(
                                                (provider, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={String(index)}
                                                    >
                                                        {provider.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            window.open(
                                                currentProvider?.url,
                                                "_blank"
                                            )
                                        }
                                        className="px-3 py-1 text-xs"
                                        disabled={
                                            !currentProvider?.url ||
                                            currentProvider.url === "#"
                                        }
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        New Tab
                                    </Button>
                                </div>

                                {/* CORS Warning */}
                                <Alert className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        If player doesn't work due to browser
                                        restrictions, click "New Tab" button
                                        above to watch in a new window.
                                    </AlertDescription>
                                </Alert>

                                {/* Video Player */}
                                {providerError ? (
                                    <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center">
                                        <div className="text-center text-white space-y-2">
                                            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                                            <p className="text-base">
                                                Player blocked by browser
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Click "New Tab" to watch or try
                                                another provider.
                                            </p>
                                            <div className="flex gap-2 justify-center mt-3">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() =>
                                                        window.open(
                                                            currentProvider?.url,
                                                            "_blank"
                                                        )
                                                    }
                                                    className="text-xs"
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    Open in New Tab
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRefresh}
                                                    className="text-xs"
                                                >
                                                    <RefreshCw className="h-4 w-4 mr-1" />
                                                    Try Again
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : currentProvider?.url &&
                                  currentProvider.url !== "#" ? (
                                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                        <iframe
                                            key={currentProvider.url}
                                            src={currentProvider.url}
                                            className="absolute inset-0 w-full h-full border-0"
                                            allowFullScreen
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            onError={handleIframeError}
                                        />
                                    </div>
                                ) : (
                                    <div className="relative aspect-video bg-muted flex items-center justify-center rounded-lg">
                                        <p className="text-muted-foreground">
                                            No playable stream available.
                                        </p>
                                    </div>
                                )}

                                {/* Controls */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const next =
                                                (selectedProvider + 1) %
                                                streamingProviders.length;
                                            handleProviderChange(String(next));
                                        }}
                                        className="text-xs"
                                    >
                                        Next Provider →
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRefresh}
                                        className="text-xs"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Refresh Player
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "download" && (
                            <div className="space-y-4">
                                {/* Download Selector */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <Select
                                        value={String(selectedDownload)}
                                        onValueChange={handleDownloadChange}
                                    >
                                        <SelectTrigger className="w-full sm:w-[300px]">
                                            <SelectValue placeholder="Select download option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {downloadProviders.map(
                                                (provider, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={String(index)}
                                                    >
                                                        {provider.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() =>
                                            window.open(
                                                currentDownload?.url,
                                                "_blank"
                                            )
                                        }
                                        className="px-3 py-1 text-xs"
                                        disabled={
                                            !currentDownload?.url ||
                                            currentDownload.url === "#"
                                        }
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                </div>

                                {/* Download Info */}
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        Click the download button to open the
                                        download link in a new tab. Some
                                        downloads may require additional steps
                                        or verification.
                                    </p>
                                </div>

                                {/* All Download Links */}
                                {downloadProviders.length > 1 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">
                                            All Download Options:
                                        </h4>
                                        <div className="grid gap-2">
                                            {downloadProviders.map(
                                                (provider, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 border rounded-lg"
                                                    >
                                                        <span className="text-sm">
                                                            {provider.name}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                window.open(
                                                                    provider.url,
                                                                    "_blank"
                                                                )
                                                            }
                                                            disabled={
                                                                !provider.url ||
                                                                provider.url ===
                                                                    "#"
                                                            }
                                                        >
                                                            <Download className="h-3 w-3 mr-1" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
