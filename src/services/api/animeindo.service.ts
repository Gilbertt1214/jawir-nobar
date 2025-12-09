// Anime Indo Stream API Service (via Sanka Vollerei)
// API: https://api.sankavollerei.com/anime/stream
// Source: anime-indo.lol

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

const getAnimeIndoApiUrl = () => {
    if (isDev) return "/sanka-anime/stream";
    const baseUrl = ANIME_SCRAPER_URL;
    if (baseUrl.endsWith("/anime")) return `${baseUrl}/stream`;
    return `${baseUrl}/anime/stream`;
};

const ANIMEINDO_API = getAnimeIndoApiUrl();

// API Response Types
interface AnimeIndoItem {
    title: string;
    slug: string;
    poster: string;
    episode?: string;
    type?: string;
    status?: string;
    score?: string;
}

interface AnimeIndoDetail {
    title: string;
    slug: string;
    poster: string;
    type: string;
    status: string;
    score: string;
    synopsis: string;
    genres: string[];
    episodes: {
        episode: string;
        slug: string;
    }[];
}

interface AnimeIndoEpisode {
    title?: string;
    episode?: string;
    anime_slug?: string;
    stream_url?: string;
    streamUrl?: string;
    prev_episode?: string | null;
    next_episode?: string | null;
    prevEpisode?: string | null;
    nextEpisode?: string | null;
    servers?: { name: string; url: string; quality?: string }[];
}

export class AnimeIndoService {
    private baseUrl = ANIMEINDO_API;

    // Get latest anime episodes
    async getLatest(page: number = 1): Promise<PaginatedResponse<Movie>> {
        try {
            console.log(
                `Fetching latest anime from AnimeIndo API, page ${page}`
            );
            const response = await axios.get<{
                status: string;
                data: AnimeIndoItem[];
                pagination?: {
                    current_page: number;
                    last_page: number;
                };
            }>(`${this.baseUrl}/latest/${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const movies: Movie[] = response.data.data.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: item.slug,
                    latestEpisode: item.episode,
                    country: "Japan",
                }));

                return {
                    data: movies,
                    page: response.data.pagination?.current_page || page,
                    totalPages: response.data.pagination?.last_page || 10,
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("AnimeIndo API getLatest error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }

    // Get popular anime
    async getPopular(): Promise<Movie[]> {
        try {
            console.log("Fetching popular anime from AnimeIndo API");
            const response = await axios.get<{
                status: string;
                data: AnimeIndoItem[];
            }>(`${this.baseUrl}/popular`);

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
            console.error("AnimeIndo API getPopular error:", error);
            return [];
        }
    }

    // Search anime
    async search(query: string): Promise<Movie[]> {
        try {
            console.log(`Searching anime on AnimeIndo API: ${query}`);
            const response = await axios.get<{
                status: string;
                data: AnimeIndoItem[];
            }>(`${this.baseUrl}/search/${encodeURIComponent(query)}`);

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
            console.error("AnimeIndo API search error:", error);
            return [];
        }
    }

    // Get anime detail
    async getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
        try {
            console.log(`Fetching anime detail from AnimeIndo API: ${slug}`);
            const response = await axios.get<{
                status: string;
                data: AnimeIndoDetail;
            }>(`${this.baseUrl}/anime/${slug}`);

            if (response.data?.status === "success" && response.data?.data) {
                const data = response.data.data;
                return {
                    id: slug,
                    title: data.title,
                    cover: data.poster || "/placeholder.svg",
                    synopsis: data.synopsis || "",
                    genre: data.genres || [],
                    type: "anime",
                    slug: slug,
                    status: data.status,
                    rating: data.score ? parseFloat(data.score) : undefined,
                    totalEpisodes: String(data.episodes?.length || 0),
                    episodes:
                        data.episodes?.map((ep) => ({
                            title: `Episode ${ep.episode}`,
                            slug: ep.slug,
                            link: `/anime/watch/${ep.slug}`,
                        })) || [],
                    country: "Japan",
                };
            }
            return null;
        } catch (error) {
            console.error("AnimeIndo API getAnimeDetail error:", error);
            return null;
        }
    }

    // Get episode stream
    async getEpisodeStream(episodeSlug: string): Promise<{
        title: string;
        animeSlug: string;
        streamUrl: string;
        streamServers: StreamingProvider[];
        nextEpisode: string | null;
        prevEpisode: string | null;
    } | null> {
        try {
            console.log(
                `Fetching episode stream from AnimeIndo API: ${episodeSlug}`
            );
            const response = await axios.get<
                {
                    status?: string;
                    data?: AnimeIndoEpisode;
                } & AnimeIndoEpisode
            >(`${this.baseUrl}/episode/${episodeSlug}`);

            // Handle both wrapped and unwrapped response formats
            const data = response.data?.data || response.data;

            if (data) {
                // Get stream URL (handle both snake_case and camelCase)
                const streamUrl = data.stream_url || data.streamUrl || "";

                // Build stream servers array
                const streamServers: StreamingProvider[] = [];

                // Check if API returns servers array
                if (data.servers && Array.isArray(data.servers)) {
                    data.servers.forEach((server, idx) => {
                        streamServers.push({
                            name: server.name || `Server ${idx + 1}`,
                            url: server.url,
                            available: true,
                            quality: server.quality || "720p",
                        });
                    });
                } else if (streamUrl) {
                    // Single provider - Default
                    streamServers.push({
                        name: "Default",
                        url: streamUrl,
                        available: true,
                        quality: "720p",
                    });
                }

                return {
                    title:
                        data.title ||
                        data.episode ||
                        episodeSlug.replace(/-/g, " "),
                    animeSlug: data.anime_slug || "",
                    streamUrl,
                    streamServers,
                    nextEpisode: data.next_episode || data.nextEpisode || null,
                    prevEpisode: data.prev_episode || data.prevEpisode || null,
                };
            }
            return null;
        } catch (error) {
            console.error("AnimeIndo API getEpisodeStream error:", error);
            return null;
        }
    }

    // Get movie list
    async getMovies(page: number = 1): Promise<PaginatedResponse<Movie>> {
        try {
            console.log(`Fetching movies from AnimeIndo API, page ${page}`);
            const response = await axios.get<{
                status: string;
                data: AnimeIndoItem[];
                pagination?: {
                    current_page: number;
                    last_page: number;
                };
            }>(`${this.baseUrl}/movie/${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const movies: Movie[] = response.data.data.map((item) => ({
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
                    page: response.data.pagination?.current_page || page,
                    totalPages: response.data.pagination?.last_page || 10,
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("AnimeIndo API getMovies error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }

    // Get anime list (A-Z)
    async getAnimeList(): Promise<Movie[]> {
        try {
            console.log("Fetching anime list from AnimeIndo API");
            const response = await axios.get<{
                status: string;
                data: AnimeIndoItem[];
            }>(`${this.baseUrl}/list`);

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
            console.error("AnimeIndo API getAnimeList error:", error);
            return [];
        }
    }

    // Get genres
    async getGenres(): Promise<{ name: string; slug: string }[]> {
        try {
            const response = await axios.get<{
                status: string;
                data: { name: string; slug: string }[];
            }>(`${this.baseUrl}/genres`);

            if (response.data?.status === "success" && response.data?.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error("AnimeIndo API getGenres error:", error);
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
                data: AnimeIndoItem[];
                pagination?: {
                    current_page: number;
                    last_page: number;
                };
            }>(`${this.baseUrl}/genre/${genreSlug}/${page}`);

            if (response.data?.status === "success" && response.data?.data) {
                const movies: Movie[] = response.data.data.map((item) => ({
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
                    page: response.data.pagination?.current_page || page,
                    totalPages: response.data.pagination?.last_page || 10,
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("AnimeIndo API getAnimeByGenre error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }
}

export const animeIndoService = new AnimeIndoService();
