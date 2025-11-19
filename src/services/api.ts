// Using unofficial API from https://github.com/febriadj/lk21-api
const API_BASE_URL = 'https://lk21-api.cyclic.app';
const API_FALLBACK_URL = 'https://lk21-api.cyclic.app'; // Same API, no fallback needed

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
  type: 'movie' | 'series';
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  cover: string;
  streamUrl: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

class MovieAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchWithFallback(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      if (!response.ok) throw new Error('Primary API failed');
      return await response.json();
    } catch (error) {
      console.warn('Primary API failed, trying fallback...', error);
      const response = await fetch(`${API_FALLBACK_URL}${endpoint}`, options);
      if (!response.ok) throw new Error('Both APIs failed');
      return await response.json();
    }
  }

  async getLatestMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/movies?page=${page}`);
  }

  async getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/popular/movies?page=${page}`);
  }

  async getLatestSeries(page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/series?page=${page}`);
  }

  async getMovieById(id: string): Promise<Movie> {
    return this.fetchWithFallback(`/movies/${id}`);
  }

  async getSeriesById(id: string): Promise<Movie> {
    return this.fetchWithFallback(`/series/${id}`);
  }

  async getEpisodes(seriesId: string): Promise<Episode[]> {
    const response = await this.fetchWithFallback(`/series/${seriesId}`);
    return response.episodes || [];
  }

  async getEpisodeById(seriesId: string, episodeId: string): Promise<Episode> {
    return this.fetchWithFallback(`/series/${seriesId}/streams?episode=${episodeId}`);
  }

  async searchMovies(query: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/search/${encodeURIComponent(query)}?page=${page}`);
  }

  async getMoviesByGenre(genre: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/genres/${encodeURIComponent(genre)}?page=${page}`);
  }

  async getMoviesByCountry(country: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/countries/${encodeURIComponent(country)}?page=${page}`);
  }

  async getMoviesByYear(year: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/years/${year}?page=${page}`);
  }

  async getAllGenres(): Promise<string[]> {
    return this.fetchWithFallback('/genres');
  }

  async getAllCountries(): Promise<string[]> {
    return this.fetchWithFallback('/countries');
  }

  async getYears(): Promise<string[]> {
    return this.fetchWithFallback('/years');
  }
}

export const movieAPI = new MovieAPI();
