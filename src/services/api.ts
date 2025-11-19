const API_BASE_URL = 'https://tv.lk21official.live';
const API_FALLBACK_URL = 'https://tv.nontondrama.lol';

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
    return this.fetchWithFallback(`/api/movies/latest?page=${page}`);
  }

  async getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/api/movies/popular?page=${page}`);
  }

  async getLatestSeries(page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/api/series/latest?page=${page}`);
  }

  async getMovieById(id: string): Promise<Movie> {
    return this.fetchWithFallback(`/api/movies/${id}`);
  }

  async getSeriesById(id: string): Promise<Movie> {
    return this.fetchWithFallback(`/api/series/${id}`);
  }

  async getEpisodes(seriesId: string): Promise<Episode[]> {
    return this.fetchWithFallback(`/api/series/${seriesId}/episodes`);
  }

  async getEpisodeById(seriesId: string, episodeId: string): Promise<Episode> {
    return this.fetchWithFallback(`/api/series/${seriesId}/episodes/${episodeId}`);
  }

  async searchMovies(query: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
  }

  async getMoviesByGenre(genre: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/api/movies/genre/${encodeURIComponent(genre)}?page=${page}`);
  }

  async getMoviesByCountry(country: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/api/movies/country/${encodeURIComponent(country)}?page=${page}`);
  }

  async getMoviesByYear(year: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/api/movies/year/${year}?page=${page}`);
  }

  async getAllGenres(): Promise<string[]> {
    return this.fetchWithFallback('/api/genres');
  }

  async getAllCountries(): Promise<string[]> {
    return this.fetchWithFallback('/api/countries');
  }

  async getYears(): Promise<string[]> {
    return this.fetchWithFallback('/api/years');
  }
}

export const movieAPI = new MovieAPI();
