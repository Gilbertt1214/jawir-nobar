// Auto-translation utility for dynamic API data
// Uses Google Translate API (free tier) with caching

const TRANSLATE_CACHE_KEY = "translate_cache";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
    text: string;
    timestamp: number;
}

interface TranslateCache {
    [key: string]: CacheEntry;
}

// Load cache from localStorage
function loadCache(): TranslateCache {
    try {
        const cached = localStorage.getItem(TRANSLATE_CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached) as TranslateCache;
            // Clean expired entries
            const now = Date.now();
            const cleaned: TranslateCache = {};
            for (const [key, entry] of Object.entries(parsed)) {
                if (now - entry.timestamp < CACHE_EXPIRY) {
                    cleaned[key] = entry;
                }
            }
            return cleaned;
        }
    } catch {
        // Ignore cache errors
    }
    return {};
}

// Save cache to localStorage
function saveCache(cache: TranslateCache): void {
    try {
        localStorage.setItem(TRANSLATE_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Ignore storage errors
    }
}

// In-memory cache for current session
let memoryCache: TranslateCache = loadCache();

// Generate cache key
function getCacheKey(text: string, targetLang: string): string {
    return `${targetLang}:${text.substring(0, 100)}`;
}

/**
 * Translate text using Google Translate API (free)
 * Falls back to original text if translation fails
 */
export async function translateText(
    text: string,
    targetLang: string = "id"
): Promise<string> {
    if (!text || text.trim() === "") return text;
    if (targetLang === "en") return text; // No translation needed for English

    const cacheKey = getCacheKey(text, targetLang);

    // Check cache first
    if (memoryCache[cacheKey]) {
        return memoryCache[cacheKey].text;
    }

    try {
        // Use Google Translate API (free tier via translate.googleapis.com)
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
            text
        )}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Translation failed");

        const data = await response.json();

        // Extract translated text from response
        // Response format: [[["translated text","original text",null,null,10]],null,"en",...]
        let translated = "";
        if (data && data[0]) {
            for (const part of data[0]) {
                if (part[0]) {
                    translated += part[0];
                }
            }
        }

        if (translated) {
            // Cache the result
            memoryCache[cacheKey] = {
                text: translated,
                timestamp: Date.now(),
            };
            saveCache(memoryCache);
            return translated;
        }

        return text;
    } catch (error) {
        console.warn("Translation failed, using original text:", error);
        return text;
    }
}

export async function translateBatch(
    texts: string[],
    targetLang: string = "id"
): Promise<string[]> {
    if (targetLang === "en") return texts;

    const results: string[] = [];
    const toTranslate: { index: number; text: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (!text || text.trim() === "") {
            results[i] = text;
            continue;
        }

        const cacheKey = getCacheKey(text, targetLang);
        if (memoryCache[cacheKey]) {
            results[i] = memoryCache[cacheKey].text;
        } else {
            toTranslate.push({ index: i, text });
        }
    }

   
    if (toTranslate.length > 0) {
        const batchSize = 5;
        for (let i = 0; i < toTranslate.length; i += batchSize) {
            const batch = toTranslate.slice(i, i + batchSize);
            const translations = await Promise.all(
                batch.map(({ text }) => translateText(text, targetLang))
            );
            batch.forEach(({ index }, j) => {
                results[index] = translations[j];
            });
        }
    }

    return results;
}


const GENRE_TRANSLATIONS: Record<string, string> = {
    Action: "Aksi",
    Adventure: "Petualangan",
    Animation: "Animasi",
    Comedy: "Komedi",
    Crime: "Kriminal",
    Documentary: "Dokumenter",
    Drama: "Drama",
    Family: "Keluarga",
    Fantasy: "Fantasi",
    History: "Sejarah",
    Horror: "Horor",
    Music: "Musik",
    Mystery: "Misteri",
    Romance: "Romantis",
    "Science Fiction": "Fiksi Ilmiah",
    "Sci-Fi": "Fiksi Ilmiah",
    "TV Movie": "Film TV",
    Thriller: "Thriller",
    War: "Perang",
    Western: "Barat",
    Supernatural: "Supernatural",
    Psychological: "Psikologis",
    "Slice of Life": "Kehidupan Sehari-hari",
    Sports: "Olahraga",
    Ecchi: "Ecchi",
    Harem: "Harem",
    Isekai: "Isekai",
    Mecha: "Mecha",
    "Martial Arts": "Seni Bela Diri",
    School: "Sekolah",
    Shounen: "Shounen",
    Shoujo: "Shoujo",
    Seinen: "Seinen",
    Josei: "Josei",
    Kids: "Anak-anak",
};

const COUNTRY_TRANSLATIONS: Record<string, string> = {
    "United States": "Amerika Serikat",
    "United Kingdom": "Inggris",
    Japan: "Jepang",
    "South Korea": "Korea Selatan",
    "North Korea": "Korea Utara",
    China: "Tiongkok",
    France: "Prancis",
    Germany: "Jerman",
    Italy: "Italia",
    Spain: "Spanyol",
    Brazil: "Brasil",
    India: "India",
    Russia: "Rusia",
    Canada: "Kanada",
    Australia: "Australia",
    Mexico: "Meksiko",
    Thailand: "Thailand",
    Indonesia: "Indonesia",
    Malaysia: "Malaysia",
    Philippines: "Filipina",
    Vietnam: "Vietnam",
    Singapore: "Singapura",
    Netherlands: "Belanda",
    Belgium: "Belgia",
    Sweden: "Swedia",
    Norway: "Norwegia",
    Denmark: "Denmark",
    Finland: "Finlandia",
    Poland: "Polandia",
    Turkey: "Turki",
    Egypt: "Mesir",
    "South Africa": "Afrika Selatan",
    Argentina: "Argentina",
    Colombia: "Kolombia",
    Chile: "Chili",
    Peru: "Peru",
    "New Zealand": "Selandia Baru",
    Ireland: "Irlandia",
    Scotland: "Skotlandia",
    Wales: "Wales",
    Austria: "Austria",
    Switzerland: "Swiss",
    Portugal: "Portugal",
    Greece: "Yunani",
    "Czech Republic": "Republik Ceko",
    Czechia: "Ceko",
    Hungary: "Hungaria",
    Romania: "Rumania",
    Ukraine: "Ukraina",
    "Saudi Arabia": "Arab Saudi",
    "United Arab Emirates": "Uni Emirat Arab",
    Israel: "Israel",
    Iran: "Iran",
    Iraq: "Irak",
    Pakistan: "Pakistan",
    Bangladesh: "Bangladesh",
    "Sri Lanka": "Sri Lanka",
    Nepal: "Nepal",
    Myanmar: "Myanmar",
    Cambodia: "Kamboja",
    Laos: "Laos",
    "Hong Kong": "Hong Kong",
    Taiwan: "Taiwan",
    Mongolia: "Mongolia",
};

export function translateGenre(
    genre: string,
    targetLang: string = "id"
): string {
    if (targetLang === "en") return genre;
    return GENRE_TRANSLATIONS[genre] || genre;
}

export function translateCountry(
    country: string,
    targetLang: string = "id"
): string {
    if (targetLang === "en") return country;
    return COUNTRY_TRANSLATIONS[country] || country;
}


export function translateGenres(
    genres: string[],
    targetLang: string = "id"
): string[] {
    if (targetLang === "en") return genres;
    return genres.map((g) => translateGenre(g, targetLang));
}


export function clearTranslationCache(): void {
    memoryCache = {};
    localStorage.removeItem(TRANSLATE_CACHE_KEY);
}
