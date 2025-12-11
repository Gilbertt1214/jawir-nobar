import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateGenre, translateCountry } from "@/lib/translate";
import { getCountryName } from "@/lib/countries";

interface BreadcrumbItem {
    label: string;
    path: string;
    isActive: boolean;
}

// Route label translations
const ROUTE_LABELS: Record<string, { en: string; id: string }> = {
    movie: { en: "Movie", id: "Film" },
    series: { en: "Series", id: "Series" },
    anime: { en: "Anime", id: "Anime" },
    hentai: { en: "Hentai", id: "Hentai" },
    genres: { en: "Genres", id: "Genre" },
    genre: { en: "Genre", id: "Genre" },
    countries: { en: "Countries", id: "Negara" },
    country: { en: "Country", id: "Negara" },
    years: { en: "Years", id: "Tahun" },
    year: { en: "Year", id: "Tahun" },
    search: { en: "Search", id: "Pencarian" },
    browse: { en: "Browse", id: "Jelajahi" },
    watch: { en: "Watch", id: "Tonton" },
    episodes: { en: "Episodes", id: "Episode" },
    nekopoi: { en: "Detail", id: "Detail" },
};

// Category translations for browse
const CATEGORY_LABELS: Record<string, { en: string; id: string }> = {
    "latest-movies": { en: "Latest Movies", id: "Film Terbaru" },
    "popular-movies": { en: "Popular Movies", id: "Film Populer" },
    "latest-series": { en: "Latest Series", id: "Series Terbaru" },
    "indonesian-movies": { en: "Indonesian Movies", id: "Film Indonesia" },
    "korean-drama": { en: "Korean Drama", id: "Drama Korea" },
    romance: { en: "Romance", id: "Romantis" },
};

export function Breadcrumb() {
    const location = useLocation();
    const params = useParams();
    const { language } = useLanguage();

    // Don't show breadcrumb on home page
    if (location.pathname === "/") {
        return null;
    }

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always add Home
    breadcrumbs.push({
        label: language === "id" ? "Beranda" : "Home",
        path: "/",
        isActive: false,
    });

    // Build breadcrumb items from path segments
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;

        // Get label for this segment
        let label = getSegmentLabel(
            segment,
            index,
            pathSegments,
            params,
            language
        );

        breadcrumbs.push({
            label,
            path: currentPath,
            isActive: isLast,
        });
    });

    return (
        <nav
            aria-label="Breadcrumb"
            className="container mx-auto px-4 py-3 sm:py-4"
        >
            <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5 text-xs sm:text-sm">
                {breadcrumbs.map((item, index) => (
                    <li key={item.path} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mx-1 sm:mx-1.5 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        {item.isActive ? (
                            <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-[200px]">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.path}
                                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[100px] sm:max-w-[150px]"
                            >
                                {index === 0 && (
                                    <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                )}
                                <span className="hidden sm:inline">
                                    {item.label}
                                </span>
                                {index === 0 && (
                                    <span className="sm:hidden">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

function getSegmentLabel(
    segment: string,
    index: number,
    allSegments: string[],
    params: Record<string, string | undefined>,
    language: string
): string {
    // Check if it's a known route
    const routeLabel = ROUTE_LABELS[segment.toLowerCase()];
    if (routeLabel) {
        return language === "id" ? routeLabel.id : routeLabel.en;
    }

    // Check if it's a category in browse
    const categoryLabel = CATEGORY_LABELS[segment.toLowerCase()];
    if (categoryLabel) {
        return language === "id" ? categoryLabel.id : categoryLabel.en;
    }

    // Handle dynamic segments based on parent route
    const parentSegment = index > 0 ? allSegments[index - 1].toLowerCase() : "";

    // Genre name
    if (parentSegment === "genre") {
        const genreName = decodeURIComponent(segment).replace(/-/g, " ");
        return translateGenre(capitalizeWords(genreName), language);
    }

    // Country name
    if (parentSegment === "country") {
        const countryCode = decodeURIComponent(segment);
        const countryName = getCountryName(countryCode);
        return translateCountry(countryName, language);
    }

    // Year
    if (parentSegment === "year") {
        return segment;
    }

    // For movie/series/anime/hentai detail pages - show "Detail"
    if (
        parentSegment === "movie" ||
        parentSegment === "series" ||
        parentSegment === "anime" ||
        parentSegment === "hentai"
    ) {
        // If it's a slug/id, show "Detail"
        if (
            segment !== "watch" &&
            segment !== "episodes" &&
            segment !== "nekopoi"
        ) {
            return language === "id" ? "Detail" : "Detail";
        }
    }

    // For watch pages
    if (segment === "watch" || parentSegment === "watch") {
        return language === "id" ? "Tonton" : "Watch";
    }

    // Default: capitalize and clean up
    return capitalizeWords(decodeURIComponent(segment).replace(/-/g, " "));
}

function capitalizeWords(str: string): string {
    return str
        .split(" ")
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
}
