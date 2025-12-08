// NekoBocc API Service

import NekoBocc from "nekobocc";
import { extractIdFromUrl } from "./utils";
import { getMockNekoBoccList, getMockNekoBoccDetail } from "./mock-data";
import type { NekoBoccHentai, PaginatedResponse } from "./types";

// Initialize NekoBocc client
let nekoBocc: NekoBocc;

try {
    nekoBocc = new NekoBocc();
} catch (error) {
    console.warn("NekoBocc initialization failed, using fallback:", error);
    // Fallback object jika NekoBocc gagal diinisialisasi
    nekoBocc = {
        release: () => Promise.resolve([]),
        episode: () => Promise.resolve({ error: "NekoBocc not available" }),
        search: () => Promise.resolve([]),
        random: () => Promise.resolve(null),
        hentai: () => Promise.resolve([]),
    } as any;
}

export class NekoBoccService {
    // Use mock data by default. Set VITE_USE_MOCK_DATA=false to use real API
    // Note: Real API requires proper CORS setup or proxy
    private useMockData = import.meta.env.VITE_USE_MOCK_DATA !== "false";

    async getReleaseList(
        page: number = 1
    ): Promise<PaginatedResponse<NekoBoccHentai>> {
        // Use mock data if enabled or if API fails
        if (this.useMockData) {
            console.log("NekoBocc: Using mock data (default behavior)");
            return getMockNekoBoccList(page);
        }

        try {
            console.log("NekoBocc: Fetching release list...");
            const releases = await nekoBocc.release();
            console.log("NekoBocc: Raw response:", releases);
            console.log("NekoBocc: Is array?", Array.isArray(releases));
            if (Array.isArray(releases)) {
                console.log("NekoBocc: Length:", releases.length);
            }

            // Check if error response or invalid data
            if (!releases || "error" in releases || !Array.isArray(releases)) {
                console.error(
                    "NekoBocc API error, falling back to mock data:",
                    releases
                );
                return getMockNekoBoccList(page);
            }

            if (releases.length === 0) {
                console.warn("NekoBocc returned empty array, using mock data");
                return getMockNekoBoccList(page);
            }

            if (releases.length > 0) {
                console.log("NekoBocc: First item sample:", releases[0]);
            }

            const data = releases.map((item: any, index: number) => {
                // Use slug directly, or extract from link, or generate from title
                let id = item?.slug;
                if (!id && item?.link) {
                    id = extractIdFromUrl(item.link);
                }
                if (!id || id === "unknown") {
                    // Generate ID from title as last resort
                    id =
                        item?.title
                            ?.toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "") ||
                        `item-${Date.now()}-${index}`;
                }

                if (index === 0) {
                    console.log("NekoBocc: First item FULL object:", item);
                    console.log("NekoBocc: Generated ID:", id);
                    console.log("NekoBocc: Has slug?", !!item?.slug);
                    console.log("NekoBocc: Has link?", !!item?.link);
                    console.log("NekoBocc: Has title?", !!item?.title);

                    // Save to localStorage for debugging
                    try {
                        localStorage.setItem(
                            "nekobocc-debug-first-item",
                            JSON.stringify(item)
                        );
                        localStorage.setItem("nekobocc-debug-generated-id", id);
                    } catch (e) {
                        console.warn(
                            "Failed to save debug data to localStorage"
                        );
                    }
                }

                return {
                    type: "hentai",
                    id,
                    title: item?.title || "Unknown Title",
                    cover: item?.img || "/placeholder.svg",
                    genre: Array.isArray(item?.genre) ? item.genre : [],
                    duration: item?.duration || "Unknown",
                    synopsis: item?.synopsis || "No synopsis available",
                };
            });

            return {
                data,
                page,
                totalPages: 1,
                totalItems: data.length,
            };
        } catch (error) {
            console.error(
                "Failed to get release list from NekoBocc, using mock data:",
                error
            );
            return getMockNekoBoccList(page);
        }
    }

    async getDetail(slug: string): Promise<NekoBoccHentai | null> {
        // Use mock data if enabled
        if (this.useMockData) {
            console.log("NekoBocc: Using mock data for detail");
            return getMockNekoBoccDetail(slug);
        }

        try {
            console.log("NekoBocc: Fetching detail for slug:", slug);
            const detail = await nekoBocc.episode(slug);
            console.log("NekoBocc: Detail response:", detail);

            // Check if error response or invalid data
            if (!detail || "error" in detail) {
                console.error("NekoBocc API error, trying mock data:", detail);
                return getMockNekoBoccDetail(slug);
            }

            const downloadLinks = Array.isArray(detail?.download)
                ? detail.download.map((dl: any) => ({
                      quality: dl?.quality || "HD",
                      size: dl?.size || "Unknown",
                      url: dl?.link || dl?.url || "",
                      type: dl?.type || "Direct",
                  }))
                : [];

            const streamLinks = Array.isArray(detail?.stream)
                ? detail.stream.map((st: any) => ({
                      quality: st?.quality || "HD",
                      url: st?.link || st?.url || "",
                      provider: st?.server || "Unknown",
                  }))
                : [];

            return {
                type: "hentai",
                id: slug,
                title: detail?.title || "Unknown Title",
                cover: detail?.img || "/placeholder.svg",
                genre: Array.isArray(detail?.genre) ? detail.genre : [],
                duration: detail?.duration || "Unknown",
                synopsis: detail?.synopsis || "No synopsis available",
                downloadLinks,
                streamLinks,
            };
        } catch (error) {
            console.error(
                "Failed to get detail from NekoBocc, trying mock data:",
                error
            );
            return getMockNekoBoccDetail(slug);
        }
    }

    async search(query: string): Promise<NekoBoccHentai[]> {
        try {
            const results = await nekoBocc.search(query);

            // Check if error response or invalid data
            if (!results || "error" in results || !Array.isArray(results)) {
                console.error("NekoBocc API error:", results);
                return [];
            }

            return results.map((item: any) => ({
                type: "hentai",
                id: item?.slug || extractIdFromUrl(item?.link || ""),
                title: item?.title || "Unknown Title",
                cover: item?.img || "/placeholder.svg",
                genre: Array.isArray(item?.genre) ? item.genre : [],
                duration: item?.duration || "Unknown",
                synopsis: item?.synopsis || "No synopsis available",
            }));
        } catch (error) {
            console.error("Failed to search on NekoBocc:", error);
            return [];
        }
    }

    async getRandom(): Promise<NekoBoccHentai | null> {
        try {
            const random = await nekoBocc.random();

            // Check if error response or invalid data
            if (!random || "error" in random) {
                console.error(
                    "NekoBocc API error:",
                    "error" in random ? random.error : "No data"
                );
                return null;
            }

            return {
                type: "hentai",
                id: random?.slug || extractIdFromUrl(random?.link || ""),
                title: random?.title || "Unknown Title",
                cover: random?.img || "/placeholder.svg",
                genre: Array.isArray(random?.genre) ? random.genre : [],
                duration: random?.duration || "Unknown",
                synopsis: random?.synopsis || "No synopsis available",
            };
        } catch (error) {
            console.error("Failed to get random from NekoBocc:", error);
            return null;
        }
    }

    async getHentaiList(
        page: number = 1
    ): Promise<PaginatedResponse<NekoBoccHentai>> {
        try {
            const hentaiList = await nekoBocc.hentai(page);

            // Check if error response or invalid data
            if (
                !hentaiList ||
                "error" in hentaiList ||
                !Array.isArray(hentaiList)
            ) {
                console.error("NekoBocc API error:", hentaiList);
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }

            const data = hentaiList.map((item: any) => ({
                type: "hentai",
                id: item?.slug || extractIdFromUrl(item?.link || ""),
                title: item?.title || "Unknown Title",
                cover: item?.img || "/placeholder.svg",
                genre: Array.isArray(item?.genre) ? item.genre : [],
                duration: item?.duration || "Unknown",
                synopsis: item?.synopsis || "No synopsis available",
            }));

            return {
                data,
                page,
                totalPages: 1,
                totalItems: data.length,
            };
        } catch (error) {
            console.error("Failed to get hentai list from NekoBocc:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }
}
