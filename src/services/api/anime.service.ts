/**
 * Anime Service - Uses Sanka Vollerei API (Otakudesu) as primary source
 * Jikan API as fallback for search and detail
 */

import axios from "axios";
import { Movie, AnimeDetail, AnimeEpisode } from "./types";
import { sankaAnimeAPI } from "./sanka.service";

const JIKAN_API = "https://api.jikan.moe/v4";

interface JikanAnime {
    mal_id: number;
    title: string;
    title_english?: string;
    images: {
        jpg: { image_url: string; large_image_url?: string };
        webp?: { image_url: string; large_image_url?: string };
    };
    synopsis?: string;
    score?: number;
    episodes?: number;
    status?: string;
    aired?: { string?: string };
    year?: number;
    genres?: { name: string }[];
    studios?: { name: string }[];
    duration?: string;
}

const ensureImageUrl = (url: string | undefined): string => {
    if (!url || url === "null") return "/placeholder.svg";
    return url;
};

export const mapJikanAnimeToMovie = (anime: JikanAnime): Movie => ({
    id: String(anime.mal_id),
    title: anime.title_english || anime.title,
    cover: ensureImageUrl(anime.images?.jpg?.large_image_url),
    genre: anime.genres?.map((g) => g.name) || [],
    type: "anime",
    slug: String(anime.mal_id),
    rating: anime.score || 0,
    country: "Japan",
    year: anime.year ? String(anime.year) : "",
    synopsis: anime.synopsis || "",
});

export class AnimeService {
    private lastJikanRequest = 0;

    private async jikanRequest<T>(url: string): Promise<T | null> {
        const now = Date.now();
        if (now - this.lastJikanRequest < 350) {
            await new Promise((r) => setTimeout(r, 350));
        }
        this.lastJikanRequest = Date.now();
        try {
            const response = await axios.get<T>(url);
            return response.data;
        } catch {
            return null;
        }
    }

    /**
     * Get ongoing anime from Otakudesu (Sanka API)
     */
    async getOngoingAnime(): Promise<Movie[]> {
        try {
            const result = await sankaAnimeAPI.getOngoingAnime(1);
            console.log("Ongoing anime result:", result);
            return result.data.map((anime) => ({
                id: anime.slug || anime.animeId || "",
                title: anime.title,
                cover: ensureImageUrl(anime.poster),
                genre: [],
                type: "anime" as const,
                slug: anime.slug || anime.animeId || "",
                latestEpisode:
                    anime.current_episode ||
                    (anime.episodes ? `${anime.episodes} Eps` : ""),
                synopsis: "",
            }));
        } catch (error) {
            console.error("Failed to fetch ongoing anime:", error);
            return [];
        }
    }

    /**
     * Get completed anime from Otakudesu (Sanka API)
     */
    async getCompleteAnime(page: number = 1) {
        try {
            const result = await sankaAnimeAPI.getCompletedAnime(page);
            // Handle both old and new pagination format
            const totalPages =
                (result.pagination as any)?.totalPages ||
                (result.pagination as any)?.last_visible_page ||
                1;

            return {
                data: result.data.map((anime) => ({
                    id: anime.slug || anime.animeId || "",
                    title: anime.title,
                    cover: ensureImageUrl(anime.poster),
                    genre: [],
                    type: "anime" as const,
                    slug: anime.slug || anime.animeId || "",
                    synopsis: "",
                })),
                page,
                totalPages,
                totalItems: result.data.length,
            };
        } catch (error) {
            console.error("Failed to fetch completed anime:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    /**
     * Get all anime with pagination (uses /anime/unlimited endpoint)
     * Posters are fetched from detail endpoint by sanka.service
     */
    async getAllAnimePaginated(page: number = 1, perPage: number = 24) {
        try {
            const result = await sankaAnimeAPI.getAllAnimePaginated(
                page,
                perPage
            );

            // Log first item to debug poster field
            if (result.data.length > 0) {
                console.log("📦 Sample anime data with poster:", {
                    title: result.data[0].title,
                    poster: result.data[0].poster,
                    animeId: result.data[0].animeId,
                });
            }

            return {
                data: result.data.map((anime: any) => ({
                    id: anime.slug || anime.animeId || "",
                    title: anime.title,
                    // Poster is now fetched from detail endpoint
                    cover: ensureImageUrl(anime.poster),
                    genre: [],
                    type: "anime" as const,
                    slug: anime.slug || anime.animeId || "",
                    latestEpisode: anime.episodes
                        ? `${anime.episodes} Eps`
                        : "",
                    synopsis: "",
                })),
                page,
                totalPages: result.pagination.totalPages,
                totalItems: (result.pagination as any).totalItems || 0,
                hasNextPage: result.pagination.hasNextPage,
                hasPrevPage: result.pagination.hasPrevPage,
            };
        } catch (error) {
            console.error("Failed to fetch all anime paginated:", error);
            return {
                data: [],
                page: 1,
                totalPages: 1,
                totalItems: 0,
                hasNextPage: false,
                hasPrevPage: false,
            };
        }
    }

    /**
     * Get anime genres from Otakudesu (Sanka API)
     */
    async getAnimeGenres() {
        try {
            return await sankaAnimeAPI.getGenres();
        } catch (error) {
            console.error("Failed to fetch anime genres:", error);
            return [];
        }
    }

    /**
     * Get anime by genre from Otakudesu (Sanka API)
     */
    async getAnimeByGenre(genreSlug: string, page: number = 1) {
        try {
            const result = await sankaAnimeAPI.getAnimeByGenre(genreSlug, page);
            // Handle both old and new pagination format
            const totalPages =
                (result.pagination as any)?.totalPages ||
                (result.pagination as any)?.last_visible_page ||
                1;

            return {
                data: result.data.map((anime) => ({
                    id: anime.slug || "",
                    title: anime.title,
                    cover: ensureImageUrl(anime.poster),
                    genre: [],
                    type: "anime" as const,
                    slug: anime.slug || "",
                    synopsis: "",
                })),
                page,
                totalPages,
                totalItems: result.data.length,
            };
        } catch (error) {
            console.error("Failed to fetch anime by genre:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    /**
     * Search anime from Otakudesu (Sanka API) with Jikan fallback
     */
    async searchAnime(query: string): Promise<Movie[]> {
        try {
            // Try Otakudesu first
            const otakudesuResults = await sankaAnimeAPI.searchAnime(query);
            if (otakudesuResults.length > 0) {
                return otakudesuResults.map((anime) => ({
                    id: anime.slug,
                    title: anime.title,
                    cover: ensureImageUrl(anime.poster),
                    genre: [],
                    type: "anime" as const,
                    slug: anime.slug,
                    synopsis: "",
                }));
            }

            // Fallback to Jikan
            const jikanData = await this.jikanRequest<{
                data: JikanAnime[];
            }>(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=20`);

            if (jikanData?.data) {
                return jikanData.data.map(mapJikanAnimeToMovie);
            }

            return [];
        } catch (error) {
            console.error("Failed to search anime:", error);
            return [];
        }
    }

    /**
     * Search anime from Otakudesu only (Sanka API)
     */
    async searchAnimeOtakudesu(query: string): Promise<Movie[]> {
        try {
            const results = await sankaAnimeAPI.searchAnime(query);
            return results.map((anime) => ({
                id: anime.slug,
                title: anime.title,
                cover: ensureImageUrl(anime.poster),
                genre: [],
                type: "anime" as const,
                slug: anime.slug,
                synopsis: "",
            }));
        } catch (error) {
            console.error("Failed to search Otakudesu anime:", error);
            return [];
        }
    }

    /**
     * Get anime detail from Otakudesu (Sanka API)
     */
    async getAnimeDetailOtakudesu(slug: string): Promise<AnimeDetail | null> {
        try {
            const detail = await sankaAnimeAPI.getAnimeDetail(slug);
            if (!detail) return null;

            const episodes: AnimeEpisode[] =
                detail.episode_lists?.map((ep: any) => ({
                    title: ep.episode || `Episode ${ep.episode_number}`,
                    slug: ep.slug,
                    link: ep.otakudesu_url || "",
                })) || [];

            // Get synopsis - already normalized in sanka.service.ts
            const synopsis =
                typeof detail.synopsis === "string" ? detail.synopsis : "";

            return {
                id: slug,
                title: detail.title,
                cover: ensureImageUrl(detail.poster),
                genre: detail.genres?.map((g: any) => g.name) || [],
                type: "anime",
                slug: slug,
                synopsis,
                status: detail.status || "",
                studio: detail.studio || detail.studios || "",
                duration: detail.duration || "",
                releaseDate: detail.release_date || detail.aired || "",
                totalEpisodes:
                    detail.episode_count ||
                    (detail.episodes ? String(detail.episodes) : "") ||
                    String(episodes.length),
                episodes,
                rating: parseFloat(detail.rating || detail.score || "0"),
            };
        } catch (error) {
            console.error("Failed to fetch Otakudesu anime detail:", error);
            return null;
        }
    }

    /**
     * Get episode stream from Otakudesu (Sanka API)
     */
    async getEpisodeStreamOtakudesu(episodeSlug: string) {
        try {
            const episodeData = await sankaAnimeAPI.getEpisodeStream(
                episodeSlug
            );
            if (!episodeData) return null;

            return {
                title: episodeData.episode,
                streamUrl: episodeData.stream_url,
                streamServers: episodeData.stream_servers?.flatMap((quality) =>
                    quality.servers.map((server) => ({
                        name: `${server.name} (${quality.quality})`,
                        url: episodeData.stream_url || "",
                        available: true,
                        quality: quality.quality,
                    }))
                ),
                nextEpisode: episodeData.next_episode?.slug,
                prevEpisode: episodeData.previous_episode?.slug,
                downloadUrls: (episodeData as any).download_urls,
            };
        } catch (error) {
            console.error("Failed to fetch episode stream:", error);
            return null;
        }
    }

    /**
     * Get anime detail from Jikan (MAL) - Fallback
     */
    async getAnimeDetail(id: string): Promise<AnimeDetail | null> {
        try {
            const jikanData = await this.jikanRequest<{ data: JikanAnime }>(
                `${JIKAN_API}/anime/${id}/full`
            );

            if (!jikanData?.data) return null;

            const anime = jikanData.data;

            // Get episodes if available
            const episodesData = await this.jikanRequest<{
                data: { mal_id: number; title: string; url: string }[];
            }>(`${JIKAN_API}/anime/${id}/episodes`);

            const episodes: AnimeEpisode[] =
                episodesData?.data?.map((ep) => ({
                    title: ep.title || `Episode ${ep.mal_id}`,
                    slug: `not-available-${ep.mal_id}`,
                    link: ep.url,
                })) || [];

            return {
                id: String(anime.mal_id),
                title: anime.title_english || anime.title,
                cover: ensureImageUrl(anime.images?.jpg?.large_image_url),
                genre: anime.genres?.map((g) => g.name) || [],
                type: "anime",
                slug: String(anime.mal_id),
                synopsis: anime.synopsis || "",
                status: anime.status || "",
                studio: anime.studios?.[0]?.name || "",
                duration: anime.duration || "",
                releaseDate: anime.aired?.string || "",
                totalEpisodes: anime.episodes ? String(anime.episodes) : "",
                episodes,
                rating: anime.score || 0,
            };
        } catch (error) {
            console.error("Failed to fetch Jikan anime detail:", error);
            return null;
        }
    }
}
