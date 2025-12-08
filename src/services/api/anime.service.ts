import axios from "axios";
import { Movie, AnimeDetail, AnimeEpisode } from "./types";

// Use sankavollerei.com public API (no server deployment needed!)
const API_BASE_URL = import.meta.env.VITE_ANIME_SCRAPER_URL || "https://api.sankavollerei.com/anime/otaku";

// Define specific types for Anime Scraper response
export interface OtakudesuAnime {
    title: string;
    image: string;
    episode?: string;
    slug: string;
    link: string;
}

export interface OtakudesuDetail {
    title: string;
    image: string;
    synopsis: string;
    info: {
        status?: string;
        genres?: string[];
        rating?: string;
        produser?: string;
        studio?: string;
        total_episode?: string;
        duration?: string;
        release_date?: string;
        [key: string]: any;
    };
    episodes: {
        title: string;
        slug: string;
        link: string;
    }[];
}

export interface OtakudesuStream {
    title: string;
    streamLinks: {
        server: string;
        url: string;
    }[];
}

// Mapper functions to convert Otakudesu responses to unified Movie interface
export const mapAnimeToMovie = (anime: OtakudesuAnime): Movie => ({
    id: anime.slug,
    title: anime.title,
    cover: anime.image,
    genre: [],
    type: "anime",
    slug: anime.slug,
    latestEpisode: anime.episode,
});

export const mapAnimeDetailToMovie = (detail: OtakudesuDetail): AnimeDetail => ({
    id: detail.info.release_date || detail.title.toLowerCase().replace(/\s+/g, "-"),
    title: detail.title,
    cover: detail.image,
    rating: detail.info.rating ? parseFloat(detail.info.rating) : undefined,
    genre: detail.info.genres || [],
    type: "anime",
    synopsis: detail.synopsis,
    country: "Japan",
    status: detail.info.status,
    duration: detail.info.duration,
    studio: detail.info.studio,
    releaseDate: detail.info.release_date,
    totalEpisodes: detail.info.total_episode,
    episodes: detail.episodes.map(ep => ({
        title: ep.title,
        slug: ep.slug,
        link: ep.link
    })),
    slug: detail.title.toLowerCase().replace(/\s+/g, "-")
});

export class AnimeService {
    
    // Get ongoing anime and map to Movie interface
    async getOngoingAnime(): Promise<Movie[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/ongoing`);
            if (response.data.status === "success") {
                return response.data.data.map(mapAnimeToMovie);
            }
            return [];
        } catch (error) {
            console.error("Error fetching ongoing anime:", error);
            return [];
        }
    }

    // Get raw Otakudesu anime list (for specific use cases)
    async getRawOngoingAnime(): Promise<OtakudesuAnime[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/ongoing`);
            if (response.data.status === "success") {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error("Error fetching ongoing anime:", error);
            return [];
        }
    }

    // Get anime detail and map to AnimeDetail interface
    async getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
        try {
            const response = await axios.get(`${API_BASE_URL}/detail/${slug}`);
            if (response.data.status === "success") {
                return mapAnimeDetailToMovie(response.data.data);
            }
            return null;
        } catch (error) {
            console.error(`Error fetching anime detail for ${slug}:`, error);
            return null;
        }
    }

    // Get raw Otakudesu detail (for specific use cases)
    async getRawAnimeDetail(slug: string): Promise<OtakudesuDetail | null> {
        try {
            const response = await axios.get(`${API_BASE_URL}/detail/${slug}`);
            if (response.data.status === "success") {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching anime detail for ${slug}:`, error);
            return null;
        }
    }

    async getStreamLinks(slug: string): Promise<OtakudesuStream | null> {
        try {
            const response = await axios.get(`${API_BASE_URL}/episode/${slug}`);
            if (response.data.status === "success") {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching stream for ${slug}:`, error);
            return null;
        }
    }

    // Search anime and map to Movie interface
    async searchAnime(query: string): Promise<Movie[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/search/${encodeURIComponent(query)}`);
            if (response.data.status === "success") {
                return response.data.data.map(mapAnimeToMovie);
            }
            return [];
        } catch (error) {
            console.error(`Error searching anime ${query}:`, error);
            return [];
        }
    }
}

// Export singleton instance
export const animeService = new AnimeService();
