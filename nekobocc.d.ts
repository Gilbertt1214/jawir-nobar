// Type definitions for nekobocc
// Project: https://github.com/Fantomubijone/nekobocc
// Definitions by: CineStream Hub

declare module "nekobocc" {
    export interface NekoBoccHentaiItem {
        title: string;
        img: string;
        link: string;
        slug: string;
        genre?: string[];
        duration?: string;
        synopsis?: string;
    }

    export interface NekoBoccDownloadLink {
        quality: string;
        size: string;
        link: string;
        type: string;
    }

    export interface NekoBoccStreamLink {
        quality: string;
        link: string;
        server: string;
    }

    export interface NekoBoccEpisodeDetail {
        title: string;
        img: string;
        genre: string[];
        duration: string;
        synopsis: string;
        download?: NekoBoccDownloadLink[];
        stream?: NekoBoccStreamLink[];
    }

    export interface NekoBoccError {
        error: string;
    }

    export default class NekoBocc {
        constructor();

        /**
         * Get latest release list
         * @returns Promise of array of hentai items or error
         */
        release(): Promise<NekoBoccHentaiItem[] | NekoBoccError>;

        /**
         * Get hentai list by page
         * @param page - Page number (default: 1)
         * @returns Promise of array of hentai items or error
         */
        hentai(page?: number): Promise<NekoBoccHentaiItem[] | NekoBoccError>;

        /**
         * Get episode detail by slug
         * @param slug - Episode slug/id
         * @returns Promise of episode detail or error
         */
        episode(slug: string): Promise<NekoBoccEpisodeDetail | NekoBoccError>;

        /**
         * Search hentai
         * @param query - Search query
         * @returns Promise of array of hentai items or error
         */
        search(query: string): Promise<NekoBoccHentaiItem[] | NekoBoccError>;

        /**
         * Get random hentai
         * @returns Promise of random hentai item or error
         */
        random(): Promise<NekoBoccHentaiItem | NekoBoccError>;
    }
}
