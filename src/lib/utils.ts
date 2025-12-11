import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Re-export translation utilities
export {
    translateText,
    translateBatch,
    translateGenre,
    translateGenres,
    translateCountry,
    clearTranslationCache,
} from "./translate";
