export const translations = {
  en: {
    // Common
    loading: "Loading...",
    loadingContent: "Loading content and thumbnails...",
    loadingAnime: "Loading anime...",
    loadingComments: "Loading comments...",
    loadingAnimeThumbnails: "Loading anime and thumbnails... (may take a moment)",
    error: "Error",
    retry: "Retry",
    viewAll: "View All",
    search: "Search...",
    home: "Home",
    online: "Online",
    offline: "Offline",
    
    // Navbar
    anime: "Anime",
    hentai: "Hentai",
    genres: "Genres",
    countries: "Countries",
    years: "Years",
    menu: "Menu",
    
    // Context Menu
    refresh: "Refresh",
    changeTheme: "Change Theme",
    language: "Language",
    shareLink: "Share Link",
    switchedToLight: "Switched to Light Mode",
    switchedToDark: "Switched to Dark Mode",
    switchedToSystem: "Switched to System Mode",
    
    // Browse Pages
    browseByGenre: "Browse by Genre",
    browseByCountry: "Browse by Country",
    browseByYear: "Browse by Year",
    selectGenre: "Select your favorite genre to find matching movies and series",
    selectCountry: "Select a country to find movies and series from that region",
    selectYear: "Select a year to find movies and series released in that year",
    failedToLoadGenres: "Failed to load genres.",
    failedToLoadCountries: "Failed to load countries.",
    failedToLoadYears: "Failed to load years.",
    
    // Player
    watchNow: "Watch Now",
    selectServer: "Select server",
    
    // Anime/Hentai
    episodes: "Episodes",
    episode: "Episode",
    synopsis: "Synopsis",
    cast: "Cast",
    noEpisodes: "No episodes available",
    comments: "Comments",
    yourName: "Your Name",
    writeComment: "Write your comment...",
    submitComment: "Submit Comment",
    noCommentsYet: "No comments yet. Be the first!",
    episodeNotAvailable: "This episode is not available. Try searching for this anime on the Anime page.",
    
    // Search
    searchAnime: "Search anime... (min 3 characters)",
    searchHentai: "Search hentai... (min 3 characters)",
    minCharSearch: "Type at least 3 characters to search",
    tryAgainLater: "Try again later or search for a specific title",
    failedToLoadContent: "Failed to load content",
    characters: "characters",
    
    // Tabs
    ongoing: "Ongoing",
    complete: "Complete",
    random: "Random",
    
    // Homepage
    latestMovies: "Latest Movies",
    popularMovies: "Popular Movies",
    latestSeries: "Latest Series",
    ongoingAnime: "Ongoing Anime",
    indonesianMovies: "Indonesian Movies",
    koreanDrama: "Korean Drama",
    romance: "Romance",
  },
  id: {
    // Common
    loading: "Memuat...",
    loadingContent: "Memuat konten dan thumbnail...",
    loadingAnime: "Memuat anime...",
    loadingComments: "Memuat komentar...",
    loadingAnimeThumbnails: "Memuat anime dan thumbnail... (mungkin butuh waktu)",
    error: "Error",
    retry: "Coba Lagi",
    viewAll: "Lihat Semua",
    search: "Cari...",
    home: "Beranda",
    online: "Online",
    offline: "Offline",
    
    // Navbar
    anime: "Anime",
    hentai: "Hentai",
    genres: "Genre",
    countries: "Negara",
    years: "Tahun",
    menu: "Menu",
    
    // Context Menu
    refresh: "Refresh",
    changeTheme: "Ganti Tema",
    language: "Bahasa",
    shareLink: "Bagikan Link",
    switchedToLight: "Beralih ke Mode Terang",
    switchedToDark: "Beralih ke Mode Gelap",
    switchedToSystem: "Beralih ke Mode Sistem",
    
    // Browse Pages
    browseByGenre: "Jelajahi berdasarkan Genre",
    browseByCountry: "Jelajahi berdasarkan Negara",
    browseByYear: "Jelajahi berdasarkan Tahun",
    selectGenre: "Pilih genre favorit kamu untuk menemukan film dan series yang sesuai",
    selectCountry: "Pilih negara untuk menemukan film dan series dari wilayah tersebut",
    selectYear: "Pilih tahun untuk menemukan film dan series yang dirilis pada tahun tersebut",
    failedToLoadGenres: "Gagal memuat daftar genre.",
    failedToLoadCountries: "Gagal memuat daftar negara.",
    failedToLoadYears: "Gagal memuat daftar tahun.",
    
    // Player
    watchNow: "Tonton Sekarang",
    selectServer: "Pilih server",
    
    // Anime/Hentai
    episodes: "Episode",
    episode: "Episode",
    synopsis: "Sinopsis",
    cast: "Pemeran",
    noEpisodes: "Tidak ada episode tersedia",
    comments: "Komentar",
    yourName: "Nama Kamu",
    writeComment: "Tulis komentar...",
    submitComment: "Kirim Komentar",
    noCommentsYet: "Belum ada komentar. Jadilah yang pertama!",
    episodeNotAvailable: "Episode ini tidak tersedia. Coba cari anime ini langsung di halaman Anime.",
    
    // Search
    searchAnime: "Cari anime... (min 3 karakter)",
    searchHentai: "Cari hentai... (min 3 karakter)",
    minCharSearch: "Ketik minimal 3 karakter untuk mencari",
    tryAgainLater: "Coba lagi nanti atau cari judul spesifik",
    failedToLoadContent: "Gagal memuat konten",
    characters: "karakter",
    
    // Tabs
    ongoing: "Ongoing",
    complete: "Tamat",
    random: "Acak",
    
    // Homepage
    latestMovies: "Film Terbaru",
    popularMovies: "Film Populer",
    latestSeries: "Series Terbaru",
    ongoingAnime: "Anime Ongoing",
    indonesianMovies: "Film Indonesia",
    koreanDrama: "Drama Korea",
    romance: "Romantis",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
