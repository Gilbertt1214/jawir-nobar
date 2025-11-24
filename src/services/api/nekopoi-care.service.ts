// Nekopoi.care Direct API Service
// Direct scraping from nekopoi.care website

import type {
    NekopoiHentai,
    PaginatedResponse,
    DownloadLink,
    StreamLink,
} from "./types";

const NEKOPOI_CARE_BASE = "https://nekopoi.care";

// Response types from nekopoi.care
interface NekopoiCarePost {
    title: string;
    link: string;
    thumbnail: string;
    date: string;
    category: string[];
    excerpt?: string;
}

interface NekopoiCareDetail {
    title: string;
    thumbnail: string;
    synopsis: string;
    info: {
        judul?: string;
        genre?: string[];
        duration?: string;
        producer?: string;
        type?: string;
    };
    download_links: Array<{
        quality: string;
        links: Array<{
            host: string;
            url: string;
        }>;
    }>;
    stream_links?: Array<{
        host: string;
        url: string;
    }>;
}

export class NekopoiCareService {
    private corsProxyUrl = import.meta.env.VITE_CORS_PROXY || "";

    private async fetchWithCORS(url: string): Promise<Response> {
        // Try with CORS proxy if available
        if (this.corsProxyUrl) {
            try {
                const proxyUrl = `${this.corsProxyUrl}${encodeURIComponent(
                    url
                )}`;
                const response = await fetch(proxyUrl);
                return response;
            } catch (error) {
                console.warn("Proxy fetch failed:", error);
            }
        }

        // Try direct fetch (will fail with CORS in browser)
        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
                mode: "cors",
            });
            return response;
        } catch (error) {
            console.warn("Direct fetch failed due to CORS:", error);
            throw new Error(
                "CORS error: Please setup proxy or use browser extension"
            );
        }
    }

    private parseHTML(html: string): Document {
        const parser = new DOMParser();
        return parser.parseFromString(html, "text/html");
    }

    private extractIdFromUrl(url: string): string {
        const parts = url.split("/").filter(Boolean);
        return parts[parts.length - 1] || "unknown";
    }

    async getLatest(
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        try {
            const url =
                page === 1
                    ? `${NEKOPOI_CARE_BASE}/`
                    : `${NEKOPOI_CARE_BASE}/page/${page}/`;

            const response = await this.fetchWithCORS(url);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const html = await response.text();
            const doc = this.parseHTML(html);

            const posts = doc.querySelectorAll("article.post");
            const items: NekopoiHentai[] = [];

            posts.forEach((post) => {
                const titleEl = post.querySelector("h2.entry-title a");
                const imgEl = post.querySelector("img");
                const dateEl = post.querySelector("time.entry-date");
                const categoryEls = post.querySelectorAll(
                    "a[rel='category tag']"
                );
                const excerptEl = post.querySelector(".entry-summary");

                if (titleEl && imgEl) {
                    const title =
                        titleEl.textContent?.trim() || "Unknown Title";
                    const link = titleEl.getAttribute("href") || "";
                    const cover =
                        imgEl.getAttribute("src") || "/placeholder.svg";
                    const uploadDate =
                        dateEl?.getAttribute("datetime") || "Unknown";
                    const genre: string[] = [];

                    categoryEls.forEach((cat) => {
                        const genreName = cat.textContent?.trim();
                        if (genreName) genre.push(genreName);
                    });

                    items.push({
                        id: this.extractIdFromUrl(link),
                        title,
                        cover,
                        genre,
                        duration: "Unknown",
                        synopsis:
                            excerptEl?.textContent?.trim() ||
                            "No synopsis available",
                        type: "hentai",
                        uploadDate,
                    });
                }
            });

            return {
                data: items,
                page,
                totalPages: 10, // Estimate
                totalItems: items.length,
            };
        } catch (error) {
            console.error("Failed to get latest from Nekopoi.care:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getDetail(slug: string): Promise<NekopoiHentai | null> {
        try {
            const url = `${NEKOPOI_CARE_BASE}/${slug}/`;
            const response = await this.fetchWithCORS(url);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const html = await response.text();
            const doc = this.parseHTML(html);

            const titleEl = doc.querySelector("h1.entry-title");
            const imgEl = doc.querySelector(".entry-content img");
            const synopsisEl = doc.querySelector(".entry-content p");
            const infoTable = doc.querySelector(".info");

            const title = titleEl?.textContent?.trim() || "Unknown Title";
            const cover = imgEl?.getAttribute("src") || "/placeholder.svg";
            const synopsis =
                synopsisEl?.textContent?.trim() || "No synopsis available";

            // Extract genre and info
            const genre: string[] = [];
            const categoryEls = doc.querySelectorAll("a[rel='category tag']");
            categoryEls.forEach((cat) => {
                const genreName = cat.textContent?.trim();
                if (genreName) genre.push(genreName);
            });

            // Extract download links
            const downloadLinks: DownloadLink[] = [];
            const downloadSections = doc.querySelectorAll(".download");

            downloadSections.forEach((section) => {
                const qualityEl = section.querySelector("strong");
                const quality = qualityEl?.textContent?.trim() || "HD";
                const links = section.querySelectorAll("a");

                links.forEach((link) => {
                    const url = link.getAttribute("href");
                    const host = link.textContent?.trim() || "Direct";

                    if (url) {
                        downloadLinks.push({
                            quality,
                            size: "Unknown",
                            url,
                            type: host,
                        });
                    }
                });
            });

            // Extract stream links
            const streamLinks: StreamLink[] = [];
            const iframeEls = doc.querySelectorAll("iframe");

            iframeEls.forEach((iframe, index) => {
                const url = iframe.getAttribute("src");
                if (url) {
                    streamLinks.push({
                        quality: "HD",
                        url,
                        provider: `Stream ${index + 1}`,
                    });
                }
            });

            return {
                id: slug,
                title,
                cover,
                genre,
                duration: "Unknown",
                synopsis,
                type: "hentai",
                uploadDate: "Unknown",
                downloadLinks,
                streamLinks,
            };
        } catch (error) {
            console.error("Failed to get detail from Nekopoi.care:", error);
            return null;
        }
    }

    async search(query: string): Promise<NekopoiHentai[]> {
        try {
            const url = `${NEKOPOI_CARE_BASE}/?s=${encodeURIComponent(query)}`;
            const response = await this.fetchWithCORS(url);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const html = await response.text();
            const doc = this.parseHTML(html);

            const posts = doc.querySelectorAll("article.post");
            const items: NekopoiHentai[] = [];

            posts.forEach((post) => {
                const titleEl = post.querySelector("h2.entry-title a");
                const imgEl = post.querySelector("img");
                const categoryEls = post.querySelectorAll(
                    "a[rel='category tag']"
                );

                if (titleEl && imgEl) {
                    const title =
                        titleEl.textContent?.trim() || "Unknown Title";
                    const link = titleEl.getAttribute("href") || "";
                    const cover =
                        imgEl.getAttribute("src") || "/placeholder.svg";
                    const genre: string[] = [];

                    categoryEls.forEach((cat) => {
                        const genreName = cat.textContent?.trim();
                        if (genreName) genre.push(genreName);
                    });

                    items.push({
                        id: this.extractIdFromUrl(link),
                        title,
                        cover,
                        genre,
                        duration: "Unknown",
                        synopsis: "No synopsis available",
                        type: "hentai",
                        uploadDate: "Unknown",
                    });
                }
            });

            return items;
        } catch (error) {
            console.error("Failed to search on Nekopoi.care:", error);
            return [];
        }
    }

    async getByCategory(
        category: string,
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        try {
            const url =
                page === 1
                    ? `${NEKOPOI_CARE_BASE}/category/${category}/`
                    : `${NEKOPOI_CARE_BASE}/category/${category}/page/${page}/`;

            const response = await this.fetchWithCORS(url);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const html = await response.text();
            const doc = this.parseHTML(html);

            const posts = doc.querySelectorAll("article.post");
            const items: NekopoiHentai[] = [];

            posts.forEach((post) => {
                const titleEl = post.querySelector("h2.entry-title a");
                const imgEl = post.querySelector("img");
                const categoryEls = post.querySelectorAll(
                    "a[rel='category tag']"
                );

                if (titleEl && imgEl) {
                    const title =
                        titleEl.textContent?.trim() || "Unknown Title";
                    const link = titleEl.getAttribute("href") || "";
                    const cover =
                        imgEl.getAttribute("src") || "/placeholder.svg";
                    const genre: string[] = [];

                    categoryEls.forEach((cat) => {
                        const genreName = cat.textContent?.trim();
                        if (genreName) genre.push(genreName);
                    });

                    items.push({
                        id: this.extractIdFromUrl(link),
                        title,
                        cover,
                        genre,
                        duration: "Unknown",
                        synopsis: "No synopsis available",
                        type: "hentai",
                        uploadDate: "Unknown",
                    });
                }
            });

            return {
                data: items,
                page,
                totalPages: 10, // Estimate
                totalItems: items.length,
            };
        } catch (error) {
            console.error(
                `Failed to get ${category} from Nekopoi.care:`,
                error
            );
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    // Get popular categories
    async getCategories(): Promise<string[]> {
        return [
            "hentai",
            "3d-hentai",
            "jav",
            "uncensored",
            "subtitle-indonesia",
            "hentai-sub-indo",
        ];
    }
}
