// TMDB API Service

import { API_HOSTS, TMDB_BASE, TMDB_KEY } from "./constants";
import type { Movie, Episode, PaginatedResponse } from "./types";

export class TMDBService {
    private hosts: string[];
    private genreMap?: Record<string, { movie?: number; tv?: number }>;
    private countriesCache?: string[];

    constructor() {
        this.hosts = API_HOSTS.length
            ? API_HOSTS
            : ["https://api.themoviedb.org/3"];
    }

    // Fallback mechanism
    private async fetchWithFallback(endpoint: string, options?: RequestInit) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let lastError: unknown = null;

        try {
            const url = endpoint.startsWith("http")
                ? endpoint
                : `${TMDB_BASE}${endpoint}${
                      endpoint.includes("?") ? "&" : "?"
                  }api_key=${TMDB_KEY}`;

            const res = await fetch(url, {
                ...options,
                mode: "cors",
                signal: controller.signal,
                headers: {
                    Accept: "application/json",
                    ...options?.headers,
                },
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

            for (const host of this.hosts) {
                if (host === TMDB_BASE) continue;

                try {
                    const fallbackUrl = endpoint.startsWith("http")
                        ? endpoint
                        : `${host}${endpoint}`;

                    const fallbackRes = await fetch(fallbackUrl, {
                        ...options,
                        signal: AbortSignal.timeout(10000),
                    });

                    if (fallbackRes.ok) {
                        return await fallbackRes.json();
                    }
                } catch (fallbackError) {
                    console.warn(
                        `Fallback host ${host} failed:`,
                        fallbackError
                    );
                }
            }

            if (import.meta.env.DEV) {
                return this.offlineResponse(endpoint);
            }

            throw lastError instanceof Error
                ? lastError
                : new Error("All API requests failed");
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
        ];

        if (endpoint.includes("/genres"))
            return ["Action", "Drama", "Comedy", "Horror", "Sci-Fi"];
        if (endpoint.includes("/countries"))
            return ["USA", "Japan", "Korea", "Indonesia"];

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

    private getGenreName(id: number, type: "movie" | "tv"): string {
        if (!this.genreMap) return "Unknown";

        for (const [name, genres] of Object.entries(this.genreMap)) {
            if (type === "movie" && genres.movie === id) return name;
            if (type === "tv" && genres.tv === id) return name;
        }
        return "Unknown";
    }

    private async ensureGenreMap() {
        if (this.genreMap) return;

        try {
            const [movieGenres, tvGenres] = await Promise.all([
                this.fetchWithFallback(`/genre/movie/list`),
                this.fetchWithFallback(`/genre/tv/list`),
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

    async getLatestMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        try {
            const r = await this.fetchWithFallback(
                `/movie/now_playing?page=${page}`
            );
            const data: Movie[] = (r.results || []).map((m: any) => ({
                id: String(m.id),
                title: m.title,
                cover: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "/placeholder.svg",
                rating: m.vote_average || 0,
                genre: (m.genre_ids || []).map((id: number) =>
                    this.getGenreName(id, "movie")
                ),
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

    async getLatestSeries(page = 1): Promise<PaginatedResponse<Movie>> {
        try {
            const r = await this.fetchWithFallback(
                `/tv/on_the_air?page=${page}`
            );
            const data: Movie[] = (r.results || []).map((t: any) => ({
                id: String(t.id),
                title: t.name,
                cover: t.poster_path
                    ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
                    : "/placeholder.svg",
                rating: t.vote_average || 0,
                genre: (t.genre_ids || []).map((id: number) =>
                    this.getGenreName(id, "tv")
                ),
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

    async getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        try {
            const r = await this.fetchWithFallback(
                `/movie/popular?page=${page}`
            );
            const data: Movie[] = (r.results || []).map((m: any) => ({
                id: String(m.id),
                title: m.title,
                cover: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "/placeholder.svg",
                rating: m.vote_average || 0,
                genre: (m.genre_ids || []).map((id: number) =>
                    this.getGenreName(id, "movie")
                ),
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

    async getMovieById(id: string): Promise<Movie> {
        try {
            const m = await this.fetchWithFallback(
                `/movie/${id}?append_to_response=videos,credits,images`
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
                `/tv/${id}?append_to_response=videos,credits,images`
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
                seasons: (s.seasons || [])
                    .filter((season: any) => season.season_number > 0)
                    .map((season: any) => ({
                        id: season.id,
                        name: season.name,
                        episodeCount: season.episode_count,
                        year: (season.air_date || "").slice(0, 4),
                        overview: season.overview,
                        cover: season.poster_path
                            ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                            : undefined,
                        seasonNumber: season.season_number,
                    })),
                type: "series" as const,
            };
        } catch (error) {
            console.error("Failed to get series by ID:", error);
            throw error;
        }
    }

    async getEpisodes(seriesId: string): Promise<Episode[]> {
        try {
            const tv = await this.fetchWithFallback(`/tv/${seriesId}`);

            const seasons = (tv.seasons || [])
                .filter((s: any) => s.season_number > 0 && s.episode_count > 0)
                .sort((a: any, b: any) => a.season_number - b.season_number);

            if (seasons.length === 0) {
                console.warn(`No valid seasons found for series ${seriesId}`);
                return [];
            }

            const eps: Episode[] = [];

            for (const s of seasons) {
                try {
                    const r = await this.fetchWithFallback(
                        `/tv/${seriesId}/season/${s.season_number}`
                    );

                    if (r.episodes && Array.isArray(r.episodes)) {
                        const seasonEpisodes = r.episodes
                            .sort(
                                (a: any, b: any) =>
                                    a.episode_number - b.episode_number
                            )
                            .sort(
                                (a: any, b: any) =>
                                    a.episode_number - b.episode_number
                            )
                            .map((e: any) => {
                                return {
                                    id: `${s.season_number}-${e.episode_number}`,
                                    title:
                                        e.name || `Episode ${e.episode_number}`,
                                    episodeNumber: e.episode_number,
                                    seasonNumber: s.season_number,
                                    cover: e.still_path
                                        ? `https://image.tmdb.org/t/p/w500${e.still_path}`
                                        : "/placeholder.svg",
                                    streamUrl: `#`,
                                };
                            });

                        eps.push(...seasonEpisodes);
                    }
                } catch (error) {
                    console.error(
                        `Failed to get season ${s.season_number}:`,
                        error
                    );
                }
            }

            return eps;
        } catch (error) {
            console.error(
                `Failed to get episodes for series ${seriesId}:`,
                error
            );
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
                `/tv/${seriesId}/season/${season}/episode/${ep}`
            );

            return {
                id: `${season}-${ep}`,
                title: d.name || `Episode ${ep}`,
                episodeNumber: ep,
                seasonNumber: season,
                cover: d.still_path
                    ? `https://image.tmdb.org/t/p/w500${d.still_path}`
                    : "/placeholder.svg",
                streamUrl: "#",
            };
        } catch (error) {
            console.error("Failed to get episode by ID:", error);
            throw error;
        }
    }

    async searchMovies(
        query: string,
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const r = await this.fetchWithFallback(
                `/search/multi?query=${encodeURIComponent(query)}&page=${page}`
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
                    genre: (item.genre_ids || []).map((id: number) =>
                        this.getGenreName(
                            id,
                            item.media_type === "tv" ? "tv" : "movie"
                        )
                    ),
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
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const key = Object.keys(this.genreMap || {}).find(
            (k) => k.toLowerCase() === genre.toLowerCase()
        );
        const ids = key ? (this.genreMap as any)[key] : {};
        const out: Movie[] = [];

        try {
            if (ids.movie) {
                const r = await this.fetchWithFallback(
                    `/discover/movie?with_genres=${ids.movie}&page=${page}`
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
                    `/discover/tv?with_genres=${ids.tv}&page=${page}`
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
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const [m, t] = await Promise.all([
                this.fetchWithFallback(
                    `/discover/movie?with_origin_country=${encodeURIComponent(
                        country
                    )}&page=${page}`
                ),
                this.fetchWithFallback(
                    `/discover/tv?with_origin_country=${encodeURIComponent(
                        country
                    )}&page=${page}`
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
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        try {
            const [m, t] = await Promise.all([
                this.fetchWithFallback(
                    `/discover/movie?primary_release_year=${encodeURIComponent(
                        year
                    )}&page=${page}`
                ),
                this.fetchWithFallback(
                    `/discover/tv?first_air_date_year=${encodeURIComponent(
                        year
                    )}&page=${page}`
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
        const genres = Object.keys(this.genreMap || {});
        return genres.sort();
    }

    async getAllCountries(): Promise<string[]> {
        if (this.countriesCache) return this.countriesCache;

        // Comprehensive list of country codes (ISO 3166-1 alpha-2)
        const allCountries = [
            "AD",
            "AE",
            "AF",
            "AG",
            "AI",
            "AL",
            "AM",
            "AO",
            "AQ",
            "AR",
            "AS",
            "AT",
            "AU",
            "AW",
            "AX",
            "AZ",
            "BA",
            "BB",
            "BD",
            "BE",
            "BF",
            "BG",
            "BH",
            "BI",
            "BJ",
            "BL",
            "BM",
            "BN",
            "BO",
            "BQ",
            "BR",
            "BS",
            "BT",
            "BV",
            "BW",
            "BY",
            "BZ",
            "CA",
            "CC",
            "CD",
            "CF",
            "CG",
            "CH",
            "CI",
            "CK",
            "CL",
            "CM",
            "CN",
            "CO",
            "CR",
            "CU",
            "CV",
            "CW",
            "CX",
            "CY",
            "CZ",
            "DE",
            "DJ",
            "DK",
            "DM",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "EH",
            "ER",
            "ES",
            "ET",
            "FI",
            "FJ",
            "FK",
            "FM",
            "FO",
            "FR",
            "GA",
            "GB",
            "GD",
            "GE",
            "GF",
            "GG",
            "GH",
            "GI",
            "GL",
            "GM",
            "GN",
            "GP",
            "GQ",
            "GR",
            "GS",
            "GT",
            "GU",
            "GW",
            "GY",
            "HK",
            "HM",
            "HN",
            "HR",
            "HT",
            "HU",
            "ID",
            "IE",
            "IM",
            "IN",
            "IO",
            "IQ",
            "IR",
            "IS",
            "IT",
            "JE",
            "JM",
            "JO",
            "JP",
            "KE",
            "KG",
            "KH",
            "KI",
            "KM",
            "KN",
            "KP",
            "KR",
            "KW",
            "KY",
            "KZ",
            "LA",
            "LB",
            "LC",
            "LI",
            "LK",
            "LR",
            "LS",
            "LT",
            "LU",
            "LV",
            "LY",
            "MA",
            "MC",
            "MD",
            "ME",
            "MF",
            "MG",
            "MH",
            "MK",
            "ML",
            "MM",
            "MN",
            "MO",
            "MP",
            "MQ",
            "MR",
            "MS",
            "MT",
            "MU",
            "MV",
            "MW",
            "MX",
            "MY",
            "MZ",
            "NA",
            "NC",
            "NE",
            "NF",
            "NG",
            "NI",
            "NL",
            "NO",
            "NP",
            "NR",
            "NU",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PF",
            "PG",
            "PH",
            "PK",
            "PL",
            "PM",
            "PN",
            "PR",
            "PS",
            "PT",
            "PW",
            "PY",
            "QA",
            "RE",
            "RO",
            "RS",
            "RU",
            "RW",
            "SA",
            "SB",
            "SC",
            "SD",
            "SE",
            "SG",
            "SH",
            "SI",
            "SJ",
            "SK",
            "SL",
            "SM",
            "SN",
            "SO",
            "SR",
            "SS",
            "ST",
            "SV",
            "SX",
            "SY",
            "SZ",
            "TC",
            "TD",
            "TF",
            "TG",
            "TH",
            "TJ",
            "TK",
            "TL",
            "TM",
            "TN",
            "TO",
            "TR",
            "TT",
            "TV",
            "TW",
            "TZ",
            "UA",
            "UG",
            "UM",
            "US",
            "UY",
            "UZ",
            "VA",
            "VC",
            "VE",
            "VG",
            "VI",
            "VN",
            "VU",
            "WF",
            "WS",
            "YE",
            "YT",
            "ZA",
            "ZM",
            "ZW",
        ];

        this.countriesCache = allCountries;
        return this.countriesCache;
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
        opts?: { type?: "tv" | "movie" | "all"; audio?: "sub" | "dub" | "all" }
    ): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const animation = (this.genreMap || {})["Animation"];

        if (!animation || (!animation.tv && !animation.movie)) {
            console.error("Animation genre not found in genre map");
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }

        const results: Movie[] = [];
        const type = opts?.type || "all";
        const audio = opts?.audio || "all";

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
                const r = await this.fetchWithFallback(
                    `/discover/tv?with_genres=${animation.tv}&with_origin_country=JP&sort_by=popularity.desc&page=${page}`
                );

                pushFiltered(r.results || [], (t: any) => ({
                    id: String(t.id),
                    title: t.name,
                    cover: t.poster_path
                        ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
                        : "/placeholder.svg",
                    rating: t.vote_average || 0,
                    genre: ["Animation", "Anime"],
                    country: "Japan",
                    year: (t.first_air_date || "").slice(0, 4),
                    synopsis: t.overview || "No synopsis available",
                    type: "series" as const,
                }));
            }

            if ((type === "movie" || type === "all") && animation?.movie) {
                const r = await this.fetchWithFallback(
                    `/discover/movie?with_genres=${animation.movie}&with_origin_country=JP&sort_by=popularity.desc&page=${page}`
                );

                pushFiltered(r.results || [], (m: any) => ({
                    id: String(m.id),
                    title: m.title,
                    cover: m.poster_path
                        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                        : "/placeholder.svg",
                    rating: m.vote_average || 0,
                    genre: ["Animation", "Anime"],
                    country: "Japan",
                    year: (m.release_date || "").slice(0, 4),
                    synopsis: m.overview || "No synopsis available",
                    type: "movie" as const,
                }));
            }

            return {
                data: results,
                page,
                totalPages: 20,
                totalItems: results.length,
            };
        } catch (error) {
            console.error("Failed to get anime:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getAdultMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const romanceId = (this.genreMap || {})["Romance"]?.movie;

        if (!romanceId) {
            console.error("Romance genre not found");
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }

        try {
            const r = await this.fetchWithFallback(
                `/discover/movie?with_genres=${romanceId}&sort_by=popularity.desc&page=${page}`
            );

            const results = (r.results || []).map((m: any) => ({
                id: String(m.id),
                title: m.title,
                cover: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "/placeholder.svg",
                rating: m.vote_average || 0,
                genre: ["Romance"],
                country: (m.origin_country && m.origin_country[0]) || "Unknown",
                year: (m.release_date || "").slice(0, 4),
                synopsis: m.overview || "No synopsis available",
                type: "movie" as const,
            }));

            return {
                data: results,
                page: r.page || page,
                totalPages: r.total_pages || 1,
                totalItems: r.total_results || results.length,
            };
        } catch (error) {
            console.error("Failed to get adult movies:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }

    async getIndonesianMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        try {
            const r = await this.fetchWithFallback(
                `/discover/movie?with_origin_country=ID&sort_by=popularity.desc&page=${page}`
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

    async getKoreanDrama(page = 1): Promise<PaginatedResponse<Movie>> {
        await this.ensureGenreMap();
        const drama = (this.genreMap || {})["Drama"];

        if (!drama?.tv) {
            console.error("Drama genre not found for TV");
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }

        try {
            const r = await this.fetchWithFallback(
                `/discover/tv?with_genres=${drama.tv}&with_origin_country=KR&sort_by=popularity.desc&page=${page}`
            );

            const results = (r.results || []).map((t: any) => ({
                id: String(t.id),
                title: t.name,
                cover: t.poster_path
                    ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
                    : "/placeholder.svg",
                rating: t.vote_average || 0,
                genre: ["Drama", "Korean Drama"],
                country: "Korea",
                year: (t.first_air_date || "").slice(0, 4),
                synopsis: t.overview || "No synopsis available",
                type: "series" as const,
            }));

            return {
                data: results,
                page: r.page || page,
                totalPages: r.total_pages || 1,
                totalItems: r.total_results || results.length,
            };
        } catch (error) {
            console.error("Failed to get Korean drama:", error);
            return { data: [], page: 1, totalPages: 1, totalItems: 0 };
        }
    }
}
