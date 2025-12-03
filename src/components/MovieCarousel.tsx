import { Movie } from "@/services/api";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MovieCarouselProps {
    title: string;
    movies: Movie[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener("scroll", checkScroll);
            window.addEventListener("resize", checkScroll);
            return () => {
                scrollElement.removeEventListener("scroll", checkScroll);
                window.removeEventListener("resize", checkScroll);
            };
        }
    }, [movies]);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const cardWidth =
                scrollRef.current.querySelector("div")?.offsetWidth || 160;
            const gap = 16;
            const scrollAmount = (cardWidth + gap) * 4;

            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <section
            className="space-y-4 relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {title && (
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <div className="relative">
                {/* Floating Navigation Buttons - Desktop Only */}
                {canScrollLeft && (
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => scroll("left")}
                        className={cn(
                            "hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-xl bg-background/95 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm transition-all duration-300",
                            isHovered
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                        )}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                )}

                {canScrollRight && (
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => scroll("right")}
                        className={cn(
                            "hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-xl bg-background/95 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm transition-all duration-300",
                            isHovered
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                        )}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                )}

                {/* Gradient Overlays - Desktop Only */}
                {canScrollLeft && (
                    <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
                )}
                {canScrollRight && (
                    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />
                )}

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 px-1"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {movies.map((movie, index) => (
                        <div
                            key={movie.id}
                            className="flex-none w-36 sm:w-40 md:w-44 lg:w-48"
                        >
                            <MovieCard movie={movie} index={index} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
