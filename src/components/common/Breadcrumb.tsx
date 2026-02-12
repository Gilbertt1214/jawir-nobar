import { TranslationKey } from "@/lib/translations";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateGenre, translateCountry } from "@/lib/translate";
import { getCountryName } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    path: string;
    isActive: boolean;
}



// Category translations for browse
const CATEGORY_LABELS: Record<string, TranslationKey> = {
    "latest-movies": "latestMovies",
    "popular-movies": "popularMovies",
    "latest-series": "latestSeries",
    "indonesian-movies": "indonesianMovies",
    "korean-drama": "koreanDrama",
    romance: "romance",
};

export function Breadcrumb({ className }: { className?: string }) {
    const location = useLocation();
    const { t, language } = useLanguage();
    const [pathSegments, setPathSegments] = useState<string[]>([]);
    const [, setTick] = useState(0);

    useEffect(() => {
        const segments = location.pathname.split("/").filter((p) => p !== "");
        setPathSegments(segments);
    }, [location]);

    // Force re-render when metadata mapping updates (e.g. from AnimeWatch)
    useEffect(() => {
        const handleUpdate = () => setTick((t) => t + 1);
        window.addEventListener("breadcrumb-update", handleUpdate);
        return () =>
            window.removeEventListener("breadcrumb-update", handleUpdate);
    }, []);

    // Don't show breadcrumb on home page
    if (location.pathname === "/") {
        return null;
    }

    const breadcrumbs: BreadcrumbItem[] = [];

    // Always add Home
    breadcrumbs.push({
        label: t("breadcrumbHome"),
        path: "/",
        isActive: false,
    });

    // Routes that don't have a list page (should not be clickable)
    const nonClickableRoutes = ["movie", "series", "watch"];

    // Routes that have their own list page
    const routeRedirects: Record<string, string> = {
        anime: "/anime",
        hentai: "/hentai",
        manga: "/manga",
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
            label = t("breadcrumbPencarian");
        } else if (fromPath.includes("/anime")) {
            label = t("anime");
        } else if (fromPath.includes("/genres")) {
            label = t("genres");
        } else if (fromPath.includes("/countries")) {
            label = t("countries");
        } else if (fromPath.includes("/years")) {
            label = t("years");
        } else if (fromPath.includes("/manga")) {
            label = t("manga");
        } else {
            // Fallback: use the first segment
            const segment = fromPath.split("/")[1];
            label = t(segment as TranslationKey) || capitalizeWords(segment);
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
                t,
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
            const segmentLower = segment.toLowerCase();
            const isLast = index === pathSegments.length - 1;

            // Handle intermediate "consumable" segments (watch, read, episodes)
            // Replace them with a "Detail" link pointing back to the info page
            if (
                (segmentLower === "watch" ||
                    segmentLower === "read" ||
                    segmentLower === "episodes" ||
                    segmentLower === "nekopoi") &&
                !isLast
            ) {
                const nextSegment = pathSegments[index + 1];
                let detailPath = "";

                // Determine the correct path to the detail/info page
                // based on known URL structures
                const parentRoute =
                    index > 0 ? pathSegments[index - 1].toLowerCase() : "";

                if (segmentLower === "read" && parentRoute === "manga") {
                    // Manga structure: /manga/read/:chapterSlug -> Info: /manga/:slug
                    const mangaSlug = nextSegment.split("-chapter-")[0];
                    detailPath = `/manga/${mangaSlug}`;
                } else if (
                    segmentLower === "watch" &&
                    parentRoute === "anime"
                ) {
                    // Anime structure: /anime/watch/:episodeSlug -> Info: /anime/:animeSlug
                    // Use session storage mapping if available
                    const mappingKey = `parent_slug_${nextSegment}`;
                    const mappedSlug = sessionStorage.getItem(mappingKey);
                    
                    if (mappedSlug) {
                        detailPath = `/anime/${mappedSlug}`;
                    } else {
                        // Fallback to regex (less reliable but better than nothing)
                        const animeSlug = nextSegment
                            .replace(/-episode-\d+.*$/i, "")
                            .replace(/-eps-\d+.*$/i, "");
                        detailPath = `/anime/${animeSlug}`;
                    }
                } else if (
                    segmentLower === "nekopoi" &&
                    parentRoute === "hentai"
                ) {
                    // Hentai info structure: /hentai/nekopoi/:slug -> Info (same page)
                    detailPath = `/hentai/nekopoi/${nextSegment}`;
                } else if (
                    segmentLower === "watch" &&
                    parentRoute === "hentai"
                ) {
                    // Hentai watch structure: /hentai/watch/:slug -> Info: /hentai/nekopoi/:slug
                    // Use session storage mapping if available
                    const mappingKey = `parent_slug_${nextSegment}`;
                    const mappedSlug = sessionStorage.getItem(mappingKey);
                    
                    if (mappedSlug) {
                        detailPath = `/hentai/nekopoi/${mappedSlug}`;
                    } else {
                        // Fallback to regex (strip episode parts)
                        const hentaiSlug = nextSegment
                            .replace(/-episode-\d+.*$/i, "")
                            .replace(/-ep-\d+.*$/i, "")
                            .replace(/-eps-\d+.*$/i, "");
                        detailPath = `/hentai/nekopoi/${hentaiSlug}`;
                    }
                } else {
                    // Default fallback: strip the current segment from path
                    detailPath = currentPath.substring(
                        0,
                        currentPath.lastIndexOf("/")
                    );
                }

                breadcrumbs.push({
                    label: t("breadcrumbDetail"),
                    path: detailPath,
                    isActive: false,
                });
                return;
            }

            // Get label for this segment
            const label = getSegmentLabel(
                segment,
                index,
                pathSegments,
                t,
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

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("w-full z-30", className)}
        >
            <div className="container mx-auto">
                <ol className="flex items-center flex-nowrap overflow-hidden text-xs sm:text-sm text-muted-foreground">
                    {breadcrumbs.map((item, index) => (
                        <li
                            key={`${item.path}-${index}`}
                            className="flex items-center whitespace-nowrap flex-shrink-0 last:flex-shrink"
                        >
                            {index > 0 && (
                                <ChevronRight className="h-3.5 w-3.5 mx-1 sm:mx-2 text-muted-foreground/50 flex-shrink-0" />
                            )}
                            {item.isActive ? (
                                <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-2 truncate max-w-[100px] sm:max-w-[150px]"
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
    t: (key: TranslationKey) => string,
    language: string
): string {
    const lowerSegment = segment.toLowerCase();
    
    // Known static routes
    const staticRoutes: Record<string, TranslationKey> = {
        movie: "movies",
        series: "series",
        anime: "anime",
        hentai: "hentai",
        manga: "manga",
        genres: "genres",
        genre: "genres",
        countries: "countries",
        country: "countries",
        years: "years",
        year: "years",
        search: "breadcrumbPencarian",
        browse: "browseByGenre",
        watch: "watchNow",
        episodes: "episodes",
    };

    if (staticRoutes[lowerSegment]) {
        return t(staticRoutes[lowerSegment]);
    }

    // Check if it's a category in browse
    const categoryKey = CATEGORY_LABELS[lowerSegment];
    if (categoryKey) {
        return t(categoryKey);
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
        if (segment === "episodes") return t("episodes");
        return t("breadcrumbDetail");
    }

    // For manga pages
    if (parentSegment === "manga") {
        if (segment === "read") return t("readNow");
        return t("breadcrumbDetail");
    }

    // For anime/hentai pages
    if (parentSegment === "anime" || parentSegment === "hentai") {
        if (segment === "watch") return t("watchNow");
        // If it's a slug/id, show "Detail" but only if not watch/episodes
        if (segment !== "watch" && segment !== "episodes" && segment !== "nekopoi") {
            return t("breadcrumbDetail");
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
