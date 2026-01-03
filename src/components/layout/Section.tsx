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
    className?: string;
}

export function Section({
    title,
    icon,
    movies,
    link,
    children,
    delay = 0,
    className, // Destructure className
}: SectionProps) {
    const { t } = useLanguage();
    
    return (
        <FadeIn delay={delay} direction="up" className="space-y-6 w-full">
            <section className={`space-y-6 border-t border-border/50 pt-12 first:border-0 first:pt-0 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            {title}
                        </h2>
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

