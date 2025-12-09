/**
 * Sanka Vollerei API Service
 * API Documentation: https://api.sankavollerei.com
 *
 * This service handles all anime-related API calls from Sanka Vollerei.
 * It is completely separate from TMDB and Vidlink APIs.
 *
 * Available Endpoints (Otakudesu):
 * - GET /anime/ongoing-anime - Get ongoing anime list
 * - GET /anime/complete-anime/{page} - Get completed anime
 * - GET /anime/anime/{slug} - Get anime detail
 * - GET /anime/episode/{slug} - Get episode streaming
 * - GET /anime/search/{keyword} - Search anime
 * - GET /anime/genre - Get all genres
 * - GET /anime/genre/{slug} - Get anime by genre
 * - GET /anime/server/{serverId} - Get server embed URL
 *
 * Available Endpoints (Nekopoi - Hentai):
 * - GET /anime/neko/latest - Get latest hentai
 * - GET /anime/neko/release/{page} - Get release list
 * - GET /anime/neko/search/{query} - Search hentai
 * - GET /anime/neko/get?url={url} - Get hentai detail
 * - GET /anime/neko/random - Get random hentai
 */

import axios, { AxiosInstance } from "axios";

// Get base URL from environment variable
const SANKA_BASE_URL =
    import.meta.env.VITE_ANIME_SCRAPER_URL || "https://www.sankavollerei.com";

// Use proxy in development to avoid CORS
const isDev = import.meta.env.DEV;

// API endpoints
const ANIME_API = isDev ? "/sanka-anime" : `${SANKA_BASE_URL}/anime`;
const NEKOPOI_API = isDev ? "/sanka-neko" : `${SANKA_BASE_URL}/anime/neko`;

console.log("🔧 Sanka API Configuration:");
console.log("  - Base URL:", SANKA_BASE_URL);
console.log("  - Anime API:", ANIME_API);
console.log("  - Nekopoi API:", NEKOPOI_API);
console.log("  - Development mode:", isDev);

// ==================== TYPE DEFINITIONS ====================

// Anime Types
export interface SankaAnimeItem {
    title: string;
    slug: string;
    poster: string;
    current_episode?: string;
    release_day?: string;
    newest_release_date?: string;
    otakudesu_url?: string;
}

export interface SankaAnimeDetail {
    title: string;
    slug: string;
    japanese_title?: string;
    poster: string;
    rating?: string;
    produser?: string;
    type?: string;
    status?: string;
    episode_count?: string;
    duration?: string;
    release_date?: string;
    studio?: string;
    genres?: { name: string; slug: string }[];
    synopsis?: string;
    batch?: string | null;
    episode_lists?: {
        episode: string;
        episode_number: number;
        slug: string;
        otakudesu_url?: string;
    }[];
    recommendations?: {
        title: string;
        slug: string;
        poster: string;
    }[];
}

export interface SankaEpisodeDetail {
    episode: string;
    anime?: {
        slug: string;
        otakudesu_url?: string;
    };
    has_next_episode?: boolean;
    next_episode?: { slug: string } | null;
    has_previous_episode?: boolean;
    previous_episode?: { slug: string } | null;
    stream_url: string;
    stream_servers?: {
        quality: string;
        servers: { name: string; id: string }[];
    }[];
    download_urls?: {
        mp4?: {
            resolution: string;
            urls: { provider: string; url: string }[];
        }[];
        mkv?: {
            resolution: string;
            urls: { provider: string; url: string }[];
        }[];
    };
}

// Nekopoi Types
export interface SankaNekopoiItem {
    title: string;
    upload?: string;
    image?: string;
    link?: string;
}

export interface SankaNekopoiDetail {
    title: string;
    info?: string;
    img?: string;
    sinopsis?: string;
    genre?: string;
    anime?: string;
    producers?: string;
    duration?: string;
    size?: string;
    streams?: { name: string; url: string }[];
    download?: {
        type: string;
        title: string;
        links: { name: string; link: string }[];
    }[];
}

// Generic API Response
interface ApiResponse<T> {
    status: string;
    data: T;
}

interface PaginatedApiResponse<T> {
    status: string;
    data: {
        paginationData?: {
            current_page: number;
            last_visible_page: number;
            has_next_page?: boolean;
        };
        ongoingAnimeData?: T[];
        completeAnimeData?: T[];
        animeData?: T[];
    };
}

// ==================== AXIOS INSTANCE ====================

const createAxiosInstance = (baseURL: string): AxiosInstance => {
    return axios.create({
        baseURL,
        timeout: 15000,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
};

// ==================== SANKA ANIME SERVICE ====================

class SankaAnimeAPI {
    private api: AxiosInstance;

    constructor() {
        this.api = createAxiosInstance(ANIME_API);
    }

    /**
     * Get ongoing anime list
     */
    async getOngoingAnime(page: number = 1) {
        try {
            console.log("📺 Fetching ongoing anime, page:", page);
            const response = await this.api.get<
                PaginatedApiResponse<SankaAnimeItem>
            >(`/ongoing-anime?page=${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const { paginationData, ongoingAnimeData } = response.data.data;
                console.log(
                    "✅ Found",
                    ongoingAnimeData?.length || 0,
                    "ongoing anime"
                );
                return {
                    data: ongoingAnimeData || [],
                    pagination: paginationData,
                };
            }
            return { data: [], pagination: null };
        } catch (error) {
            console.error("❌ Failed to fetch ongoing anime:", error);
            return { data: [], pagination: null };
        }
    }

    /**
     * Get completed anime list
     */
    async getCompletedAnime(page: number = 1) {
        try {
            console.log("📺 Fetching completed anime, page:", page);
            const response = await this.api.get<
                PaginatedApiResponse<SankaAnimeItem>
            >(`/complete-anime/${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const { paginationData, completeAnimeData } =
                    response.data.data;
                console.log(
                    "✅ Found",
                    completeAnimeData?.length || 0,
                    "completed anime"
                );
                return {
                    data: completeAnimeData || [],
                    pagination: paginationData,
                };
            }
            return { data: [], pagination: null };
        } catch (error) {
            console.error("❌ Failed to fetch completed anime:", error);
            return { data: [], pagination: null };
        }
    }

    /**
     * Get anime detail by slug
     */
    async getAnimeDetail(slug: string) {
        try {
            console.log("📺 Fetching anime detail:", slug);
            const response = await this.api.get<ApiResponse<SankaAnimeDetail>>(
                `/anime/${slug}`
            );

            if (response.data?.status === "success" && response.data?.data) {
                console.log("✅ Found anime:", response.data.data.title);
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error("❌ Failed to fetch anime detail:", error);
            return null;
        }
    }

    /**
     * Get episode streaming data
     */
    async getEpisodeStream(episodeSlug: string) {
        try {
            console.log("📺 Fetching episode stream:", episodeSlug);
            const response = await this.api.get<
                ApiResponse<SankaEpisodeDetail>
            >(`/episode/${episodeSlug}`);

            if (response.data?.status === "success" && response.data?.data) {
                console.log(
                    "✅ Found stream URL:",
                    response.data.data.stream_url ? "Yes" : "No"
                );
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error("❌ Failed to fetch episode stream:", error);
            return null;
        }
    }

    /**
     * Search anime by keyword
     */
    async searchAnime(keyword: string) {
        try {
            console.log("🔍 Searching anime:", keyword);
            const response = await this.api.get<
                ApiResponse<{ title: string; slug: string; poster: string }[]>
            >(`/search/${encodeURIComponent(keyword)}`);

            if (response.data?.status === "success" && response.data?.data) {
                console.log("✅ Found", response.data.data.length, "results");
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error("❌ Failed to search anime:", error);
            return [];
        }
    }

    /**
     * Get all genres
     */
    async getGenres() {
        try {
            const response = await this.api.get<
                ApiResponse<{ name: string; slug: string }[]>
            >(`/genre`);

            if (response.data?.status === "success" && response.data?.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error("❌ Failed to fetch genres:", error);
            return [];
        }
    }

    /**
     * Get anime by genre
     */
    async getAnimeByGenre(genreSlug: string, page: number = 1) {
        try {
            const response = await this.api.get<
                PaginatedApiResponse<{
                    title: string;
                    slug: string;
                    poster: string;
                }>
            >(`/genre/${genreSlug}?page=${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const { paginationData, animeData } = response.data.data;
                return {
                    data: animeData || [],
                    pagination: paginationData,
                };
            }
            return { data: [], pagination: null };
        } catch (error) {
            console.error("❌ Failed to fetch anime by genre:", error);
            return { data: [], pagination: null };
        }
    }

    /**
     * Get server embed URL
     */
    async getServerUrl(serverId: string) {
        try {
            const response = await this.api.get<ApiResponse<{ url: string }>>(
                `/server/${serverId}`
            );

            if (
                response.data?.status === "success" &&
                response.data?.data?.url
            ) {
                return response.data.data.url;
            }
            return null;
        } catch (error) {
            console.error("❌ Failed to fetch server URL:", error);
            return null;
        }
    }
}

// ==================== SANKA NEKOPOI SERVICE ====================

class SankaNekopoiAPI {
    private api: AxiosInstance;

    constructor() {
        this.api = createAxiosInstance(NEKOPOI_API);
    }

    /**
     * Get latest hentai
     */
    async getLatest() {
        try {
            console.log("🔞 Fetching latest hentai");
            const response = await this.api.get<{
                status?: string;
                success?: boolean;
                results?: SankaNekopoiItem[];
            }>("/latest");

            console.log("📦 Nekopoi response:", response.data);

            const items = response.data?.results || [];
            console.log("✅ Found", items.length, "hentai items");
            return items;
        } catch (error) {
            console.error("❌ Failed to fetch latest hentai:", error);
            return [];
        }
    }

    /**
     * Get release list with pagination
     */
    async getReleaseList(page: number = 1) {
        try {
            console.log("🔞 Fetching hentai release list, page:", page);
            const response = await this.api.get<{
                status?: string;
                success?: boolean;
                results?: SankaNekopoiItem[];
            }>(`/release/${page}`);

            const items = response.data?.results || [];
            console.log("✅ Found", items.length, "hentai items");
            return {
                data: items,
                page,
                totalPages: 10, // API doesn't provide total
            };
        } catch (error) {
            console.error("❌ Failed to fetch hentai release list:", error);
            return { data: [], page, totalPages: 1 };
        }
    }

    /**
     * Search hentai
     */
    async search(query: string) {
        try {
            console.log("🔍 Searching hentai:", query);
            const response = await this.api.get<{
                status?: string;
                success?: boolean;
                results?: SankaNekopoiItem[];
            }>(`/search/${encodeURIComponent(query)}`);

            const items = response.data?.results || [];
            console.log("✅ Found", items.length, "results");
            return items;
        } catch (error) {
            console.error("❌ Failed to search hentai:", error);
            return [];
        }
    }

    /**
     * Get hentai detail by URL
     */
    async getDetail(nekopoiUrl: string) {
        try {
            // Ensure URL is properly formatted
            let url = nekopoiUrl;
            if (!url.startsWith("http")) {
                url = `https://nekopoi.care/${nekopoiUrl}/`;
            }
            if (!url.endsWith("/")) {
                url += "/";
            }

            console.log("🔞 Fetching hentai detail:", url);
            const response = await this.api.get<{
                status?: string;
                success?: boolean;
                data?: SankaNekopoiDetail;
            }>(`/get?url=${encodeURIComponent(url)}`);

            if (response.data?.success && response.data?.data) {
                console.log("✅ Found hentai:", response.data.data.title);
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error("❌ Failed to fetch hentai detail:", error);
            return null;
        }
    }

    /**
     * Get random hentai
     */
    async getRandom() {
        try {
            console.log("🎲 Fetching random hentai");
            const response = await this.api.get<{
                status?: string;
                success?: boolean;
                data?: SankaNekopoiDetail;
            }>("/random");

            if (response.data?.success && response.data?.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error("❌ Failed to fetch random hentai:", error);
            return null;
        }
    }
}

// ==================== EXPORT SINGLETON INSTANCES ====================

export const sankaAnimeAPI = new SankaAnimeAPI();
export const sankaNekopoiAPI = new SankaNekopoiAPI();

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if Sanka API is available
 */
export async function checkSankaAPIStatus() {
    try {
        const [animeResult, nekopoiResult] = await Promise.all([
            sankaAnimeAPI
                .getOngoingAnime(1)
                .then((r) => r.data.length > 0)
                .catch(() => false),
            sankaNekopoiAPI
                .getLatest()
                .then((r) => r.length > 0)
                .catch(() => false),
        ]);

        return {
            anime: animeResult,
            nekopoi: nekopoiResult,
        };
    } catch {
        return { anime: false, nekopoi: false };
    }
}
