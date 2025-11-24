// Nekopoi API Service

import { NEKOPOI_BASE } from "./constants";
import { extractIdFromNekopoiUrl } from "./utils";
import type {
    NekopoiHentai,
    PaginatedResponse,
    DownloadLink,
    StreamLink,
    NekopoiItem,
    NekopoiDetail,
    NekopoiSearchResult,
} from "./types";

export class NekopoiService {
    async getLatest(page: number = 1): Promise<PaginatedResponse<NekopoiHentai>> {
        try {
            const response = await fetch(`${NEKOPOI_BASE}/latest`, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            const items: NekopoiHentai[] = (data.data || []).map(
                (item: NekopoiItem) => ({
                    id: extractIdFromNekopoiUrl(item.url),
                    title: item.title || "Unknown Title",
                    cover: item.img || "/placeholder.svg",
                    genre: Array.isArray(item.genre) ? item.genre : [],
                    duration: item.duration || "Unknown",
                    synopsis: item.synopsis || "No synopsis available",
                    type: item.type || "hentai",
                    uploadDate: item.upload_date || "Unknown",
                })
            );

            return {
                data: items,
                page,
                totalPages: 1,
                totalItems: items.length,
            };
        } catch (error) {
            console.error("Failed to get latest from Nekopoi:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getDetail(url: string): Promise<NekopoiHentai | null> {
        try {
            const response = await fetch(
                `${NEKOPOI_BASE}/detail?url=${encodeURIComponent(url)}`,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            if (!data.data) {
                return null;
            }

            const detail: NekopoiDetail = data.data;

            const downloadLinks: DownloadLink[] = [];
            if (detail.download_links) {
                detail.download_links.forEach((dl) => {
                    dl.links.forEach((link) => {
                        downloadLinks.push({
                            quality: dl.quality || "HD",
                            size: dl.size || "Unknown",
                            url: link.url,
                            type: link.server || "Direct",
                        });
                    });
                });
            }

            const streamLinks: StreamLink[] = (detail.stream_links || []).map(
                (st) => ({
                    quality: "HD",
                    url: st.url,
                    provider: st.server || "Unknown",
                })
            );

            return {
                id: extractIdFromNekopoiUrl(url),
                title: detail.title || "Unknown Title",
                cover: detail.img || "/placeholder.svg",
                genre: Array.isArray(detail.genre) ? detail.genre : [],
                duration: detail.duration || "Unknown",
                synopsis: detail.synopsis || "No synopsis available",
                type: "hentai",
                uploadDate: "Unknown",
                downloadLinks,
                streamLinks,
            };
        } catch (error) {
            console.error("Failed to get detail from Nekopoi:", error);
            return null;
        }
    }

    async search(query: string): Promise<NekopoiHentai[]> {
        try {
            const response = await fetch(
                `${NEKOPOI_BASE}/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            return (data.data || []).map((item: NekopoiSearchResult) => ({
                id: extractIdFromNekopoiUrl(item.url),
                title: item.title || "Unknown Title",
                cover: item.thumb || "/placeholder.svg",
                genre: [],
                duration: "Unknown",
                synopsis: "No synopsis available",
                type: item.type || "hentai",
                uploadDate: "Unknown",
            }));
        } catch (error) {
            console.error("Failed to search on Nekopoi:", error);
            return [];
        }
    }

    async getByGenre(
        genre: string,
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        try {
            const response = await fetch(
                `${NEKOPOI_BASE}/genre/${genre}?page=${page}`,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            const items: NekopoiHentai[] = (data.data || []).map(
                (item: NekopoiItem) => ({
                    id: extractIdFromNekopoiUrl(item.url),
                    title: item.title || "Unknown Title",
                    cover: item.img || "/placeholder.svg",
                    genre: Array.isArray(item.genre) ? item.genre : [],
                    duration: item.duration || "Unknown",
                    synopsis: item.synopsis || "No synopsis available",
                    type: item.type || "hentai",
                    uploadDate: item.upload_date || "Unknown",
                })
            );

            return {
                data: items,
                page,
                totalPages: data.total_pages || 1,
                totalItems: data.total_items || items.length,
            };
        } catch (error) {
            console.error(`Failed to get ${genre} from Nekopoi:`, error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }
}
