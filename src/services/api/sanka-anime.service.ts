// Sanka Vollerei Anime Stream API Service
// API: https://www.sankavollerei.com/anime/stream

import axios from "axios";
import type {
    Movie,
    AnimeDetail,
    PaginatedResponse,
    StreamingProvider,
} from "./types";

const SANKA_API = "https://www.sankavollerei.com/anime/stream";

// API Response Types
interface SankaLatestItem {
    title: string;
    slug: string;
    poster: string;
    episode: string;
}

interface SankaAnimeDetail {
    title: string;
    poster: string;
    synopsis: string;
    genres: string[];
    episodes: {
        eps_title: string;
        eps_slug: string;
    }[];
}

interface SankaEpisodeDetail {
    title: string;
    poster: string;
    synopsis: string;
    stream_links: {
        server: string;
        url: string;
    }[];
    download_links: {
        server: string;
        url: string;
    }[];
    next_slug: string | null;
    prev_slug: string | null;
}

// Helper to extract anime slug from episode slug
const extractAnimeSlug = (episodeSlug: string): string => {
    // "isekai-quartet-3-episode-1" -> "isekai-quartet-3"
    return episodeSlug.replace(/-episode-\d+$/, "");
};

export class SankaAnimeService {
    // Get latest anime episodes
    async getLatest(page: number = 1): Promise<PaginatedResponse<Movie>> {
        try {
            console.log(`Fetching latest anime from Sanka API, page ${page}`);
            const response = await axios.get<{
                status: number;
                page: number;
                data: SankaLatestItem[];
            }>(`${SANKA_API}/latest?page=${page}`);

            if (response.data?.status === 200 && response.data?.data) {
                const movies: Movie[] = response.data.data.map((item) => ({
                    id: extractAnimeSlug(item.slug),
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: extractAnimeSlug(item.slug),
                    latestEpisode: `Episode ${item.episode}`,
                    country: "Japan",
                }));

                return {
                    data: movies,
                    page: response.data.page || page,
                    totalPages: 10, // API doesn't provide total, estimate
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("Sanka API getLatest error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }

    // Get popular anime
    async getPopular(): Promise<Movie[]> {
        try {
            console.log("Fetching popular anime from Sanka API");
            const response = await axios.get<{
                status: number;
                data: SankaLatestItem[];
            }>(`${SANKA_API}/popular`);

            if (response.data?.status === 200 && response.data?.data) {
                return response.data.data.map((item) => ({
                    id: extractAnimeSlug(item.slug),
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: extractAnimeSlug(item.slug),
                    latestEpisode: `Episode ${item.episode}`,
                    country: "Japan",
                }));
            }
            return [];
        } catch (error) {
            console.error("Sanka API getPopular error:", error);
            return [];
        }
    }

    // Search anime
    async search(query: string): Promise<Movie[]> {
        try {
            console.log(`Searching anime on Sanka API: ${query}`);
            const response = await axios.get<{
                status: number;
                data: SankaLatestItem[];
            }>(`${SANKA_API}/search?query=${encodeURIComponent(query)}`);

            if (response.data?.status === 200 && response.data?.data) {
                return response.data.data.map((item) => ({
                    id: extractAnimeSlug(item.slug),
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: extractAnimeSlug(item.slug),
                    latestEpisode: item.episode
                        ? `Episode ${item.episode}`
                        : undefined,
                    country: "Japan",
                }));
            }
            return [];
        } catch (error) {
            console.error("Sanka API search error:", error);
            return [];
        }
    }

    // Get anime detail
    async getAnimeDetail(animeSlug: string): Promise<AnimeDetail | null> {
        try {
            console.log(`Fetching anime detail from Sanka API: ${animeSlug}`);
            const response = await axios.get<{
                status: number;
                data: SankaAnimeDetail;
            }>(`${SANKA_API}/anime/${animeSlug}`);

            if (response.data?.status === 200 && response.data?.data) {
                const data = response.data.data;
                return {
                    id: animeSlug,
                    title: data.title,
                    cover: data.poster || "/placeholder.svg",
                    synopsis: data.synopsis || "",
                    genre: data.genres || [],
                    type: "anime",
                    slug: animeSlug,
                    status: "Ongoing",
                    totalEpisodes: data.episodes?.length
                        ? String(data.episodes.length)
                        : undefined,
                    episodes:
                        data.episodes?.map((ep) => ({
                            title: ep.eps_title.trim(),
                            slug: ep.eps_slug,
                            link: `/anime/watch/${ep.eps_slug}`,
                        })) || [],
                    country: "Japan",
                };
            }
            return null;
        } catch (error) {
            console.error("Sanka API getAnimeDetail error:", error);
            return null;
        }
    }

    // Get episode streaming links
    async getEpisodeStream(episodeSlug: string): Promise<{
        title: string;
        poster: string;
        synopsis: string;
        streamLinks: StreamingProvider[];
        downloadLinks: { server: string; url: string }[];
        nextSlug: string | null;
        prevSlug: string | null;
    } | null> {
        try {
            console.log(
                `Fetching episode stream from Sanka API: ${episodeSlug}`
            );
            const response = await axios.get<{
                status: number;
                data: SankaEpisodeDetail;
            }>(`${SANKA_API}/episode/${episodeSlug}`);

            if (response.data?.status === 200 && response.data?.data) {
                const data = response.data.data;
                return {
                    title: data.title,
                    poster: data.poster || "/placeholder.svg",
                    synopsis: data.synopsis || "",
                    streamLinks:
                        data.stream_links?.map((link) => ({
                            name: link.server,
                            url: link.url,
                            available: true,
                            quality: "HD",
                        })) || [],
                    downloadLinks: data.download_links || [],
                    nextSlug: data.next_slug,
                    prevSlug: data.prev_slug,
                };
            }
            return null;
        } catch (error) {
            console.error("Sanka API getEpisodeStream error:", error);
            return null;
        }
    }

    // Get anime list (all anime A-Z)
    async getAnimeList(): Promise<Movie[]> {
        try {
            console.log("Fetching anime list from Sanka API");
            const response = await axios.get<{
                status: number;
                data: { title: string; slug: string }[];
            }>(`${SANKA_API}/list`);

            if (response.data?.status === 200 && response.data?.data) {
                return response.data.data.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: item.slug,
                    country: "Japan",
                }));
            }
            return [];
        } catch (error) {
            console.error("Sanka API getAnimeList error:", error);
            return [];
        }
    }

    // Get genres
    async getGenres(): Promise<string[]> {
        try {
            const response = await axios.get<{
                status: number;
                data: { genre: string; slug: string }[];
            }>(`${SANKA_API}/genres`);

            if (response.data?.status === 200 && response.data?.data) {
                return response.data.data.map((g) => g.genre);
            }
            return [];
        } catch (error) {
            console.error("Sanka API getGenres error:", error);
            return [];
        }
    }

    // Get anime by genre
    async getByGenre(
        genreSlug: string,
        page: number = 1
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const response = await axios.get<{
                status: number;
                data: SankaLatestItem[];
            }>(`${SANKA_API}/genre/${genreSlug}?page=${page}`);

            if (response.data?.status === 200 && response.data?.data) {
                const movies: Movie[] = response.data.data.map((item) => ({
                    id: extractAnimeSlug(item.slug),
                    title: item.title,
                    cover: item.poster || "/placeholder.svg",
                    genre: [],
                    type: "anime" as const,
                    slug: extractAnimeSlug(item.slug),
                    latestEpisode: item.episode
                        ? `Episode ${item.episode}`
                        : undefined,
                    country: "Japan",
                }));

                return {
                    data: movies,
                    page,
                    totalPages: 10,
                    totalItems: movies.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("Sanka API getByGenre error:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }
}

export const sankaAnimeService = new SankaAnimeService();
