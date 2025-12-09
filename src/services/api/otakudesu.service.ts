// Otakudesu API Service (via Sanka Vollerei)
// API: https://api.sankavollerei.com/anime or https://www.sankavollerei.com/anime

import axios from "axios";
import type {
    Movie,
    AnimeDetail,
    PaginatedResponse,
    StreamingProvider,
} from "./types";
import { ANIME_SCRAPER_URL } from "./constants";

// Use proxy in development to avoid CORS issues
const isDev = import.meta.env.DEV;

// Use env variable, append /anime if base URL doesn't include it
const getOtakudesuApiUrl = () => {
    // In development, use proxy
    if (isDev) return "/sanka-anime";

    const baseUrl = ANIME_SCRAPER_URL;
    // If URL already ends with /anime, use as is
    if (baseUrl.endsWith("/anime")) return baseUrl;
    // Otherwise append /anime
    return `${baseUrl}/anime`;
};

const OTAKUDESU_API = getOtakudesuApiUrl();

// API Response Types
interface OtakudesuOngoingItem {
    title: string;
    slug: string;
    poster: string;
    current_episode: string;
    release_day: string;
    newest_release_date: string;
    otakudesu_url: string;
}

interface OtakudesuAnimeDetail {
    title: string;
    slug: string;
    japanese_title: string;
    poster: string;
    rating: string;
    produser: string;
    type: string;
    status: string;
    episode_count: string;
    duration: string;
    release_date: string;
    studio: string;
    genres: { name: string; slug: string }[];
    synopsis: string;
    batch: string | null;
    episode_lists: {
        episode: string;
        episode_number: number;
        slug: string;
        otakudesu_url: string;
    }[];
    recommendations: {
        title: string;
        slug: string;
        poster: string;
    }[];
}

interface OtakudesuEpisodeDetail {
    episode: string;
    anime: {
        slug: string;
        otakudesu_url: string;
    };
    has_next_episode: boolean;
    next_episode: { slug: string } | null;
    has_previous_episode: boolean;
    previous_episode: { slug: string } | null;
    stream_url: string;
    stream_servers: {
        quality: string;
        servers: {
            name: string;
            id: string;
        }[];
    }[];
    download_urls: {
        mp4: {
            resolution: string;
            urls: { provider: string; url: string }[];
        }[];
        mkv: {
            resolution: string;
            urls: { provider: string; url: string }[];
        }[];
    };
}

export class OtakudesuService {
    private baseUrl = OTAKUDESU_API;

    // Get ongoing anime
    async getOngoingAnime(page: number = 1): Promise<PaginatedResponse<Movie>> {
        try {
            console.log(
                `Fetching ongoing anime from Otakudesu API, page ${page}`
            );
            const response = await axios.get<{
                status: string;
                data: {
                    paginationData: {
                        current_page: number;
                        last_visible_page: number;
                        has_next_page: boolean;
                    };
                    ongoingAnimeData: OtakudesuOngoingItem[];
                };
            }>(`${this.baseUrl}/ongoing-anime?page=${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const { paginationData, ongoingAnimeData } = response.data.data;

                const movies: Movie[] = ongoingAnimeData.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: item.slug,
                    latestEpisode: item.current_episode,
                    country: "Japan",
                    releaseDate: item.newest_release_date,
                }));

                return {
                    data: movies,
                    page: paginationData.current_page,
                    totalPages: paginationData.last_visible_page,
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("Otakudesu API getOngoingAnime error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }

    // Get anime detail
    async getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
        try {
            console.log(`Fetching anime detail from Otakudesu API: ${slug}`);
            const response = await axios.get<{
                status: string;
                data: OtakudesuAnimeDetail;
            }>(`${this.baseUrl}/anime/${slug}`);

            if (response.data?.status === "success" && response.data?.data) {
                const data = response.data.data;
                return {
                    id: slug,
                    title: data.title,
                    cover: data.poster || "/placeholder.svg",
                    synopsis: data.synopsis || "",
                    genre: data.genres?.map((g) => g.name) || [],
                    type: "anime",
                    slug: slug,
                    status: data.status,
                    studio: data.studio,
                    duration: data.duration,
                    releaseDate: data.release_date,
                    rating: data.rating ? parseFloat(data.rating) : undefined,
                    totalEpisodes:
                        data.episode_count ||
                        String(data.episode_lists?.length || 0),
                    episodes:
                        data.episode_lists?.map((ep) => ({
                            title: `Episode ${ep.episode_number}`,
                            slug: ep.slug,
                            link: `/anime/watch/${ep.slug}`,
                        })) || [],
                    country: "Japan",
                };
            }
            return null;
        } catch (error) {
            console.error("Otakudesu API getAnimeDetail error:", error);
            return null;
        }
    }

    // Get episode streaming data
    async getEpisodeStream(episodeSlug: string): Promise<{
        title: string;
        animeSlug: string;
        streamUrl: string;
        streamServers: StreamingProvider[];
        nextEpisode: string | null;
        prevEpisode: string | null;
        downloadUrls: { resolution: string; provider: string; url: string }[];
    } | null> {
        try {
            console.log(
                `Fetching episode stream from Otakudesu API: ${episodeSlug}`
            );
            const response = await axios.get<{
                status: string;
                data: OtakudesuEpisodeDetail;
            }>(`${this.baseUrl}/episode/${episodeSlug}`);

            if (response.data?.status === "success" && response.data?.data) {
                const data = response.data.data;

                // Only use the default stream URL (single provider)
                const streamServers: StreamingProvider[] = [];
                if (data.stream_url) {
                    streamServers.push({
                        name: "Default",
                        url: data.stream_url,
                        available: true,
                        quality: "720p",
                    });
                }

                // Build download URLs
                const downloadUrls: {
                    resolution: string;
                    provider: string;
                    url: string;
                }[] = [];
                data.download_urls?.mp4?.forEach((res) => {
                    res.urls?.forEach((dl) => {
                        downloadUrls.push({
                            resolution: res.resolution,
                            provider: dl.provider,
                            url: dl.url,
                        });
                    });
                });

                return {
                    title: data.episode,
                    animeSlug: data.anime?.slug || "",
                    streamUrl: data.stream_url,
                    streamServers,
                    nextEpisode: data.next_episode?.slug || null,
                    prevEpisode: data.previous_episode?.slug || null,
                    downloadUrls,
                };
            }
            return null;
        } catch (error) {
            console.error("Otakudesu API getEpisodeStream error:", error);
            return null;
        }
    }

    // Get server embed URL
    async getServerUrl(serverId: string): Promise<string | null> {
        try {
            console.log(`Fetching server URL: ${serverId}`);
            const response = await axios.get<{
                status: string;
                data: { url: string };
            }>(`${this.baseUrl}/server/${serverId}`);

            if (
                response.data?.status === "success" &&
                response.data?.data?.url
            ) {
                return response.data.data.url;
            }
            return null;
        } catch (error) {
            console.error("Otakudesu API getServerUrl error:", error);
            return null;
        }
    }

    // Search anime
    async searchAnime(keyword: string): Promise<Movie[]> {
        try {
            console.log(`Searching anime on Otakudesu API: ${keyword}`);
            const response = await axios.get<{
                status: string;
                data: { title: string; slug: string; poster: string }[];
            }>(`${this.baseUrl}/search/${encodeURIComponent(keyword)}`);

            if (response.data?.status === "success" && response.data?.data) {
                return response.data.data.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: item.slug,
                    country: "Japan",
                }));
            }
            return [];
        } catch (error) {
            console.error("Otakudesu API searchAnime error:", error);
            return [];
        }
    }

    // Get complete anime list
    async getCompleteAnime(
        page: number = 1
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const response = await axios.get<{
                status: string;
                data: {
                    paginationData: {
                        current_page: number;
                        last_visible_page: number;
                    };
                    completeAnimeData: OtakudesuOngoingItem[];
                };
            }>(`${this.baseUrl}/complete-anime/${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const { paginationData, completeAnimeData } =
                    response.data.data;

                const movies: Movie[] = completeAnimeData.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: item.slug,
                    latestEpisode: item.current_episode,
                    country: "Japan",
                }));

                return {
                    data: movies,
                    page: paginationData.current_page,
                    totalPages: paginationData.last_visible_page,
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("Otakudesu API getCompleteAnime error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }

    // Get genres
    async getGenres(): Promise<{ name: string; slug: string }[]> {
        try {
            const response = await axios.get<{
                status: string;
                data: { name: string; slug: string }[];
            }>(`${this.baseUrl}/genre`);

            if (response.data?.status === "success" && response.data?.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error("Otakudesu API getGenres error:", error);
            return [];
        }
    }

    // Get anime by genre
    async getAnimeByGenre(
        genreSlug: string,
        page: number = 1
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const response = await axios.get<{
                status: string;
                data: {
                    paginationData: {
                        current_page: number;
                        last_visible_page: number;
                    };
                    animeData: {
                        title: string;
                        slug: string;
                        poster: string;
                    }[];
                };
            }>(`${this.baseUrl}/genre/${genreSlug}?page=${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const { paginationData, animeData } = response.data.data;

                const movies: Movie[] = animeData.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: item.slug,
                    country: "Japan",
                }));

                return {
                    data: movies,
                    page: paginationData.current_page,
                    totalPages: paginationData.last_visible_page,
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("Otakudesu API getAnimeByGenre error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }
}

export const otakudesuService = new OtakudesuService();
