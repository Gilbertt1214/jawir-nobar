import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCarousel } from "@/components/features/movie/MovieCarousel";
import { FadeIn } from "@/components/animations/FadeIn";
import { Movie } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectionProps {
    title: string;
    icon?: React.ReactNode;
    movies: Movie[];
    link: string;
    children?: React.ReactNode;
    delay?: number;
}

export function Section({
    title,
    icon,
    movies,
    link,
    children,
    delay = 0,
}: SectionProps) {
    const { t } = useLanguage();
    
    return (
        <FadeIn delay={delay} direction="up" className="space-y-6">
            <section className="space-y-6 content-visibility-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="h-8 w-1.5 bg-primary rounded-full group-hover:h-10 transition-all duration-300" />
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {title}
                        </h2>
                        {icon && (
                            <div className="text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                {icon}
                            </div>
                        )}
                    </div>
                    {children}
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="self-start sm:self-auto hover:bg-secondary hover:text-primary transition-all group/btn"
                    >
                        <Link to={link} className="flex items-center gap-2">
                            <span className="text-sm font-medium">{t('viewAll')}</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                    </Button>
                </div>
                <MovieCarousel title="" movies={movies} />
            </section>
        </FadeIn>
    );
}

