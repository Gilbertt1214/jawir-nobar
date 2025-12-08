import type {
    NekoBoccHentai,
    PaginatedResponse,
    StreamLink,
    DownloadLink,
} from "./types";

// Helper function to generate stream links for JAV
// Using sample video embeds for demo purposes
// In production, these would come from the actual NekoBocc API with real video IDs
const generateStreamLinks = (_javCode: string): StreamLink[] => [
    {
        quality: "HD",
        url: "https://www.youtube.com/embed/LXb3EKWsInQ",
        provider: "Sample Video 1",
    },
    {
        quality: "HD",
        url: "https://player.vimeo.com/video/824804225",
        provider: "Sample Video 2",
    },
    {
        quality: "SD",
        url: "https://www.youtube.com/embed/jNQXAC9IVRw",
        provider: "Sample Video 3",
    },
];

// Helper function to generate download links
const generateDownloadLinks = (javCode: string): DownloadLink[] => [
    {
        quality: "1080p",
        size: "2.5 GB",
        url: `https://download.javsite.com/${javCode.toLowerCase()}.mp4`,
        type: "Direct",
    },
    {
        quality: "720p",
        size: "1.2 GB",
        url: `https://download.javsite.com/${javCode.toLowerCase()}_720p.mp4`,
        type: "Direct",
    },
    {
        quality: "480p",
        size: "600 MB",
        url: `https://download.javsite.com/${javCode.toLowerCase()}_480p.mp4`,
        type: "Direct",
    },
];

// Use placeholder covers that work without CORS issues
// In production, these would come from the actual NekoBocc API
const getJavCover = (javCode: string): string => {
    // Using picsum.photos for reliable placeholder images
    const seed = javCode.replace("-", "");
    return `https://picsum.photos/seed/${seed}/400/600`;
};

// Helper untuk genre yang lebih realistis
const getGenres = (): string[] => {
    const baseGenres = ["HD"];
    const additionalGenres = [
        ["Beautiful Girl", "Creampie", "Solowork"],
        ["Beautiful Girl", "Plot", "Drama"],
        ["Busty", "Big Tits", "Creampie"],
        ["Slender", "Cowgirl", "Kissing"],
        ["Cute", "Schoolgirl", "First Time"],
        ["Mature", "Milf", "Seduction"],
        ["Idol", "Beautiful Face", "Interview"],
        ["Popular Actress", "Best Seller", "High Quality"],
        ["Petite", "Small Tits", "Youthful"],
        ["Athletic", "Sweat", "Intense"],
    ];

    const randomGenres =
        additionalGenres[Math.floor(Math.random() * additionalGenres.length)];
    return [...baseGenres, ...randomGenres];
};

// Generate realistic synopsis
const generateSynopsis = (actress: string, code: string): string => {
    const synopses = [
        `${actress}, seorang aktris JAV terkenal, membintangi karya terbarunya dengan penampilan yang memukau.`,
        `Dalam ${code}, ${actress} menunjukkan bakat aktingnya yang luar biasa dalam adegan-adegan panas.`,
        `${actress} kembali dengan penampilan spesial yang ditunggu-tunggu para penggemarnya.`,
        `Sebuah karya eksklusif yang menampilkan ${actress} dalam berbagai adegan yang menggoda.`,
        `${actress} menunjukkan sisi baru dirinya dalam produksi JAV berkualitas tinggi ini.`,
        `Penggemar ${actress} pasti tidak akan kecewa dengan penampilannya dalam ${code}.`,
        `Sebuah kolaborasi khusus yang menampilkan ${actress} dalam peran yang menantang.`,
        `${actress} membuktikan kenapa dia menjadi salah satu aktris JAV paling populer.`,
    ];

    return synopses[Math.floor(Math.random() * synopses.length)];
};

export const mockNekoBoccData: NekoBoccHentai[] = [
    {
        type: "jav",
        id: "ipx-001",
        title: "IPX-001 - First Time Tsubasa Amami",
        cover: getJavCover("ipx-001"),
        genre: getGenres(),
        duration: "120 min",
        synopsis: generateSynopsis("Tsubasa Amami", "IPX-001"),
        streamLinks: generateStreamLinks("ipx-001"),
        downloadLinks: generateDownloadLinks("ipx-001"),
    },
    {
        type: "jav",
        id: "ssis-100",
        title: "SSIS-100 - Yua Mikami Special Collection",
        cover: getJavCover("ssis-100"),
        genre: getGenres(),
        duration: "150 min",
        synopsis: generateSynopsis("Yua Mikami", "SSIS-100"),
        streamLinks: generateStreamLinks("ssis-100"),
        downloadLinks: generateDownloadLinks("ssis-100"),
    },
    {
        type: "jav",
        id: "abp-999",
        title: "ABP-999 - Remu Suzumori Best Selection",
        cover: getJavCover("abp-999"),
        genre: getGenres(),
        duration: "135 min",
        synopsis: generateSynopsis("Remu Suzumori", "ABP-999"),
        streamLinks: generateStreamLinks("abp-999"),
        downloadLinks: generateDownloadLinks("abp-999"),
    },
    {
        type: "jav",
        id: "mide-850",
        title: "MIDE-850 - Sakura Miura Secret Vacation",
        cover: getJavCover("mide-850"),
        genre: getGenres(),
        duration: "120 min",
        synopsis: generateSynopsis("Sakura Miura", "MIDE-850"),
        streamLinks: generateStreamLinks("mide-850"),
        downloadLinks: generateDownloadLinks("mide-850"),
    },
    {
        type: "jav",
        id: "stars-200",
        title: "STARS-200 - Makoto Toda Office Romance",
        cover: getJavCover("stars-200"),
        genre: getGenres(),
        duration: "140 min",
        synopsis: generateSynopsis("Makoto Toda", "STARS-200"),
        streamLinks: generateStreamLinks("stars-200"),
        downloadLinks: generateDownloadLinks("stars-200"),
    },
    {
        type: "jav",
        id: "cawd-200",
        title: "CAWD-200 - Moko Sakura Sweet Love Story",
        cover: getJavCover("cawd-200"),
        genre: getGenres(),
        duration: "130 min",
        synopsis: generateSynopsis("Moko Sakura", "CAWD-200"),
        streamLinks: generateStreamLinks("cawd-200"),
        downloadLinks: generateDownloadLinks("cawd-200"),
    },
    {
        type: "jav",
        id: "pred-300",
        title: "PRED-300 - Aika Yamagishi Mature Passion",
        cover: getJavCover("pred-300"),
        genre: getGenres(),
        duration: "145 min",
        synopsis: generateSynopsis("Aika Yamagishi", "PRED-300"),
        streamLinks: generateStreamLinks("pred-300"),
        downloadLinks: generateDownloadLinks("pred-300"),
    },
    {
        type: "jav",
        id: "ssni-900",
        title: "SSNI-900 - Tsukasa Aoi Ultimate Beauty",
        cover: getJavCover("ssni-900"),
        genre: getGenres(),
        duration: "125 min",
        synopsis: generateSynopsis("Tsukasa Aoi", "SSNI-900"),
        streamLinks: generateStreamLinks("ssni-900"),
        downloadLinks: generateDownloadLinks("ssni-900"),
    },
    {
        type: "jav",
        id: "jul-500",
        title: "JUL-500 - Kana Mito Mature Seduction",
        cover: getJavCover("jul-500"),
        genre: getGenres(),
        duration: "120 min",
        synopsis: generateSynopsis("Kana Mito", "JUL-500"),
        streamLinks: generateStreamLinks("jul-500"),
        downloadLinks: generateDownloadLinks("jul-500"),
    },
    {
        type: "jav",
        id: "meyd-700",
        title: "MEYD-700 - Tsubasa Hachino Hot Night",
        cover: getJavCover("meyd-700"),
        genre: getGenres(),
        duration: "130 min",
        synopsis: generateSynopsis("Tsubasa Hachino", "MEYD-700"),
        streamLinks: generateStreamLinks("meyd-700"),
        downloadLinks: generateDownloadLinks("meyd-700"),
    },

    {
        type: "jav",
        id: "fsdss-200",
        title: "FSDSS-200 - Arina Hashimoto Slender Body",
        cover: getJavCover("fsdss-200"),
        genre: getGenres(),
        duration: "135 min",
        synopsis: generateSynopsis("Arina Hashimoto", "FSDSS-200"),
        streamLinks: generateStreamLinks("fsdss-200"),
        downloadLinks: generateDownloadLinks("fsdss-200"),
    },
    {
        type: "jav",
        id: "ebod-800",
        title: "EBOD-800 - Eimi Fukada Big Tits Paradise",
        cover: getJavCover("ebod-800"),
        genre: getGenres(),
        duration: "140 min",
        synopsis: generateSynopsis("Eimi Fukada", "EBOD-800"),
        streamLinks: generateStreamLinks("ebod-800"),
        downloadLinks: generateDownloadLinks("ebod-800"),
    },
    {
        type: "jav",
        id: "pppd-900",
        title: "PPPD-900 - Hitomi Tanaka Legendary Performance",
        cover: getJavCover("pppd-900"),
        genre: getGenres(),
        duration: "150 min",
        synopsis: generateSynopsis("Hitomi Tanaka", "PPPD-900"),
        streamLinks: generateStreamLinks("pppd-900"),
        downloadLinks: generateDownloadLinks("pppd-900"),
    },
    {
        type: "jav",
        id: "jufe-300",
        title: "JUFE-300 - Ichika Matsumoto Petite Beauty",
        cover: getJavCover("jufe-300"),
        genre: getGenres(),
        duration: "125 min",
        synopsis: generateSynopsis("Ichika Matsumoto", "JUFE-300"),
        streamLinks: generateStreamLinks("jufe-300"),
        downloadLinks: generateDownloadLinks("jufe-300"),
    },
    {
        type: "jav",
        id: "msfh-050",
        title: "MSFH-050 - Miko Mizusawa Elegant Lady",
        cover: getJavCover("msfh-050"),
        genre: getGenres(),
        duration: "130 min",
        synopsis: generateSynopsis("Miko Mizusawa", "MSFH-050"),
        streamLinks: generateStreamLinks("msfh-050"),
        downloadLinks: generateDownloadLinks("msfh-050"),
    },
    {
        type: "jav",
        id: "ssis-250",
        title: "SSIS-250 - Yura Kano Beautiful Journey",
        cover: getJavCover("ssis-250"),
        genre: getGenres(),
        duration: "135 min",
        synopsis: generateSynopsis("Yura Kano", "SSIS-250"),
        streamLinks: generateStreamLinks("ssis-250"),
        downloadLinks: generateDownloadLinks("ssis-250"),
    },
    {
        type: "jav",
        id: "ipx-700",
        title: "IPX-700 - Kana Momonogi Exclusive Fantasy",
        cover: getJavCover("ipx-700"),
        genre: getGenres(),
        duration: "140 min",
        synopsis: generateSynopsis("Kana Momonogi", "IPX-700"),
        streamLinks: generateStreamLinks("ipx-700"),
        downloadLinks: generateDownloadLinks("ipx-700"),
    },
    {
        type: "jav",
        id: "abw-150",
        title: "ABW-150 - Asuna Kawai Cute Adventure",
        cover: getJavCover("abw-150"),
        genre: getGenres(),
        duration: "120 min",
        synopsis: generateSynopsis("Asuna Kawai", "ABW-150"),
        streamLinks: generateStreamLinks("abw-150"),
        downloadLinks: generateDownloadLinks("abw-150"),
    },
    {
        type: "jav",
        id: "stars-350",
        title: "STARS-350 - Yume Takeda Sensual Experience",
        cover: getJavCover("stars-350"),
        genre: getGenres(),
        duration: "130 min",
        synopsis: generateSynopsis("Yume Takeda", "STARS-350"),
        streamLinks: generateStreamLinks("stars-350"),
        downloadLinks: generateDownloadLinks("stars-350"),
    },
    {
        type: "jav",
        id: "cawd-300",
        title: "CAWD-300 - Mayuki Ito Innocent Charm",
        cover: getJavCover("cawd-300"),
        genre: getGenres(),
        duration: "125 min",
        synopsis: generateSynopsis("Mayuki Ito", "CAWD-300"),
        streamLinks: generateStreamLinks("cawd-300"),
        downloadLinks: generateDownloadLinks("cawd-300"),
    },
    {
        type: "jav",
        id: "mide-950",
        title: "MIDE-950 - Nana Yagi Private Session",
        cover: getJavCover("mide-950"),
        genre: getGenres(),
        duration: "135 min",
        synopsis: generateSynopsis("Nana Yagi", "MIDE-950"),
        streamLinks: generateStreamLinks("mide-950"),
        downloadLinks: generateDownloadLinks("mide-950"),
    },
    {
        type: "jav",
        id: "ssni-999",
        title: "SSNI-999 - Riri Nanatsumori Final Performance",
        cover: getJavCover("ssni-999"),
        genre: getGenres(),
        duration: "140 min",
        synopsis: generateSynopsis("Riri Nanatsumori", "SSNI-999"),
        streamLinks: generateStreamLinks("ssni-999"),
        downloadLinks: generateDownloadLinks("ssni-999"),
    },
    {
        type: "jav",
        id: "pred-400",
        title: "PRED-400 - Karen Yuzuriha Special Service",
        cover: getJavCover("pred-400"),
        genre: getGenres(),
        duration: "130 min",
        synopsis: generateSynopsis("Karen Yuzuriha", "PRED-400"),
        streamLinks: generateStreamLinks("pred-400"),
        downloadLinks: generateDownloadLinks("pred-400"),
    },
    {
        type: "jav",
        id: "fsdss-300",
        title: "FSDSS-300 - Natsu Igarashi Summer Passion",
        cover: getJavCover("fsdss-300"),
        genre: getGenres(),
        duration: "125 min",
        synopsis: generateSynopsis("Natsu Igarashi", "FSDSS-300"),
        streamLinks: generateStreamLinks("fsdss-300"),
        downloadLinks: generateDownloadLinks("fsdss-300"),
    },
    {
        type: "jav",
        id: "jufe-400",
        title: "JUFE-400 - Mina Kitano Voluptuous Desire",
        cover: getJavCover("jufe-400"),
        genre: getGenres(),
        duration: "145 min",
        synopsis: generateSynopsis("Mina Kitano", "JUFE-400"),
        streamLinks: generateStreamLinks("jufe-400"),
        downloadLinks: generateDownloadLinks("jufe-400"),
    },
    {
        type: "jav",
        id: "ssis-300",
        title: "SSIS-300 - Miharu Usa Secret Fantasy",
        cover: getJavCover("ssis-300"),
        genre: getGenres(),
        duration: "130 min",
        synopsis: generateSynopsis("Miharu Usa", "SSIS-300"),
        streamLinks: generateStreamLinks("ssis-300"),
        downloadLinks: generateDownloadLinks("ssis-300"),
    },
    {
        type: "jav",
        id: "ipx-800",
        title: "IPX-800 - Minami Aizawa Premium Edition",
        cover: getJavCover("ipx-800"),
        genre: getGenres(),
        duration: "135 min",
        synopsis: generateSynopsis("Minami Aizawa", "IPX-800"),
        streamLinks: generateStreamLinks("ipx-800"),
        downloadLinks: generateDownloadLinks("ipx-800"),
    },
    {
        type: "jav",
        id: "stars-400",
        title: "STARS-400 - Mana Sakura Veteran's Touch",
        cover: getJavCover("stars-400"),
        genre: getGenres(),
        duration: "140 min",
        synopsis: generateSynopsis("Mana Sakura", "STARS-400"),
        streamLinks: generateStreamLinks("stars-400"),
        downloadLinks: generateDownloadLinks("stars-400"),
    },
];

export function getMockNekoBoccList(
    page: number = 1,
    limit: number = 10
): PaginatedResponse<NekoBoccHentai> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockNekoBoccData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(mockNekoBoccData.length / limit);

    return {
        data: paginatedData,
        page,
        totalPages,
        totalItems: mockNekoBoccData.length,
    };
}

export function getMockNekoBoccDetail(id: string): NekoBoccHentai | null {
    const item = mockNekoBoccData.find((item) => item.id === id);
    return item || null;
}
