import axios, { AxiosInstance } from "axios";
import {
    Manga,
    MangaDetail,
    ChapterPage,
    PaginatedResponse,
} from "../common/types";
import { ANIME_SCRAPER_URL } from "../common/constants";

const SANKA_BASE_URL = ANIME_SCRAPER_URL || "https://www.sankavollerei.com";
const isDev = import.meta.env.DEV;
// Use bacaman source as it's more stable
const MANGA_API = isDev ? "/sanka-comic" : `${SANKA_BASE_URL}/comic/bacaman`;

console.log("📚 Manga API Configuration:", MANGA_API);

interface SankaBacamanItem {
    title: string;
    slug: string;
    image: string;
    latestChapter?: string;
    rating?: string;
    type?: string;
}

interface SankaBacamanDetail {
    title: string;
    image: string;
    synopsis?: string;
    genres?: {
        name: string;
        slug: string;
    }[];
    rating?: string;
    status?: string;
    type?: string;
    chapters?: {
        title: string;
        slug: string;
        date?: string;
    }[];
}

interface SankaBacamanChapter {
    images: string[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    page?: number | string;
    totalPages?: number;
}

class SankaMangaService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: MANGA_API,
            timeout: 15000,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    async getLatestManga(page: number = 1): Promise<PaginatedResponse<Manga>> {
        try {
            console.log("📚 Fetching latest manga, page:", page);
            const response = await this.api.get<
                ApiResponse<SankaBacamanItem[]>
            >(`/latest?page=${page}`);

            console.log("📦 Manga API Response:", response.data);

            if (response.data?.success && response.data?.data) {
                const data = response.data.data.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: item.image,
                    type: item.type || "Manga",
                    latestChapter: item.latestChapter,
                    rating: String(item.rating || "0"),
                    slug: item.slug,
                }));

                // API doesn't return totalPages, so we estimate:
                // If we got a full page (30 items), there are likely more pages
                const currentPage = parseInt(String(response.data.page || page));
                const hasMorePages = data.length >= 28; // Allow some tolerance
                const estimatedTotalPages = hasMorePages ? currentPage + 5 : currentPage;

                return {
                    data,
                    page: currentPage,
                    totalPages: response.data.totalPages || estimatedTotalPages,
                    totalItems: data.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("❌ Failed to fetch latest manga:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }

    async getMangaDetail(slug: string): Promise<MangaDetail | null> {
        try {
            console.log("📚 Fetching manga detail:", slug);
            const response = await this.api.get<
                ApiResponse<SankaBacamanDetail>
            >(`/detail/${slug}`);

            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                return {
                    id: slug,
                    title: data.title,
                    cover: data.image,
                    synopsis: data.synopsis,
                    // Fix: Extract strings from genre objects to prevent React key [object Object] error
                    genres: data.genres?.map((g) => g.name) || [],
                    status: data.status,
                    type: data.type,
                    rating: String(data.rating || "0"),
                    chapters: (
                        data.chapters?.map((ch) => ({
                            title: ch.title,
                            slug: ch.slug,
                            releaseDate: ch.date,
                        })) || []
                    ).reverse(),
                };
            }
            return null;
        } catch (error) {
            console.error("❌ Failed to fetch manga detail:", error);
            return null;
        }
    }

    async getChapterImages(chapterSlug: string): Promise<ChapterPage[]> {
        try {
            console.log("📚 Fetching chapter images:", chapterSlug);
            const response = await this.api.get<
                ApiResponse<SankaBacamanChapter>
            >(`/chapter/${chapterSlug}`);

            if (response.data?.success && response.data?.data) {
                return response.data.data.images.map((url, index) => ({
                    index,
                    url,
                }));
            }
            return [];
        } catch (error) {
            console.error("❌ Failed to fetch chapter images:", error);
            return [];
        }
    }

    async searchManga(
        query: string,
        page: number = 1,
    ): Promise<PaginatedResponse<Manga>> {
        try {
            console.log("🔍 Searching manga:", query, "page:", page);
            const response = await this.api.get<
                ApiResponse<SankaBacamanItem[]>
            >(`/search/${encodeURIComponent(query)}?page=${page}`);

            console.log("🔍 Search API Response:", response.data);

            if (response.data?.success && response.data?.data) {
                const data = response.data.data.map((item) => ({
                    id: item.slug,
                    title: item.title,
                    cover: item.image,
                    type: item.type,
                    latestChapter: item.latestChapter,
                    rating: String(item.rating || "0"),
                    slug: item.slug,
                }));

                const currentPage = parseInt(String(response.data.page || page));
                const hasMorePages = data.length >= 10;
                const estimatedTotalPages = hasMorePages ? currentPage + 5 : currentPage;

                return {
                    data,
                    page: currentPage,
                    totalPages: response.data.totalPages || estimatedTotalPages,
                    totalItems: data.length,
                };
            }
            return { data: [], page, totalPages: 1, totalItems: 0 };
        } catch (error) {
            console.error("❌ Failed to search manga:", error);
            return { data: [], page, totalPages: 1, totalItems: 0 };
        }
    }
}

export const sankaMangaService = new SankaMangaService();
