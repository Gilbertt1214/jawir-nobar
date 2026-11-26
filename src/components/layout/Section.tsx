import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { SketchButton } from "@/components/ui/SketchButton";
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
                    <Link to={link} className="flex items-center gap-2">
                        <SketchButton variant="secondary">
                            <span className="flex items-center gap-2">
                                <span className="text-sm font-medium">{t('viewAll')}</span>
                                <ChevronRight className="w-4 h-4" />
                            </span>
                        </SketchButton>
                    </Link>
                </div>
                <MovieCarousel title="" movies={movies} />
            </section>
        </FadeIn>
    );
}

