import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertCircle,
    Search,
    Home,
    RefreshCw,
    Wifi,
    WifiOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function HentaiList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page] = useState(1);
    const [apiStatus, setApiStatus] = useState<boolean | null>(null);

    // Check API status on mount
    useEffect(() => {
        const checkAPI = async () => {
            try {
                const status = await movieAPI.getAPIStatus();
                setApiStatus(status.nekopoi);
            } catch {
                setApiStatus(false);
            }
        };
        checkAPI();
    }, []);

    // Get all sources combined
    const {
        data: allLatest,
        isLoading: latestLoading,
        error: latestError,
        refetch: refetchLatest,
    } = useQuery({
        queryKey: ["allHentaiLatest", page],
        queryFn: async () => {
            try {
                return await movieAPI.getAllHentaiLatest(page);
            } catch (error) {
                console.error("Error fetching all sources:", error);
                return {
                    nekopoi: {
                        data: [],
                        page: 1,
                        totalPages: 1,
                        totalItems: 0,
                    },
                };
            }
        },
        enabled: !searchQuery,
        retry: 2,
        retryDelay: 1000,
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
                };
            }
        },
        enabled: searchQuery.length > 2,
        retry: 2,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    // Get data from nekopoi source
    const getDisplayData = () => {
        if (searchQuery.length > 2 && allSearchResults) {
            return allSearchResults.nekopoi;
        }

        if (allLatest) {
            return allLatest.nekopoi.data;
        }

        return [];
    };

    const displayData = getDisplayData();
    const isLoading = searchQuery.length > 2 ? searchLoading : latestLoading;
    const error = searchQuery.length > 2 ? searchError : latestError;
    const totalItems = allLatest?.nekopoi?.data?.length || 0;

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Hentai
                        </h1>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400">
                                Powered by Nekopoi (Sanka API)
                            </p>
                            {/* API Status Indicator */}
                            {apiStatus !== null && (
                                <div className="flex items-center gap-1">
                                    {apiStatus ? (
                                        <Wifi className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <WifiOff className="h-3 w-3 text-red-500" />
                                    )}
                                    <span
                                        className={`text-xs ${
                                            apiStatus
                                                ? "text-green-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {apiStatus ? "Online" : "Offline"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchLatest()}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Link to="/">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Source Badge - Red Background */}
                <div className="flex gap-2 mb-6">
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-lg"
                        style={{ backgroundColor: "#dc2626" }}
                    >
                        <span className="text-white font-medium">Nekopoi</span>
                        <Badge className="ml-2 bg-white text-red-600 hover:bg-gray-100">
                            {totalItems}
                        </Badge>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Cari anime Hentai... (min 3 karakter)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 py-6 text-base rounded-xl border-gray-700 bg-[#121212] text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                        />
                    </div>
                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                            Ketik minimal 3 karakter untuk mencari
                        </p>
                    )}
                </form>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-400">Memuat konten...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div
                        className="rounded-xl p-6 mb-6"
                        style={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #dc2626",
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-3">
                                <p className="font-semibold text-white">
                                    Gagal memuat konten
                                </p>
                                <p className="text-sm text-gray-400">
                                    {(error as Error).message}
                                </p>
                                {(error as Error).message.includes("CORS") && (
                                    <div className="text-sm space-y-2 p-4 rounded-lg bg-[#0a0a0a]">
                                        <p className="font-semibold text-yellow-500">
                                            CORS Error Terdeteksi
                                        </p>
                                        <p className="text-gray-400">
                                            Untuk memperbaiki masalah ini:
                                        </p>
                                        <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-400">
                                            <li>
                                                Install ekstensi CORS browser
                                                (contoh: "CORS Unblock")
                                            </li>
                                            <li>
                                                Atau setup proxy server untuk
                                                production
                                            </li>
                                        </ol>
                                    </div>
                                )}
                                <Button
                                    onClick={() => refetchLatest()}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                {!isLoading && !error && displayData && (
                    <>
                        {displayData.length === 0 ? (
                            <div
                                className="rounded-xl p-8 text-center"
                                style={{
                                    backgroundColor: "#121212",
                                    border: "1px solid #262626",
                                }}
                            >
                                <div className="max-w-md mx-auto">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                        style={{ backgroundColor: "#1a1a1a" }}
                                    >
                                        <AlertCircle className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {searchQuery.length > 2
                                            ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                                            : "Belum ada konten tersedia"}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        {searchQuery.length > 2
                                            ? "Coba kata kunci lain atau periksa ejaan"
                                            : "Belum ada konten tersedia saat ini — coba lagi nanti atau cari judul spesifik di atas"}
                                    </p>
                                    {!searchQuery && (
                                        <Button
                                            onClick={() => refetchLatest()}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Muat Ulang
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {displayData.map((item, index) => (
                                    <Link
                                        key={`${item.id}-${index}`}
                                        to={`/hentai/nekopoi/${item.id}`}
                                        className="group"
                                    >
                                        <Card
                                            className="overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02]"
                                            style={{
                                                backgroundColor: "#121212",
                                            }}
                                        >
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
                                                {/* Gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="absolute top-2 right-2">
                                                    <Badge className="text-xs backdrop-blur-sm bg-red-600 text-white border-none">
                                                        Hentai
                                                    </Badge>
                                                </div>
                                                {"uploadDate" in item &&
                                                    item.uploadDate &&
                                                    item.uploadDate !==
                                                        "Unknown" && (
                                                        <div className="absolute bottom-2 left-2">
                                                            <Badge className="text-xs backdrop-blur-sm bg-black/70 text-white border-none">
                                                                {String(
                                                                    item.uploadDate
                                                                )}
                                                            </Badge>
                                                        </div>
                                                    )}
                                            </div>
                                            <CardContent className="p-3">
                                                <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-white group-hover:text-red-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.genre
                                                        .slice(0, 2)
                                                        .map((g, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="outline"
                                                                className="text-xs px-1.5 py-0 border-gray-700 text-gray-400"
                                                            >
                                                                {g}
                                                            </Badge>
                                                        ))}
                                                    {item.genre.length > 2 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs px-1.5 py-0 border-gray-700 text-gray-400"
                                                        >
                                                            +
                                                            {item.genre.length -
                                                                2}
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
                <div className="mt-12 text-center">
                    <div
                        className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
                        style={{
                            backgroundColor: "#121212",
                            border: "1px solid #262626",
                        }}
                    >
                        <AlertCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-xs text-gray-500">
                            Konten disediakan oleh pihak ketiga. Situs ini tidak
                            menyimpan file apapun. Pastikan Anda mematuhi hukum
                            dan peraturan setempat saat mengakses konten ini.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
