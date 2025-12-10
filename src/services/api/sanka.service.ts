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

// Anime Types - Updated to match new API response
export interface SankaAnimeItem {
    title: string;
    poster: string;
    // New API format
    animeId?: string;
    episodes?: number;
    releaseDay?: string;
    latestReleaseDate?: string;
    href?: string;
    // Old API format (fallback)
    slug?: string;
    current_episode?: string;
    release_day?: string;
    newest_release_date?: string;
    otakudesu_url?: string;
}

export interface SankaAnimeDetail {
    title: string;
    poster: string;
    // New API format
    japanese?: string;
    score?: string;
    producers?: string;
    type?: string;
    status?: string;
    episodes?: number | null;
    duration?: string;
    aired?: string;
    studios?: string;
    batch?: string | null;
    synopsis?:
        | {
              paragraphs?: string[];
              connections?: any[];
          }
        | string;
    genreList?: { title: string; genreId: string; href: string }[];
    episodeList?: {
        title: number | string;
        episodeId: string;
        href: string;
    }[];
    // Old API format (fallback)
    slug?: string;
    japanese_title?: string;
    rating?: string;
    produser?: string;
    episode_count?: string;
    release_date?: string;
    studio?: string;
    genres?: { name: string; slug: string }[];
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
    // New API format
    title?: string;
    animeId?: string;
    releaseTime?: string;
    defaultStreamingUrl?: string;
    hasPrevEpisode?: boolean;
    prevEpisode?: { title: string; episodeId: string; href: string } | null;
    hasNextEpisode?: boolean;
    nextEpisode?: { title: string; episodeId: string; href: string } | null;
    server?: {
        qualities: {
            title: string;
            serverList: { title: string; serverId: string; href: string }[];
        }[];
    };
    downloadUrl?: {
        formats: {
            title: string;
            qualities: {
                title: string;
                urls: { title: string; url: string }[];
            }[];
        }[];
    };
    // Old API format (fallback)
    episode?: string;
    anime?: {
        slug: string;
        otakudesu_url?: string;
    };
    has_next_episode?: boolean;
    next_episode?: { slug: string } | null;
    has_previous_episode?: boolean;
    previous_episode?: { slug: string } | null;
    stream_url?: string;
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

// Updated API Response format
interface NewApiResponse<T> {
    status: string;
    ok?: boolean;
    data: {
        // New format
        animeList?: T[];
        pagination?: {
            currentPage: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        // Old format (fallback)
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
            const response = await this.api.get<NewApiResponse<SankaAnimeItem>>(
                `/ongoing-anime?page=${page}`
            );

            console.log("📦 API Response:", response.data);

            if (response.data?.status === "success" && response.data?.data) {
                // Try new format first (animeList), then old format (ongoingAnimeData)
                const animeData =
                    response.data.data.animeList ||
                    response.data.data.ongoingAnimeData ||
                    [];

                // Normalize the data to have consistent slug field
                const normalizedData = animeData.map((item) => ({
                    ...item,
                    slug: item.animeId || item.slug || "",
                    current_episode: item.episodes
                        ? `Total ${item.episodes} Eps`
                        : item.current_episode,
                }));

                const pagination =
                    response.data.data.pagination ||
                    response.data.data.paginationData;

                console.log("✅ Found", normalizedData.length, "ongoing anime");
                return {
                    data: normalizedData,
                    pagination,
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
            const response = await this.api.get<NewApiResponse<SankaAnimeItem>>(
                `/complete-anime?page=${page}`
            );

            if (response.data?.status === "success" && response.data?.data) {
                // Try new format first (animeList), then old format (completeAnimeData)
                const animeData =
                    response.data.data.animeList ||
                    response.data.data.completeAnimeData ||
                    [];

                // Normalize the data
                const normalizedData = animeData.map((item) => ({
                    ...item,
                    slug: item.animeId || item.slug || "",
                    current_episode: item.episodes
                        ? `Total ${item.episodes} Eps`
                        : item.current_episode,
                }));

                const pagination =
                    response.data.data.pagination ||
                    response.data.data.paginationData;

                console.log(
                    "✅ Found",
                    normalizedData.length,
                    "completed anime"
                );
                return {
                    data: normalizedData,
                    pagination,
                };
            }
            return { data: [], pagination: null };
        } catch (error) {
            console.error("❌ Failed to fetch completed anime:", error);
            return { data: [], pagination: null };
        }
    }

    /**
     * Get all anime (unlimited) - returns all anime data
     * Endpoint: GET /anime/unlimited
     * Response format: { status, data: { list: [{ startWith, animeList: [...] }] } }
     */
    async getAllAnime() {
        try {
            console.log("📺 Fetching all anime (unlimited)");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await this.api.get<any>(`/unlimited`);

            console.log(
                "📦 Unlimited API response:",
                response.data?.status,
                "data keys:",
                Object.keys(response.data?.data || {})
            );

            if (response.data?.status === "success" && response.data?.data) {
                // Handle the nested list format: data.list[].animeList[]
                const dataObj = response.data.data;
                let allAnime: SankaAnimeItem[] = [];

                // Check if data has 'list' array (grouped by startWith letter)
                if (dataObj.list && Array.isArray(dataObj.list)) {
                    console.log(
                        "📦 Found list format with",
                        dataObj.list.length,
                        "groups"
                    );
                    // Flatten all animeList arrays from each group
                    dataObj.list.forEach(
                        (group: {
                            startWith: string;
                            animeList: SankaAnimeItem[];
                        }) => {
                            if (
                                group.animeList &&
                                Array.isArray(group.animeList)
                            ) {
                                allAnime = allAnime.concat(group.animeList);
                            }
                        }
                    );
                } else if (Array.isArray(dataObj)) {
                    // Direct array format
                    allAnime = dataObj;
                } else if (
                    dataObj.animeList &&
                    Array.isArray(dataObj.animeList)
                ) {
                    // Single animeList format
                    allAnime = dataObj.animeList;
                }

                // Normalize the data
                const normalizedData = allAnime.map((item) => ({
                    ...item,
                    slug: item.animeId || item.slug || "",
                    current_episode: item.episodes
                        ? `Total ${item.episodes} Eps`
                        : item.current_episode,
                }));

                console.log("✅ Found", normalizedData.length, "total anime");
                return normalizedData;
            }
            return [];
        } catch (error) {
            console.error("❌ Failed to fetch all anime:", error);
            return [];
        }
    }

    // Cache for anime posters to avoid repeated API calls
    private posterCache: Map<string, string> = new Map();

    /**
     * Fetch poster for a single anime from detail endpoint
     */
    private async fetchPosterFromDetail(
        animeId: string
    ): Promise<string | null> {
        // Check cache first
        if (this.posterCache.has(animeId)) {
            console.log(
                `🖼️ Cache hit for ${animeId}:`,
                this.posterCache.get(animeId)
            );
            return this.posterCache.get(animeId) || null;
        }

        try {
            console.log(`🖼️ Fetching poster for ${animeId}...`);
            const detail = await this.getAnimeDetail(animeId);
            console.log(
                `🖼️ Detail response for ${animeId}:`,
                detail?.poster ? "Has poster" : "No poster",
                detail?.poster
            );
            if (detail?.poster) {
                this.posterCache.set(animeId, detail.poster);
                return detail.poster;
            }
            return null;
        } catch (error) {
            console.error(`❌ Error fetching poster for ${animeId}:`, error);
            return null;
        }
    }

    /**
     * Fetch posters for multiple anime in parallel (with concurrency limit)
     */
    private async fetchPostersInBatch(
        animeList: SankaAnimeItem[],
        concurrency: number = 6
    ): Promise<SankaAnimeItem[]> {
        console.log(
            `🖼️ Starting batch fetch for ${animeList.length} anime posters...`
        );
        const results: SankaAnimeItem[] = [];

        // Process in batches to avoid overwhelming the API
        for (let i = 0; i < animeList.length; i += concurrency) {
            const batch = animeList.slice(i, i + concurrency);
            console.log(
                `🖼️ Processing batch ${
                    Math.floor(i / concurrency) + 1
                }, items ${i} to ${i + batch.length - 1}`
            );

            const batchPromises = batch.map(async (anime) => {
                const animeId = anime.animeId || anime.slug || "";
                if (!animeId) {
                    console.log(`⚠️ No animeId for:`, anime.title);
                    return anime;
                }

                // Check cache first
                if (this.posterCache.has(animeId)) {
                    const cachedPoster = this.posterCache.get(animeId) || "";
                    console.log(
                        `✅ Cache hit for ${animeId}:`,
                        cachedPoster.substring(0, 50)
                    );
                    return {
                        ...anime,
                        poster: cachedPoster,
                    };
                }

                // Fetch from detail
                const poster = await this.fetchPosterFromDetail(animeId);
                console.log(
                    `📥 Fetched poster for ${animeId}:`,
                    poster ? poster.substring(0, 50) : "null"
                );
                return {
                    ...anime,
                    poster: poster || "",
                };
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            console.log(`✅ Batch complete, total results: ${results.length}`);

            // Small delay between batches to be nice to the API
            if (i + concurrency < animeList.length) {
                await new Promise((r) => setTimeout(r, 50));
            }
        }

        console.log(
            `🖼️ All batches complete. Total: ${results.length} anime with posters`
        );
        return results;
    }

    /**
     * Get all anime with client-side pagination
     * Uses /anime/unlimited endpoint and paginates on client
     * Fetches posters from detail endpoint for each anime
     */
    async getAllAnimePaginated(page: number = 1, perPage: number = 24) {
        try {
            console.log(
                `📺 Fetching all anime, page ${page}, perPage ${perPage}`
            );
            const allAnime = await this.getAllAnime();

            if (allAnime.length === 0) {
                return {
                    data: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                };
            }

            const totalPages = Math.ceil(allAnime.length / perPage);
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedData = allAnime.slice(startIndex, endIndex);

            console.log(
                `📺 Fetching posters for ${paginatedData.length} anime...`
            );

            // Fetch posters from detail endpoint for current page items
            const dataWithPosters = await this.fetchPostersInBatch(
                paginatedData,
                6
            );

            // Log sample data to verify posters
            if (dataWithPosters.length > 0) {
                console.log(`🖼️ Sample data with poster:`, {
                    title: dataWithPosters[0].title,
                    poster: dataWithPosters[0].poster,
                    animeId: dataWithPosters[0].animeId,
                });
            }

            console.log(
                `✅ Returning ${dataWithPosters.length} anime with posters (page ${page} of ${totalPages})`
            );

            return {
                data: dataWithPosters,
                pagination: {
                    currentPage: page,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    totalItems: allAnime.length,
                },
            };
        } catch (error) {
            console.error("❌ Failed to fetch paginated anime:", error);
            return {
                data: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            };
        }
    }

    /**
     * Get poster for a single anime (public method for lazy loading)
     */
    async getAnimePoster(animeId: string): Promise<string | null> {
        return this.fetchPosterFromDetail(animeId);
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
                const data = response.data.data;
                console.log(
                    "✅ Found anime:",
                    data.title,
                    "| Poster:",
                    data.poster
                        ? data.poster.substring(0, 60) + "..."
                        : "NO POSTER"
                );

                // Normalize synopsis
                let synopsis = "";
                if (
                    typeof data.synopsis === "object" &&
                    data.synopsis?.paragraphs
                ) {
                    synopsis = data.synopsis.paragraphs.join("\n\n");
                } else if (typeof data.synopsis === "string") {
                    synopsis = data.synopsis;
                }

                // Normalize episode list
                const episodeLists =
                    data.episodeList?.map((ep) => ({
                        episode: `Episode ${ep.title}`,
                        episode_number:
                            typeof ep.title === "number"
                                ? ep.title
                                : parseInt(String(ep.title)) || 0,
                        slug: ep.episodeId,
                        otakudesu_url: ep.href,
                    })) ||
                    data.episode_lists ||
                    [];

                // Normalize genres
                const genres =
                    data.genreList?.map((g) => ({
                        name: g.title,
                        slug: g.genreId,
                    })) ||
                    data.genres ||
                    [];

                return {
                    ...data,
                    synopsis,
                    episode_lists: episodeLists,
                    genres,
                    studio: data.studios || data.studio,
                    release_date: data.aired || data.release_date,
                    rating: data.score || data.rating,
                };
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
                const data = response.data.data;
                const streamUrl =
                    data.defaultStreamingUrl || data.stream_url || "";
                console.log("✅ Found stream URL:", streamUrl ? "Yes" : "No");

                // Normalize to old format for compatibility
                return {
                    episode: data.title || data.episode || "",
                    anime: {
                        slug: data.animeId || data.anime?.slug || "",
                    },
                    stream_url: streamUrl,
                    has_next_episode:
                        data.hasNextEpisode ?? data.has_next_episode,
                    next_episode: data.nextEpisode
                        ? { slug: data.nextEpisode.episodeId }
                        : data.next_episode,
                    has_previous_episode:
                        data.hasPrevEpisode ?? data.has_previous_episode,
                    previous_episode: data.prevEpisode
                        ? { slug: data.prevEpisode.episodeId }
                        : data.previous_episode,
                    stream_servers:
                        data.server?.qualities.map((q) => ({
                            quality: q.title,
                            servers: q.serverList.map((s) => ({
                                name: s.title,
                                id: s.serverId,
                            })),
                        })) || data.stream_servers,
                };
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
                NewApiResponse<{
                    title: string;
                    slug?: string;
                    animeId?: string;
                    poster: string;
                }>
            >(`/genre/${genreSlug}?page=${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const animeData =
                    response.data.data.animeList ||
                    response.data.data.animeData ||
                    [];
                const pagination =
                    response.data.data.pagination ||
                    response.data.data.paginationData;

                // Normalize data
                const normalizedData = animeData.map((item) => ({
                    ...item,
                    slug: (item as any).animeId || item.slug || "",
                }));

                return {
                    data: normalizedData,
                    pagination,
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
