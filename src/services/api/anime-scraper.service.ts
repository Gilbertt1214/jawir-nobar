// Anime Scraper Service
// Uses sankavollerei.com as the anime source

import { ANIME_SCRAPER_URL } from "./constants";
import type { Movie, PaginatedResponse } from "./types";

export interface AnimeEpisode {
    id: string;
    title: string;
    episodeNumber: number;
    streamUrl: string;
    thumbnail?: string;
}

export interface AnimeDetail {
    id: string;
    title: string;
    cover: string;
    synopsis: string;
    genre: string[];
    status: string;
    episodes: AnimeEpisode[];
}

export class AnimeScraperService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = ANIME_SCRAPER_URL;
    }

    // Get anime streaming URL
    getAnimeStreamUrl(animeSlug: string, episode?: number): string {
        if (episode) {
            return `${this.baseUrl}/${animeSlug}/episode-${episode}`;
        }
        return `${this.baseUrl}/${animeSlug}`;
    }

    // Get embed URL for iframe
    getEmbedUrl(animeSlug: string, episode: number): string {
        return `${this.baseUrl}/${animeSlug}/episode-${episode}`;
    }

    // Helper to ensure cover URL is complete
    private ensureCoverUrl(cover: string | undefined): string {
        if (!cover) return "/placeholder.svg";

        // If already absolute URL, return as is
        if (cover.startsWith("http://") || cover.startsWith("https://")) {
            return cover;
        }

        // If relative URL, prepend base URL
        if (cover.startsWith("/")) {
            // Extract domain from baseUrl
            const urlParts = this.baseUrl.match(/^(https?:\/\/[^\/]+)/);
            if (urlParts) {
                return `${urlParts[1]}${cover}`;
            }
        }

        return cover;
    }

    // Map API response to Movie type with proper cover URL
    private mapToMovie(item: any): Movie {
        // Handle different field names from API
        const cover =
            item.cover ||
            item.poster ||
            item.image ||
            item.thumbnail ||
            item.img;

        return {
            id: item.id || item.slug || item.animeId || "",
            title: item.title || item.name || "Unknown",
            cover: this.ensureCoverUrl(cover),
            rating: item.rating || item.score || 0,
            genre: item.genre || item.genres || [],
            country: item.country || "Japan",
            year: item.year || item.releaseYear || "",
            synopsis: item.synopsis || item.description || item.overview || "",
            type: "anime" as const,
            latestEpisode:
                item.latestEpisode || item.episode || item.eps || undefined,
        };
    }

    // Search anime
    async searchAnime(query: string): Promise<Movie[]> {
        try {
            console.log(`Searching anime: ${query} on ${this.baseUrl}`);

            // Try to fetch from API
            const response = await fetch(
                `${this.baseUrl}/search?q=${encodeURIComponent(query)}`,
                {
                    method: "GET",
                    headers: { Accept: "application/json" },
                }
            );

            if (!response.ok) {
                console.warn("Anime search API not available");
                return [];
            }

            const data = await response.json();
            const items = data.data || data.results || data.anime || data || [];

            return Array.isArray(items)
                ? items.map((item: any) => this.mapToMovie(item))
                : [];
        } catch (error) {
            console.error("Failed to search anime:", error);
            return [];
        }
    }

    // Get ongoing anime list
    async getOngoingAnimeList(): Promise<Movie[]> {
        try {
            console.log(`Getting ongoing anime from ${this.baseUrl}`);

            // Try to fetch from API
            const response = await fetch(`${this.baseUrl}/ongoing`, {
                method: "GET",
                headers: { Accept: "application/json" },
            });

            if (!response.ok) {
                console.warn(
                    "Ongoing anime API not available, returning empty"
                );
                return [];
            }

            const data = await response.json();
            const items =
                data.data ||
                data.results ||
                data.anime ||
                data.ongoing ||
                data ||
                [];

            return Array.isArray(items)
                ? items.map((item: any) => this.mapToMovie(item))
                : [];
        } catch (error) {
            console.error("Failed to get ongoing anime:", error);
            return [];
        }
    }

    // Get anime list with pagination
    async getAnimeList(page: number = 1): Promise<PaginatedResponse<Movie>> {
        try {
            console.log(`Getting anime list page ${page} from ${this.baseUrl}`);

            const response = await fetch(`${this.baseUrl}/list?page=${page}`, {
                method: "GET",
                headers: { Accept: "application/json" },
            });

            if (!response.ok) {
                return { data: [], page, totalPages: 1, totalItems: 0 };
            }

            const data = await response.json();
            const items = data.data || data.results || data.anime || data || [];

            return {
                data: Array.isArray(items)
                    ? items.map((item: any) => this.mapToMovie(item))
                    : [],
                page: data.page || page,
                totalPages: data.totalPages || data.total_pages || 1,
                totalItems: data.totalItems || data.total || items.length,
            };
        } catch (error) {
            console.error("Failed to get anime list:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    // Get anime detail
    async getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
        try {
            console.log(
                `Getting anime detail for ${slug} from ${this.baseUrl}`
            );

            const response = await fetch(`${this.baseUrl}/detail/${slug}`, {
                method: "GET",
                headers: { Accept: "application/json" },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            const item = data.data || data;

            return {
                id: item.id || slug,
                title: item.title || item.name || "Unknown",
                cover: this.ensureCoverUrl(
                    item.cover || item.poster || item.image
                ),
                synopsis: item.synopsis || item.description || "",
                genre: item.genre || item.genres || [],
                status: item.status || "Unknown",
                episodes: (item.episodes || []).map((ep: any, idx: number) => ({
                    id: ep.id || `${slug}-${idx + 1}`,
                    title: ep.title || `Episode ${idx + 1}`,
                    episodeNumber: ep.episodeNumber || ep.episode || idx + 1,
                    streamUrl: ep.streamUrl || this.getEmbedUrl(slug, idx + 1),
                    thumbnail: this.ensureCoverUrl(ep.thumbnail || ep.image),
                })),
            };
        } catch (error) {
            console.error("Failed to get anime detail:", error);
            return null;
        }
    }
}
