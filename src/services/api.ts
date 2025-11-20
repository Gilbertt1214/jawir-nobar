const API_HOSTS = [import.meta.env.VITE_API_BASE_URL || "/__vidlink"].filter(
    Boolean
);

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY =
    import.meta.env.VITE_TMDB_API_KEY || "9998d44e51ed7634a06c4198b289bfe4"; // Ganti dengan API key Anda

// Base URL untuk vidlink.pro
const VIDLINK_BASE = "https://vidlink.pro";

export interface PersonCast {
    id: string;
    name: string;
    character?: string;
    profile?: string;
}

export interface PersonCrew {
    id: string;
    name: string;
    job?: string;
    profile?: string;
}

export interface Movie {
    id: string;
    title: string;
    cover: string;
    rating: number;
    genre: string[];
    country: string;
    year: string;
    synopsis: string;
    trailer?: string;
    backdrops?: string[];
    cast?: PersonCast[];
    crew?: PersonCrew[];
    type: "movie" | "series";
}

export interface Episode {
    id: string;
    title: string;
    episodeNumber: number;
    seasonNumber: number;
    cover: string;
    streamUrl: string; // URL embed dari vidlink
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    totalPages: number;
    totalItems: number;
}

export interface StreamingProvider {
    name: string;
    url: string;
    available: boolean;
}

class MovieAPI {
    private hosts: string[];
    private genreMap?: Record<string, { movie?: number; tv?: number }>;
    private countriesCache?: string[];

    constructor() {
        this.hosts = API_HOSTS.length
            ? API_HOSTS
            : ["https://api.themoviedb.org/3"];
    }

    // Get available streaming URLs for a movie/series from vidlink.pro
    getStreamingUrls(
        tmdbId: string,
        type: "movie" | "series" = "movie"
    ): StreamingProvider[] {
        const providers: StreamingProvider[] = [];

        if (type === "movie") {
            providers.push({
                name: "VidLink Player",
                url: `${VIDLINK_BASE}/movie/${tmdbId}`,
                available: true,
            });
        } else {
            // For TV series (example for first episode, you might need specific season/ep)
            // In practice, you'd call getEpisodeStreamingUrl for specific episodes
            providers.push({
                name: "VidLink Player",
                url: `${VIDLINK_BASE}/tv/${tmdbId}/1/1`, // Default to S01E01
                available: true,
            });
        }

        return providers;
    }

    // Get episode streaming URL from vidlink.pro
    getEpisodeStreamingUrl(
        seriesId: string,
        season: number,
        episode: number
    ): StreamingProvider[] {
        return [
            {
                name: "VidLink Player",
                url: `${VIDLINK_BASE}/tv/${seriesId}/${season}/${episode}`,
                available: true,
            },
        ];
    }

    private async fetchWithFallback(endpoint: string, options?: RequestInit) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        let lastError: unknown = null;

        try {
            const url = endpoint.startsWith("http")
                ? endpoint
                : `${TMDB_BASE}${endpoint}`;
            const res = await fetch(url, {
                ...options,
                mode: "cors",
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const ct = res.headers.get("content-type") || "";
            if (!ct.includes("application/json")) {
                throw new Error("Non-JSON response");
            }

            return await res.json();
        } catch (error) {
            clearTimeout(timeout);
            lastError = error;
            console.error("API request failed:", error);

            // Return offline/mock data in development
            if (import.meta.env.DEV) {
                return this.offlineResponse(endpoint);
            }

            throw lastError instanceof Error
                ? lastError
                : new Error("API request failed");
        }
    }

    private offlineResponse(endpoint: string) {
        const sample = (type: "movie" | "series") => [
            {
                id: "786892",
                title: "Furiosa: A Mad Max Saga",
                cover: "/placeholder.svg",
                rating: 8.1,
                genre: ["Action", "Adventure"],
                country: "USA",
                year: "2024",
                synopsis: "Sample synopsis for development",
                type,
            },
            {
                id: "76479",
                title: "The Boys",
                cover: "/placeholder.svg",
                rating: 8.4,
                genre: ["Drama", "Action"],
                country: "USA",
                year: "2023",
                synopsis: "Sample synopsis for development",
                type,
            },
            {
                id: "615656",
                title: "Meg 2: The Trench",
                cover: "/placeholder.svg",
                rating: 7.0,
                genre: ["Adventure", "Action"],
                country: "USA",
                year: "2023",
                synopsis: "Sample synopsis for development",
                type,
            },
        ];

        if (endpoint.includes("/genres"))
            return ["Action", "Drama", "Comedy", "Horror", "Sci-Fi"];
        if (endpoint.includes("/countries"))
            return ["USA", "Japan", "Korea", "Indonesia"];
        if (endpoint.includes("/years"))
            return ["2025", "2024", "2023", "2022"];

        const isSeries = endpoint.includes("/tv");
        const data = sample(isSeries ? "series" : "movie");

        if (endpoint.includes("/movie/") || endpoint.includes("/tv/")) {
            return data[0];
        }

        return {
            results: data,
            page: 1,
            total_pages: 1,
            total_results: data.length,
        };
    }

    private async ensureGenreMap() {
        if (this.genreMap) return;

        try {
            const [movieGenres, tvGenres] = await Promise.all([
                this.fetchWithFallback(`/genre/movie/list?api_key=${TMDB_KEY}`),
                this.fetchWithFallback(`/genre/tv/list?api_key=${TMDB_KEY}`),
            ]);

            const map: Record<string, { movie?: number; tv?: number }> = {};

            for (const g of movieGenres.genres || []) {
                map[g.name] = { ...(map[g.name] || {}), movie: g.id };
            }

            for (const g of tvGenres.genres || []) {
                map[g.name] = { ...(map[g.name] || {}), tv: g.id };
            }

            this.genreMap = map;
        } catch (error) {
            console.error("Failed to load genre map:", error);
            this.genreMap = {};
        }
    }

    // Helper untuk menambahkan parameter adult ke URL (hanya untuk TMDB)
    private buildAdultParams(
        adult: "include" | "exclude" | "only" | undefined
    ): string {
        if (!adult || adult === "exclude") {
            // Exclude: Tidak termasuk konten dewasa (jika TMDB mendukung)
            // Karena TMDB tidak mendukung, kita abaikan untuk sekarang
            return "";
        } else if (adult === "only") {
            // Only: Hanya konten dewasa (tidak didukung oleh TMDB)
            // Kita gunakan ini sebagai indikator untuk mengganti kategori di getAdultMovies
            return "only";
        }
        // Include: Termasuk konten dewasa (default - tidak berpengaruh di TMDB)
        return "";
    }

    async getLatestMovies(
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            // Jika adult = "only", kita kembalikan hasil kosong karena getAdultMovies menanganinya
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
            const r = await this.fetchWithFallback(
                `/movie/now_playing?page=${page}&api_key=${TMDB_KEY}`
            );
            const data: Movie[] = (r.results || []).map((m: any) => ({
                id: String(m.id),
                title: m.title,
                cover: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "/placeholder.svg",
                rating: m.vote_average || 0,
                genre: [],
                country: (m.origin_country && m.origin_country[0]) || "USA",
                year: (m.release_date || "").slice(0, 4),
                synopsis: m.overview || "No synopsis available",
                type: "movie" as const,
            }));

            return {
                data,
                page: r.page || 1,
                totalPages: r.total_pages || 1,
                totalItems: r.total_results || data.length,
            };
        } catch (error) {
            console.error("Failed to get latest movies:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getPopularMovies(
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
            const r = await this.fetchWithFallback(
                `/movie/popular?page=${page}&api_key=${TMDB_KEY}`
            );
            const data: Movie[] = (r.results || []).map((m: any) => ({
                id: String(m.id),
                title: m.title,
                cover: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "/placeholder.svg",
                rating: m.vote_average || 0,
                genre: [],
                country: (m.origin_country && m.origin_country[0]) || "USA",
                year: (m.release_date || "").slice(0, 4),
                synopsis: m.overview || "No synopsis available",
                type: "movie" as const,
            }));

            return {
                data,
                page: r.page || 1,
                totalPages: r.total_pages || 1,
                totalItems: r.total_results || data.length,
            };
        } catch (error) {
            console.error("Failed to get popular movies:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getLatestSeries(
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
            const r = await this.fetchWithFallback(
                `/tv/on_the_air?page=${page}&api_key=${TMDB_KEY}`
            );
            const data: Movie[] = (r.results || []).map((t: any) => ({
                id: String(t.id),
                title: t.name,
                cover: t.poster_path
                    ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
                    : "/placeholder.svg",
                rating: t.vote_average || 0,
                genre: [],
                country: (t.origin_country && t.origin_country[0]) || "USA",
                year: (t.first_air_date || "").slice(0, 4),
                synopsis: t.overview || "No synopsis available",
                type: "series" as const,
            }));

            return {
                data,
                page: r.page || 1,
                totalPages: r.total_pages || 1,
                totalItems: r.total_results || data.length,
            };
        } catch (error) {
            console.error("Failed to get latest series:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getMovieById(id: string): Promise<Movie> {
        try {
            const m = await this.fetchWithFallback(
                `/movie/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits,images`
            );

            const trailerKey = (m.videos?.results || []).find(
                (v: any) => v.type === "Trailer" && v.site === "YouTube"
            )?.key;

            const backdrops: string[] = (m.images?.backdrops || [])
                .slice(0, 10)
                .map((b: any) =>
                    b.file_path
                        ? `https://image.tmdb.org/t/p/w1280${b.file_path}`
                        : ""
                )
                .filter(Boolean);

            const cast = (m.credits?.cast || []).slice(0, 10).map((c: any) => ({
                id: String(c.id),
                name: c.name,
                character: c.character,
                profile: c.profile_path
                    ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                    : "",
            }));

            const crew = (m.credits?.crew || []).slice(0, 10).map((c: any) => ({
                id: String(c.id),
                name: c.name,
                job: c.job,
                profile: c.profile_path
                    ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                    : "",
            }));

            return {
                id: String(m.id),
                title: m.title,
                cover: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "/placeholder.svg",
                rating: m.vote_average || 0,
                genre: (m.genres || []).map((g: any) => g.name),
                country: (m.production_countries || [])[0]?.name || "Unknown",
                year: (m.release_date || "").slice(0, 4),
                synopsis: m.overview || "No synopsis available",
                trailer: trailerKey
                    ? `https://www.youtube.com/watch?v=${trailerKey}`
                    : undefined,
                backdrops,
                cast,
                crew,
                type: "movie" as const,
            };
        } catch (error) {
            console.error("Failed to get movie by ID:", error);
            throw error;
        }
    }

    async getSeriesById(id: string): Promise<Movie> {
        try {
            const s = await this.fetchWithFallback(
                `/tv/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits,images`
            );

            const trailerKey = (s.videos?.results || []).find(
                (v: any) => v.type === "Trailer" && v.site === "YouTube"
            )?.key;

            const backdrops: string[] = (s.images?.backdrops || [])
                .slice(0, 10)
                .map((b: any) =>
                    b.file_path
                        ? `https://image.tmdb.org/t/p/w1280${b.file_path}`
                        : ""
                )
                .filter(Boolean);

            const cast = (s.credits?.cast || []).slice(0, 10).map((c: any) => ({
                id: String(c.id),
                name: c.name,
                character: c.character,
                profile: c.profile_path
                    ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                    : "",
            }));

            const crew = (s.credits?.crew || []).slice(0, 10).map((c: any) => ({
                id: String(c.id),
                name: c.name,
                job: c.job,
                profile: c.profile_path
                    ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                    : "",
            }));

            return {
                id: String(s.id),
                title: s.name,
                cover: s.poster_path
                    ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
                    : "/placeholder.svg",
                rating: s.vote_average || 0,
                genre: (s.genres || []).map((g: any) => g.name),
                country: (s.origin_country && s.origin_country[0]) || "Unknown",
                year: (s.first_air_date || "").slice(0, 4),
                synopsis: s.overview || "No synopsis available",
                trailer: trailerKey
                    ? `https://www.youtube.com/watch?v=${trailerKey}`
                    : undefined,
                backdrops,
                cast,
                crew,
                type: "series" as const,
            };
        } catch (error) {
            console.error("Failed to get series by ID:", error);
            throw error;
        }
    }

    async getEpisodes(seriesId: string): Promise<Episode[]> {
        try {
            const tv = await this.fetchWithFallback(
                `/tv/${seriesId}?api_key=${TMDB_KEY}`
            );
            const seasons = (tv.seasons || []).filter(
                (s: any) => s.season_number > 0
            );
            const eps: Episode[] = [];

            for (const s of seasons) {
                try {
                    const r = await this.fetchWithFallback(
                        `/tv/${seriesId}/season/${s.season_number}?api_key=${TMDB_KEY}`
                    );

                    eps.push(
                        ...(r.episodes || []).map((e: any) => {
                            const streamUrl =
                                this.getEpisodeStreamingUrl(
                                    seriesId,
                                    s.season_number,
                                    e.episode_number
                                )[0]?.url || "#";
                            return {
                                id: `${s.season_number}-${e.episode_number}`,
                                title: e.name,
                                episodeNumber: e.episode_number,
                                seasonNumber: s.season_number,
                                cover: e.still_path
                                    ? `https://image.tmdb.org/t/p/w500${e.still_path}`
                                    : "/placeholder.svg",
                                streamUrl, // URL dari vidlink
                            };
                        })
                    );
                } catch (error) {
                    console.error(
                        `Failed to get season ${s.season_number}:`,
                        error
                    );
                }
            }

            return eps;
        } catch (error) {
            console.error("Failed to get episodes:", error);
            return [];
        }
    }

    async getEpisodeById(
        seriesId: string,
        episodeId: string
    ): Promise<Episode> {
        try {
            const parts = String(episodeId).split("-");
            const season = Number(parts[0] || 1);
            const ep = Number(parts[1] || episodeId);

            const d = await this.fetchWithFallback(
                `/tv/${seriesId}/season/${season}/episode/${ep}?api_key=${TMDB_KEY}`
            );

            const streamUrl =
                this.getEpisodeStreamingUrl(seriesId, season, ep)[0]?.url ||
                "#";

            return {
                id: `${season}-${ep}`,
                title: d.name || `Episode ${ep}`,
                episodeNumber: ep,
                seasonNumber: season,
                cover: d.still_path
                    ? `https://image.tmdb.org/t/p/w500${d.still_path}`
                    : "/placeholder.svg",
                streamUrl, // URL dari vidlink
            };
        } catch (error) {
            console.error("Failed to get episode by ID:", error);
            throw error;
        }
    }

    async searchMovies(
        query: string,
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
            const r = await this.fetchWithFallback(
                `/search/multi?query=${encodeURIComponent(
                    query
                )}&page=${page}&api_key=${TMDB_KEY}`
            );

            const data: Movie[] = (r.results || [])
                .filter(
                    (item: any) =>
                        item.media_type === "movie" || item.media_type === "tv"
                )
                .map((item: any) => ({
                    id: String(item.id),
                    title: item.title || item.name,
                    cover: item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : "/placeholder.svg",
                    rating: item.vote_average || 0,
                    genre: [],
                    country:
                        (item.origin_country && item.origin_country[0]) ||
                        "Unknown",
                    year: (
                        item.release_date ||
                        item.first_air_date ||
                        ""
                    ).slice(0, 4),
                    synopsis: item.overview || "No synopsis available",
                    type:
                        item.media_type === "tv"
                            ? ("series" as const)
                            : ("movie" as const),
                }));

            return {
                data,
                page: r.page || 1,
                totalPages: r.total_pages || 1,
                totalItems: r.total_results || data.length,
            };
        } catch (error) {
            console.error("Search failed:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getMoviesByGenre(
        genre: string,
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const key = Object.keys(this.genreMap || {}).find(
            (k) => k.toLowerCase() === genre.toLowerCase()
        );
        const ids = key ? (this.genreMap as any)[key] : {};
        const out: Movie[] = [];

        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }

            if (ids.movie) {
                const r = await this.fetchWithFallback(
                    `/discover/movie?with_genres=${ids.movie}&page=${page}&api_key=${TMDB_KEY}`
                );
                out.push(
                    ...(r.results || []).map((m: any) => ({
                        id: String(m.id),
                        title: m.title,
                        cover: m.poster_path
                            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                            : "/placeholder.svg",
                        rating: m.vote_average || 0,
                        genre: [genre],
                        country:
                            (m.origin_country && m.origin_country[0]) ||
                            "Unknown",
                        year: (m.release_date || "").slice(0, 4),
                        synopsis: m.overview || "No synopsis available",
                        type: "movie" as const,
                    }))
                );
            }

            if (ids.tv) {
                const r = await this.fetchWithFallback(
                    `/discover/tv?with_genres=${ids.tv}&page=${page}&api_key=${TMDB_KEY}`
                );
                out.push(
                    ...(r.results || []).map((t: any) => ({
                        id: String(t.id),
                        title: t.name,
                        cover: t.poster_path
                            ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
                            : "/placeholder.svg",
                        rating: t.vote_average || 0,
                        genre: [genre],
                        country:
                            (t.origin_country && t.origin_country[0]) ||
                            "Unknown",
                        year: (t.first_air_date || "").slice(0, 4),
                        synopsis: t.overview || "No synopsis available",
                        type: "series" as const,
                    }))
                );
            }

            return { data: out, page, totalPages: 1, totalItems: out.length };
        } catch (error) {
            console.error("Failed to get movies by genre:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getMoviesByCountry(
        country: string,
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
            const [m, t] = await Promise.all([
                this.fetchWithFallback(
                    `/discover/movie?with_origin_country=${encodeURIComponent(
                        country
                    )}&page=${page}&api_key=${TMDB_KEY}`
                ),
                this.fetchWithFallback(
                    `/discover/tv?with_origin_country=${encodeURIComponent(
                        country
                    )}&page=${page}&api_key=${TMDB_KEY}`
                ),
            ]);

            const data: Movie[] = [
                ...(m.results || []).map((x: any) => ({
                    id: String(x.id),
                    title: x.title,
                    cover: x.poster_path
                        ? `https://image.tmdb.org/t/p/w500${x.poster_path}`
                        : "/placeholder.svg",
                    rating: x.vote_average || 0,
                    genre: [],
                    country,
                    year: (x.release_date || "").slice(0, 4),
                    synopsis: x.overview || "No synopsis available",
                    type: "movie" as const,
                })),
                ...(t.results || []).map((x: any) => ({
                    id: String(x.id),
                    title: x.name,
                    cover: x.poster_path
                        ? `https://image.tmdb.org/t/p/w500${x.poster_path}`
                        : "/placeholder.svg",
                    rating: x.vote_average || 0,
                    genre: [],
                    country,
                    year: (x.first_air_date || "").slice(0, 4),
                    synopsis: x.overview || "No synopsis available",
                    type: "series" as const,
                })),
            ];

            return {
                data,
                page,
                totalPages: Math.max(m.total_pages || 1, t.total_pages || 1),
                totalItems: data.length,
            };
        } catch (error) {
            console.error("Failed to get movies by country:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getMoviesByYear(
        year: string,
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
            const [m, t] = await Promise.all([
                this.fetchWithFallback(
                    `/discover/movie?primary_release_year=${encodeURIComponent(
                        year
                    )}&page=${page}&api_key=${TMDB_KEY}`
                ),
                this.fetchWithFallback(
                    `/discover/tv?first_air_date_year=${encodeURIComponent(
                        year
                    )}&page=${page}&api_key=${TMDB_KEY}`
                ),
            ]);

            const data: Movie[] = [
                ...(m.results || []).map((x: any) => ({
                    id: String(x.id),
                    title: x.title,
                    cover: x.poster_path
                        ? `https://image.tmdb.org/t/p/w500${x.poster_path}`
                        : "/placeholder.svg",
                    rating: x.vote_average || 0,
                    genre: [],
                    country:
                        (x.origin_country && x.origin_country[0]) || "Unknown",
                    year: (x.release_date || "").slice(0, 4),
                    synopsis: x.overview || "No synopsis available",
                    type: "movie" as const,
                })),
                ...(t.results || []).map((x: any) => ({
                    id: String(x.id),
                    title: x.name,
                    cover: x.poster_path
                        ? `https://image.tmdb.org/t/p/w500${x.poster_path}`
                        : "/placeholder.svg",
                    rating: x.vote_average || 0,
                    genre: [],
                    country:
                        (x.origin_country && x.origin_country[0]) || "Unknown",
                    year: (x.first_air_date || "").slice(0, 4),
                    synopsis: x.overview || "No synopsis available",
                    type: "series" as const,
                })),
            ];

            return {
                data,
                page,
                totalPages: Math.max(m.total_pages || 1, t.total_pages || 1),
                totalItems: data.length,
            };
        } catch (error) {
            console.error("Failed to get movies by year:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getAllGenres(): Promise<string[]> {
        await this.ensureGenreMap();
        return Object.keys(this.genreMap || {});
    }

    async getAllCountries(): Promise<string[]> {
        if (this.countriesCache) return this.countriesCache;

        try {
            const [popularMovies, popularTv] = await Promise.all([
                this.fetchWithFallback(
                    `/movie/popular?page=1&api_key=${TMDB_KEY}`
                ),
                this.fetchWithFallback(
                    `/tv/popular?page=1&api_key=${TMDB_KEY}`
                ),
            ]);

            const set = new Set<string>();
            for (const m of popularMovies.results || []) {
                if (Array.isArray(m.origin_country)) {
                    for (const c of m.origin_country) set.add(c);
                }
            }
            for (const t of popularTv.results || []) {
                if (Array.isArray(t.origin_country)) {
                    for (const c of t.origin_country) set.add(c);
                }
            }

            this.countriesCache = Array.from(set).sort();
            return this.countriesCache;
        } catch (error) {
            console.error("Failed to get countries:", error);
            return ["US", "JP", "KR", "ID"];
        }
    }

    async getYears(): Promise<string[]> {
        const current = new Date().getFullYear();
        const start = 1970;
        const out: string[] = [];
        for (let y = current; y >= start; y--) {
            out.push(String(y));
        }
        return out;
    }

    async getAnime(
        page = 1,
        opts?: {
            type?: "tv" | "movie" | "all";
            audio?: "sub" | "dub" | "all";
            adult?: "include" | "exclude" | "only";
        }
    ): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const animation = (this.genreMap || {})["Animation"];
        const results: Movie[] = [];
        const type = opts?.type || "all";
        const audio = opts?.audio || "all";
        const adult = opts?.adult || "exclude";
        const pagesToFetch = 3;

        if (adult === "only") {
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }

        const pushFiltered = (items: any[], map: (x: any) => Movie) => {
            for (const x of items) {
                const lang = x.original_language || "ja";
                if (audio === "sub" && lang !== "ja") continue;
                if (audio === "dub" && lang === "ja") continue;
                results.push(map(x));
            }
        };

        try {
            if ((type === "tv" || type === "all") && animation?.tv) {
                for (let p = page; p < page + pagesToFetch; p++) {
                    const r = await this.fetchWithFallback(
                        `/discover/tv?with_genres=${animation.tv}&with_origin_country=JP&page=${p}&api_key=${TMDB_KEY}`
                    );
                    pushFiltered(r.results || [], (t: any) => ({
                        id: String(t.id),
                        title: t.name,
                        cover: t.poster_path
                            ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
                            : "/placeholder.svg",
                        rating: t.vote_average || 0,
                        genre: ["Animation"],
                        country:
                            (t.origin_country && t.origin_country[0]) || "JP",
                        year: (t.first_air_date || "").slice(0, 4),
                        synopsis: t.overview || "No synopsis available",
                        type: "series" as const,
                    }));
                }
            }

            if ((type === "movie" || type === "all") && animation?.movie) {
                for (let p = page; p < page + pagesToFetch; p++) {
                    const r = await this.fetchWithFallback(
                        `/discover/movie?with_genres=${animation.movie}&with_origin_country=JP&page=${p}&api_key=${TMDB_KEY}`
                    );
                    pushFiltered(r.results || [], (m: any) => ({
                        id: String(m.id),
                        title: m.title,
                        cover: m.poster_path
                            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                            : "/placeholder.svg",
                        rating: m.vote_average || 0,
                        genre: ["Animation"],
                        country:
                            (m.origin_country && m.origin_country[0]) || "JP",
                        year: (m.release_date || "").slice(0, 4),
                        synopsis: m.overview || "No synopsis available",
                        type: "movie" as const,
                    }));
                }
            }

            return {
                data: results,
                page,
                totalPages: 1,
                totalItems: results.length,
            };
        } catch (error) {
            console.error("Failed to get anime:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    // Fungsi getAdultMovies yang dimodifikasi untuk mengambil data dari TMDB berdasarkan genre yang mungkin lebih intens (misalnya Romance, Thriller)
    // Ini adalah pendekatan terbaik jika tidak ada API konten eksplisit.
    // Anda bisa menggabungkan beberapa genre.
    async getAdultMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const romanceId = (this.genreMap || {})["Romance"]?.movie;
        const thrillerId = (this.genreMap || {})["Thriller"]?.movie; // Tambahkan genre lain jika diinginkan
        const pagesToFetch = 3;
        const results: Movie[] = [];

        try {
            // Ambil dari genre Romance
            if (romanceId) {
                for (let p = page; p < page + pagesToFetch; p++) {
                    const r = await this.fetchWithFallback(
                        `/discover/movie?with_genres=${romanceId}&sort_by=popularity.desc&page=${p}&api_key=${TMDB_KEY}`
                    );
                    results.push(
                        ...(r.results || []).map((m: any) => ({
                            id: String(m.id),
                            title: m.title,
                            cover: m.poster_path
                                ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                                : "/placeholder.svg",
                            rating: m.vote_average || 0,
                            genre: m.genre_ids?.map((id: number) =>
                                this.getGenreName(id)
                            ) || ["Romance"],
                            country:
                                (m.origin_country && m.origin_country[0]) ||
                                "Unknown",
                            year: (m.release_date || "").slice(0, 4),
                            synopsis: m.overview || "No synopsis available",
                            type: "movie" as const,
                        }))
                    );
                }
            }

            // Ambil dari genre Thriller
            if (thrillerId) {
                for (let p = page; p < page + pagesToFetch; p++) {
                    const r = await this.fetchWithFallback(
                        `/discover/movie?with_genres=${thrillerId}&sort_by=popularity.desc&page=${p}&api_key=${TMDB_KEY}`
                    );
                    results.push(
                        ...(r.results || []).map((m: any) => ({
                            id: String(m.id),
                            title: m.title,
                            cover: m.poster_path
                                ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                                : "/placeholder.svg",
                            rating: m.vote_average || 0,
                            genre: m.genre_ids?.map((id: number) =>
                                this.getGenreName(id)
                            ) || ["Thriller"],
                            country:
                                (m.origin_country && m.origin_country[0]) ||
                                "Unknown",
                            year: (m.release_date || "").slice(0, 4),
                            synopsis: m.overview || "No synopsis available",
                            type: "movie" as const,
                        }))
                    );
                }
            }

            // Hilangkan duplikat berdasarkan ID
            const uniqueResults = results.filter(
                (movie, index, self) =>
                    index === self.findIndex((m) => m.id === movie.id)
            );

            return {
                data: uniqueResults,
                page,
                totalPages: 1,
                totalItems: uniqueResults.length,
            };
        } catch (error) {
            console.error(
                "Failed to get adult movies (alternative method):",
                error
            );
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    // Helper untuk mendapatkan nama genre dari ID
    private getGenreName(id: number): string {
        if (!this.genreMap) return "Unknown";
        const genre = Object.entries(this.genreMap).find(
            ([_, value]) => value.movie === id || value.tv === id
        );
        return genre ? genre[0] : "Unknown";
    }

    async getIndonesianMovies(
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const adultParam = this.buildAdultParams(opts?.adult);
            if (adultParam === "only") {
                return { data: [], page: 1, totalPages: 1, totalItems: 0 };
            }
            const r = await this.fetchWithFallback(
                `/discover/movie?with_origin_country=ID&page=${page}&api_key=${TMDB_KEY}`
            );
            const data: Movie[] = (r.results || []).map((m: any) => ({
                id: String(m.id),
                title: m.title,
                cover: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "/placeholder.svg",
                rating: m.vote_average || 0,
                genre: [],
                country: "Indonesia",
                year: (m.release_date || "").slice(0, 4),
                synopsis: m.overview || "No synopsis available",
                type: "movie" as const,
            }));

            return {
                data,
                page: r.page || page,
                totalPages: r.total_pages || 1,
                totalItems: r.total_results || data.length,
            };
        } catch (error) {
            console.error("Failed to get Indonesian movies:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getKoreanDrama(
        page = 1,
        opts?: { adult?: "include" | "exclude" | "only" }
    ): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const drama = (this.genreMap || {})["Drama"];
        const results: Movie[] = [];
        const pagesToFetch = 3;
        const adultParam = this.buildAdultParams(opts?.adult);

        if (adultParam === "only") {
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }

        try {
            if (drama?.tv) {
                for (let p = page; p < page + pagesToFetch; p++) {
                    const r = await this.fetchWithFallback(
                        `/discover/tv?with_genres=${drama.tv}&with_origin_country=KR&page=${p}&api_key=${TMDB_KEY}`
                    );
                    results.push(
                        ...(r.results || []).map((t: any) => ({
                            id: String(t.id),
                            title: t.name,
                            cover: t.poster_path
                                ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
                                : "/placeholder.svg",
                            rating: t.vote_average || 0,
                            genre: ["Drama"],
                            country: "Korea",
                            year: (t.first_air_date || "").slice(0, 4),
                            synopsis: t.overview || "No synopsis available",
                            type: "series" as const,
                        }))
                    );
                }
            }

            return {
                data: results,
                page,
                totalPages: 1,
                totalItems: results.length,
            };
        } catch (error) {
            console.error("Failed to get Korean drama:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }
}

export const movieAPI = new MovieAPI();
