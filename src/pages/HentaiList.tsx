import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Home, Shuffle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function HentaiList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page] = useState(1);
    const [activeSource, setActiveSource] = useState<
        "all" | "nekopoi" | "nekopoiCare" | "nekobocc"
    >("nekobocc"); // Default to NekoBocc since it works without proxy

    // Get all sources combined
    const {
        data: allLatest,
        isLoading: latestLoading,
        error: latestError,
    } = useQuery({
        queryKey: ["allHentaiLatest", page],
        queryFn: async () => {
            try {
                return await movieAPI.getAllHentaiLatest(page);
            } catch (error) {
                console.error("Error fetching all sources:", error);
                // Return empty data instead of throwing
                return {
                    nekopoi: {
                        data: [],
                        page: 1,
                        totalPages: 1,
                        totalItems: 0,
                    },
                    nekopoiCare: {
                        data: [],
                        page: 1,
                        totalPages: 1,
                        totalItems: 0,
                    },
                    nekobocc: {
                        data: [],
                        page: 1,
                        totalPages: 1,
                        totalItems: 0,
                    },
                };
            }
        },
        enabled: !searchQuery,
        retry: false,
    });

    // Search all sources
    const {
        data: allSearchResults,
        isLoading: searchLoading,
        error: searchError,
    } = useQuery({
        queryKey: ["allHentaiSearch", searchQuery],
        queryFn: async () => {
            try {
                return await movieAPI.searchAllHentai(searchQuery);
            } catch (error) {
                console.error("Error searching all sources:", error);
                return {
                    nekopoi: [],
                    nekopoiCare: [],
                    nekobocc: [],
                };
            }
        },
        enabled: searchQuery.length > 2,
        retry: false,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    // Combine data from all sources
    const getCombinedData = () => {
        if (searchQuery.length > 2 && allSearchResults) {
            const combined = [
                ...allSearchResults.nekopoi,
                ...allSearchResults.nekopoiCare,
                ...allSearchResults.nekobocc,
            ];

            // Filter by active source
            if (activeSource === "nekopoi") return allSearchResults.nekopoi;
            if (activeSource === "nekopoiCare")
                return allSearchResults.nekopoiCare;
            if (activeSource === "nekobocc") return allSearchResults.nekobocc;
            return combined;
        }

        if (allLatest) {
            const combined = [
                ...allLatest.nekopoi.data,
                ...allLatest.nekopoiCare.data,
                ...allLatest.nekobocc.data,
            ];

            // Filter by active source
            if (activeSource === "nekopoi") return allLatest.nekopoi.data;
            if (activeSource === "nekopoiCare")
                return allLatest.nekopoiCare.data;
            if (activeSource === "nekobocc") return allLatest.nekobocc.data;
            return combined;
        }

        return [];
    };

    const displayData = getCombinedData();
    const isLoading = searchQuery.length > 2 ? searchLoading : latestLoading;
    const error = searchQuery.length > 2 ? searchError : latestError;

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">JAV Collection</h1>
                    <p className="text-sm text-muted-foreground">
                        Powered by Nekopoi, Nekopoi.care & NekoBocc
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link to="/">
                        <Button variant="outline">
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Info Alert */}
            <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                    <strong>Demo Mode:</strong> Currently using mock data with
                    sample videos. To use real content from Nekopoi, set{" "}
                    <code className="bg-muted px-1 rounded">
                        VITE_USE_MOCK_DATA=false
                    </code>{" "}
                    in your .env file and ensure the API is accessible.
                </AlertDescription>
            </Alert>

            {/* Source Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <Button
                    variant={activeSource === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSource("all")}
                >
                    All Sources
                    {allLatest && (
                        <Badge variant="secondary" className="ml-2">
                            {allLatest.nekopoi.data.length +
                                allLatest.nekopoiCare.data.length +
                                allLatest.nekobocc.data.length}
                        </Badge>
                    )}
                </Button>
                <Button
                    variant={
                        activeSource === "nekopoiCare" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveSource("nekopoiCare")}
                >
                    Nekopoi.care
                    {allLatest && (
                        <Badge variant="secondary" className="ml-2">
                            {allLatest.nekopoiCare.data.length}
                        </Badge>
                    )}
                </Button>
                <Button
                    variant={activeSource === "nekopoi" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSource("nekopoi")}
                >
                    Nekopoi
                    {allLatest && (
                        <Badge variant="secondary" className="ml-2">
                            {allLatest.nekopoi.data.length}
                        </Badge>
                    )}
                </Button>
                <Button
                    variant={
                        activeSource === "nekobocc" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveSource("nekobocc")}
                >
                    NekoBocc
                    {allLatest && (
                        <Badge variant="secondary" className="ml-2">
                            {allLatest.nekobocc.data.length}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search JAV... (min 3 characters)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {searchQuery.length > 0 && searchQuery.length < 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Type at least 3 characters to search
                    </p>
                )}
            </form>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-2">
                            <p className="font-semibold">
                                Failed to load content
                            </p>
                            <p className="text-sm">
                                {(error as Error).message}
                            </p>
                            {(error as Error).message.includes("CORS") && (
                                <div className="text-sm mt-2 space-y-1">
                                    <p className="font-semibold">
                                        CORS Error Detected
                                    </p>
                                    <p>To fix this issue:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>
                                            Install a CORS browser extension
                                            (e.g., "CORS Unblock")
                                        </li>
                                        <li>
                                            Or setup a proxy server for
                                            production
                                        </li>
                                        <li>
                                            Or try filtering to "Nekopoi" or
                                            "NekoBocc" sources only
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Content Grid */}
            {!isLoading && !error && displayData && (
                <>
                    {displayData.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {searchQuery.length > 2
                                    ? `No results found for "${searchQuery}"`
                                    : "No content available at the moment"}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {displayData.map((item, index) => (
                                <Link
                                    key={`${item.id}-${index}`}
                                    to={`/hentai/nekopoi/${item.id}`}
                                    className="group"
                                >
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative aspect-[2/3] overflow-hidden">
                                            <img
                                                src={item.cover}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        "/placeholder.svg";
                                                }}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs backdrop-blur-sm bg-black/50 text-white border-none"
                                                >
                                                    JAV
                                                </Badge>
                                            </div>
                                            {"uploadDate" in item &&
                                                item.uploadDate &&
                                                item.uploadDate !==
                                                    "Unknown" && (
                                                    <div className="absolute bottom-2 left-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs backdrop-blur-sm bg-black/50 text-white border-none"
                                                        >
                                                            {String(
                                                                item.uploadDate
                                                            )}
                                                        </Badge>
                                                    </div>
                                                )}
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-1">
                                                {item.genre
                                                    .slice(0, 2)
                                                    .map((g, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="outline"
                                                            className="text-xs px-1 py-0"
                                                        >
                                                            {g}
                                                        </Badge>
                                                    ))}
                                                {item.genre.length > 2 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs px-1 py-0"
                                                    >
                                                        +{item.genre.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Footer Info */}
            <div className="mt-8 text-center">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        Content is provided by third-party sources. This site
                        does not host or store any files. Please ensure you
                        comply with local laws and regulations when accessing
                        this content.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
