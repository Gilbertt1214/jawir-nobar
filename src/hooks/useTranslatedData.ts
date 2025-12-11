import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    translateText,
    translateGenres,
    translateCountry,
} from "@/lib/translate";

interface TranslatedMovie {
    synopsis?: string;
    genre?: string[];
    country?: string;
    [key: string]: any;
}

/**
 * Hook to auto-translate movie/series data when language is Indonesian
 */
export function useTranslatedMovie<T extends TranslatedMovie>(
    data: T | null | undefined
): T | null | undefined {
    const { language } = useLanguage();
    const [translated, setTranslated] = useState<T | null | undefined>(data);
    const translatedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!data) {
            setTranslated(data);
            return;
        }

        // Skip if already translated for this data
        const dataKey = `${data.id || data.title}-${language}`;
        if (translatedRef.current === dataKey) {
            return;
        }

        // If English, return original data
        if (language === "en") {
            setTranslated(data);
            translatedRef.current = dataKey;
            return;
        }

        // Translate for Indonesian
        const translateData = async () => {
            const result = { ...data };

            // Translate synopsis
            if (data.synopsis) {
                result.synopsis = await translateText(data.synopsis, language);
            }

            // Translate genres (instant, uses pre-defined)
            if (data.genre && Array.isArray(data.genre)) {
                result.genre = translateGenres(data.genre, language);
            }

            // Translate country (instant, uses pre-defined)
            if (data.country) {
                result.country = translateCountry(data.country, language);
            }

            setTranslated(result as T);
            translatedRef.current = dataKey;
        };

        translateData();
    }, [data, language]);

    return translated;
}

/**
 * Hook to translate a single text value
 */
export function useTranslatedText(
    text: string | undefined
): string | undefined {
    const { language } = useLanguage();
    const [translated, setTranslated] = useState<string | undefined>(text);
    const translatedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!text) {
            setTranslated(text);
            return;
        }

        const cacheKey = `${text.substring(0, 50)}-${language}`;
        if (translatedRef.current === cacheKey) {
            return;
        }

        if (language === "en") {
            setTranslated(text);
            translatedRef.current = cacheKey;
            return;
        }

        translateText(text, language).then((result) => {
            setTranslated(result);
            translatedRef.current = cacheKey;
        });
    }, [text, language]);

    return translated;
}

/**
 * Hook to translate an array of genres
 */
export function useTranslatedGenres(genres: string[] | undefined): string[] {
    const { language } = useLanguage();

    if (!genres || genres.length === 0) return [];
    if (language === "en") return genres;

    return translateGenres(genres, language);
}

/**
 * Hook to translate country name
 */
export function useTranslatedCountry(
    country: string | undefined
): string | undefined {
    const { language } = useLanguage();

    if (!country) return country;
    if (language === "en") return country;

    return translateCountry(country, language);
}
