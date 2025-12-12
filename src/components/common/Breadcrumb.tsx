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

    // Routes that don't have a list page (should not be clickable)
    const nonClickableRoutes = ["movie", "series", "watch"];

    // Routes that have their own list page
    const routeRedirects: Record<string, string> = {
        anime: "/anime",
        hentai: "/hentai",
        genres: "/genres",
        genre: "/genres",
        countries: "/countries",
        country: "/countries",
        years: "/years",
        year: "/years",
    };

    // Build breadcrumb items from path segments
    // Check if we have a "from" state to handle custom back navigation
    const fromLocation = location.state?.from;
    const fromPath = fromLocation?.pathname;
    
    // Custom history-based breadcrumb (if not from Home/Root)
    if (fromPath && fromPath !== "/") {
        const fullPath = fromLocation.search ? fromPath + fromLocation.search : fromPath;
        let label = "";
        
        // Determine label based on path
        if (fromPath.includes("/search")) {
            label = language === "id" ? "Pencarian" : "Search";
        } else if (fromPath.includes("/anime")) {
            label = language === "id" ? "Anime" : "Anime";
        } else if (fromPath.includes("/genres")) {
            label = language === "id" ? "Genre" : "Genres";
        } else if (fromPath.includes("/countries")) {
            label = language === "id" ? "Negara" : "Countries";
        } else if (fromPath.includes("/years")) {
            label = language === "id" ? "Tahun" : "Years";
        } else {
            // Fallback: use the first segment
            const segment = fromPath.split("/")[1];
            label = ROUTE_LABELS[segment]?.[language] || capitalizeWords(segment);
        }

        breadcrumbs.push({
            label: label,
            path: fullPath, // Preserve query params (search state)
            isActive: false,
        });

        // Add the current page as the last item (Leaf)
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment) {
             const label = getSegmentLabel(
                lastSegment,
                pathSegments.length - 1,
                pathSegments,
                params,
                language
            );
            breadcrumbs.push({
                label,
                path: location.pathname,
                isActive: true,
            });
        }

    } else {
        // Standard path-based breadcrumb generation
        let currentPath = "";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;
            const segmentLower = segment.toLowerCase();

            // Get label for this segment
            const label = getSegmentLabel(
                segment,
                index,
                pathSegments,
                params,
                language
            );

            // Determine the correct path for this breadcrumb
            let breadcrumbPath = currentPath;

            // Check if this route should redirect to a different page
            if (routeRedirects[segmentLower]) {
                breadcrumbPath = routeRedirects[segmentLower];
            }

            // Check if this route should not be clickable
            const isNonClickable =
                nonClickableRoutes.includes(segmentLower) && index === 0;

            breadcrumbs.push({
                label,
                path: breadcrumbPath,
                isActive: isLast || isNonClickable,
            });
        });
    }

    // Pages with backdrop that need absolute positioning overlay
    const backdropPages = ["movie", "series", "anime", "hentai"];
    const firstSegment = pathSegments[0]?.toLowerCase();
    const hasBackdrop =
        backdropPages.includes(firstSegment) && pathSegments.length >= 2;

    // Use absolute positioning for backdrop pages to overlay cleanly
    // Use relative for others to avoid overlap
    const navClassName = hasBackdrop
        ? "absolute top-20 left-0 w-full z-40 px-4 pointer-events-none" // pointer-events-none allows clicking through empty space
        : "relative w-full z-30 px-4 py-4 md:py-6";

    return (
        <nav
            aria-label="Breadcrumb"
            className={navClassName}
        >
            <div className={`container mx-auto ${hasBackdrop ? "pointer-events-auto" : ""}`}>
                <ol className="flex items-center flex-wrap gap-2 text-sm md:text-base font-medium shadow-sm">
                    {breadcrumbs.map((item, index) => (
                        <li
                            key={`${item.path}-${index}`}
                            className="flex items-center"
                        >
                            {index > 0 && (
                                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/60 flex-shrink-0 stroke-[1.5]" />
                            )}
                            {item.isActive ? (
                                <span className={`truncate max-w-[200px] md:max-w-[400px] ${hasBackdrop ? "text-white/90 drop-shadow-md" : "text-foreground"}`}>
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`transition-colors flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4 ${
                                        hasBackdrop 
                                            ? "text-white/70 hover:text-white drop-shadow-md" 
                                            : "text-muted-foreground hover:text-primary"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
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
    const lowerSegment = segment.toLowerCase();
    
    // Check if it's a known route
    const routeLabel = ROUTE_LABELS[lowerSegment];
    if (routeLabel) {
        return language === "id" ? routeLabel.id : routeLabel.en;
    }

    // Check if it's a category in browse
    const categoryLabel = CATEGORY_LABELS[lowerSegment];
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

    // For movie/series detail pages
    if (parentSegment === "movie" || parentSegment === "series") {
        if (segment === "episodes") return language === "id" ? "Episode" : "Episodes";
        return language === "id" ? "Detail" : "Detail";
    }

    // For anime/hentai pages
    if (parentSegment === "anime" || parentSegment === "hentai") {
        if (segment === "watch") return language === "id" ? "Tonton" : "Watch";
        // If it's a slug/id, show "Detail" but only if not watch/episodes
        if (segment !== "watch" && segment !== "episodes" && segment !== "nekopoi") {
            return language === "id" ? "Detail" : "Detail";
        }
    }

    // For watch pages sub-segment (the slug)
    if (parentSegment === "watch") {
        // Try to make the slug readable
        return capitalizeWords(decodeURIComponent(segment).replace(/-/g, " "));
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
