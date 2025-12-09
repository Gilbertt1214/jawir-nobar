// Nekopoi API Service (via Sanka Vollerei)
// API: https://api.sankavollerei.com/anime/neko or https://www.sankavollerei.com/anime/neko

import axios from "axios";
import type {
    NekopoiHentai,
    PaginatedResponse,
    StreamingProvider,
    DownloadLink,
} from "./types";
import { ANIME_SCRAPER_URL } from "./constants";

// Use env variable, append /anime/neko path
const getNekopoiApiUrl = () => {
    const baseUrl = ANIME_SCRAPER_URL;
    // If URL already ends with /anime, just add /neko
    if (baseUrl.endsWith("/anime")) return `${baseUrl}/neko`;
    // Otherwise append full path
    return `${baseUrl}/anime/neko`;
};

// Use proxy in development to avoid CORS issues
const isDev = import.meta.env.DEV;
const NEKOPOI_API = isDev ? "/sanka-neko" : getNekopoiApiUrl();

// Log the API URL being used
console.log("Nekopoi API URL configured:", NEKOPOI_API, "isDev:", isDev);

// API Response Types - handle multiple possible formats
interface NekopoiLatestItem {
    title: string;
    upload?: string;
    date?: string;
    image?: string;
    img?: string;
    poster?: string;
    link?: string;
    url?: string;
    slug?: string;
}

interface NekopoiDetailData {
    title: string;
    info?: string;
    img?: string;
    image?: string;
    poster?: string;
    sinopsis?: string;
    synopsis?: string;
    genre?: string | string[];
    genres?: string[];
    anime?: string;
    producers?: string;
    duration?: string;
    size?: string;
    streams?: { name: string; url: string }[];
    stream_links?: { name: string; url: string }[];
    download?: {
        type: string;
        title: string;
        links: { name: string; link: string }[];
    }[];
    download_links?: {
        type: string;
        title: string;
        links: { name: string; link: string }[];
    }[];
}

// Helper to extract slug from nekopoi URL
const extractSlug = (url: string): string => {
    // "https://nekopoi.care/oshikake-bakunyuu-gyaru-harem-seikatsu-episode-2-subtitle-indonesia/"
    // -> "oshikake-bakunyuu-gyaru-harem-seikatsu-episode-2-subtitle-indonesia"
    const match = url.match(/nekopoi\.care\/([^\/]+)\/?$/);
    return match ? match[1] : url;
};

export class SankaNekopoiService {
    private baseUrl = NEKOPOI_API;

    // Get latest hentai - try multiple endpoints
    async getLatest(): Promise<NekopoiHentai[]> {
        // Try different endpoint patterns based on Sanka API
        const endpoints = [
            `${this.baseUrl}/latest`,
            `${this.baseUrl}/recent`,
            `${this.baseUrl}`,
        ];

        console.log("🔍 Nekopoi getLatest - baseUrl:", this.baseUrl);

        for (const endpoint of endpoints) {
            try {
                console.log("🔍 Trying Nekopoi endpoint:", endpoint);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await axios.get<any>(endpoint, {
                    timeout: 10000,
                    headers: {
                        Accept: "application/json",
                    },
                });

                console.log("📦 Nekopoi response status:", response.status);
                console.log(
                    "📦 Nekopoi response data:",
                    JSON.stringify(response.data).substring(0, 300)
                );

                // Handle different response formats
                let items: NekopoiLatestItem[] = [];

                if (Array.isArray(response.data)) {
                    items = response.data;
                } else if (
                    response.data?.results &&
                    Array.isArray(response.data.results)
                ) {
                    items = response.data.results;
                } else if (
                    response.data?.data &&
                    Array.isArray(response.data.data)
                ) {
                    items = response.data.data;
                } else if (
                    response.data?.latest &&
                    Array.isArray(response.data.latest)
                ) {
                    items = response.data.latest;
                } else if (
                    response.data?.list &&
                    Array.isArray(response.data.list)
                ) {
                    items = response.data.list;
                }

                console.log("✅ Nekopoi items found:", items.length);

                if (items.length > 0) {
                    return items.map((item) => {
                        const link = item.link || item.url || item.slug || "";
                        const cover =
                            item.image ||
                            item.img ||
                            item.poster ||
                            "/placeholder.svg";
                        const uploadDate = item.upload || item.date || "";
                        const id =
                            extractSlug(link) ||
                            item.title?.toLowerCase().replace(/\s+/g, "-") ||
                            String(Date.now());

                        return {
                            id,
                            title: item.title || "Unknown",
                            cover,
                            genre: [],
                            duration: "",
                            synopsis: "",
                            type: "hentai",
                            uploadDate,
                            nekopoiUrl: link,
                        };
                    });
                }
            } catch (error: unknown) {
                const axiosError = error as {
                    message?: string;
                    response?: { status?: number; data?: unknown };
                };
                console.error(
                    `❌ Nekopoi endpoint ${endpoint} failed:`,
                    axiosError?.message
                );
                if (axiosError?.response) {
                    console.error(
                        "Response status:",
                        axiosError.response.status
                    );
                }
                continue; // Try next endpoint
            }
        }

        console.log("❌ All Nekopoi endpoints failed");
        return [];
    }

    // Get release list with pagination - try multiple endpoints
    async getReleaseList(
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        // Try different endpoint patterns
        const endpoints = [
            `${this.baseUrl}/release/${page}`,
            `${this.baseUrl}/latest?page=${page}`,
            `${this.baseUrl}?page=${page}`,
        ];

        for (const endpoint of endpoints) {
            try {
                console.log("Trying Nekopoi release endpoint:", endpoint);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await axios.get<any>(endpoint, {
                    timeout: 10000,
                });

                console.log(
                    "Nekopoi release response from",
                    endpoint,
                    ":",
                    response.data
                );

                // Handle different response formats
                let items: NekopoiLatestItem[] = [];

                if (Array.isArray(response.data)) {
                    items = response.data;
                } else if (
                    response.data?.results &&
                    Array.isArray(response.data.results)
                ) {
                    items = response.data.results;
                } else if (
                    response.data?.data &&
                    Array.isArray(response.data.data)
                ) {
                    items = response.data.data;
                } else if (
                    response.data?.latest &&
                    Array.isArray(response.data.latest)
                ) {
                    items = response.data.latest;
                }

                console.log("Nekopoi release items found:", items.length);

                if (items.length > 0) {
                    const data = items.map((item) => {
                        const link = item.link || item.url || item.slug || "";
                        const cover =
                            item.image ||
                            item.img ||
                            item.poster ||
                            "/placeholder.svg";
                        const uploadDate = item.upload || item.date || "";
                        const id =
                            extractSlug(link) ||
                            item.title?.toLowerCase().replace(/\s+/g, "-") ||
                            String(Date.now());

                        return {
                            id,
                            title: item.title || "Unknown",
                            cover,
                            genre: [],
                            duration: "",
                            synopsis: "",
                            type: "hentai",
                            uploadDate,
                            nekopoiUrl: link,
                        };
                    });

                    return {
                        data,
                        page,
                        totalPages: 10,
                        totalItems: data.length,
                    };
                }
            } catch (error: unknown) {
                const err = error as { message?: string };
                console.error(
                    `Nekopoi release endpoint ${endpoint} failed:`,
                    err?.message || error
                );
                continue;
            }
        }

        // If all endpoints fail, try getLatest as fallback
        if (page === 1) {
            const latestData = await this.getLatest();
            if (latestData.length > 0) {
                return {
                    data: latestData,
                    page: 1,
                    totalPages: 1,
                    totalItems: latestData.length,
                };
            }
        }

        return { data: [], page, totalPages: 1, totalItems: 0 };
    }

    // Search hentai
    async search(query: string): Promise<NekopoiHentai[]> {
        try {
            console.log(
                `Searching Nekopoi API: ${query}`,
                `${this.baseUrl}/search/${encodeURIComponent(query)}`
            );
            const response = await axios.get<{
                status?: string;
                success?: boolean;
                results?: NekopoiLatestItem[];
                data?: NekopoiLatestItem[];
            }>(`${this.baseUrl}/search/${encodeURIComponent(query)}`);

            console.log("Nekopoi search response:", response.data);

            // Handle different response formats
            const items = response.data?.results || response.data?.data || [];

            if (items.length > 0) {
                return items.map((item) => {
                    const link = item.link || item.url || item.slug || "";
                    const cover =
                        item.image ||
                        item.img ||
                        item.poster ||
                        "/placeholder.svg";
                    const uploadDate = item.upload || item.date || "";

                    return {
                        id: extractSlug(link),
                        title: item.title,
                        cover,
                        genre: [],
                        duration: "",
                        synopsis: "",
                        type: "hentai",
                        uploadDate,
                        nekopoiUrl: link,
                    };
                });
            }
            return [];
        } catch (error) {
            console.error("Nekopoi API search error:", error);
            return [];
        }
    }

    // Get random hentai
    async getRandom(): Promise<NekopoiHentai | null> {
        try {
            console.log("Fetching random from Nekopoi API");
            const response = await axios.get<{
                status: string;
                success: boolean;
                data: NekopoiDetailData;
            }>(`${this.baseUrl}/random`);

            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                return this.transformDetailToHentai(data, "random");
            }
            return null;
        } catch (error) {
            console.error("Nekopoi API getRandom error:", error);
            return null;
        }
    }

    // Get detail by URL
    async getDetail(nekopoiUrl: string): Promise<NekopoiHentai | null> {
        try {
            // Ensure URL is properly formatted
            let url = nekopoiUrl;
            if (!url.startsWith("http")) {
                url = `https://nekopoi.care/${nekopoiUrl}/`;
            }
            if (!url.endsWith("/")) {
                url += "/";
            }

            console.log(`Fetching detail from Nekopoi API: ${url}`);
            const response = await axios.get<{
                status: string;
                success: boolean;
                data: NekopoiDetailData;
            }>(`${this.baseUrl}/get?url=${encodeURIComponent(url)}`);

            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                return this.transformDetailToHentai(data, extractSlug(url));
            }
            return null;
        } catch (error) {
            console.error("Nekopoi API getDetail error:", error);
            return null;
        }
    }

    // Transform API detail to NekopoiHentai format
    private transformDetailToHentai(
        data: NekopoiDetailData,
        id: string
    ): NekopoiHentai {
        // Parse genres - handle both string and array formats
        let genres: string[] = [];
        if (data.genres && Array.isArray(data.genres)) {
            genres = data.genres;
        } else if (data.genre) {
            if (Array.isArray(data.genre)) {
                genres = data.genre;
            } else if (typeof data.genre === "string") {
                genres = data.genre.split(",").map((g) => g.trim());
            }
        }

        // Transform stream links - handle multiple formats
        const streams = data.streams || data.stream_links || [];
        const streamLinks = streams.map((s) => ({
            quality: "HD",
            url: s.url,
            provider: s.name,
        }));

        // Transform download links - handle multiple formats
        const downloads = data.download || data.download_links || [];
        const downloadLinks: DownloadLink[] = [];
        downloads.forEach((dl) => {
            dl.links?.forEach((link) => {
                downloadLinks.push({
                    quality: dl.type || "unknown",
                    size: "",
                    url: link.link,
                    type: link.name,
                });
            });
        });

        // Get cover image from multiple possible fields
        const cover =
            data.img || data.image || data.poster || "/placeholder.svg";
        const synopsis = data.sinopsis || data.synopsis || "";

        return {
            id,
            title: data.title,
            cover,
            genre: genres,
            duration: data.duration || "",
            synopsis,
            type: "hentai",
            uploadDate: data.info || "",
            streamLinks,
            downloadLinks,
        };
    }

    // Get streaming providers from detail
    getStreamingProviders(detail: NekopoiHentai): StreamingProvider[] {
        if (!detail.streamLinks) return [];

        return detail.streamLinks.map((link) => ({
            name: link.provider || "Stream",
            url: link.url,
            available: true,
            quality: link.quality || "HD",
        }));
    }
}

export const sankaNekopoiService = new SankaNekopoiService();
