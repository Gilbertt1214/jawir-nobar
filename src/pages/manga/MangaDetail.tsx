import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertCircle,
    BookOpen,
    Star,
    Calendar,
    User,
    ChevronRight,
    ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FadeIn } from "@/components/animations/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MangaDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { t, language } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        data: manga,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["mangaDetail", slug, language],
        queryFn: () => {
            if (!slug) return null;
            return movieAPI.getMangaDetail(slug);
        },
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="relative h-[30vh] sm:h-[40vh] w-full bg-muted animate-pulse" />
                <div className="container mx-auto px-4 -mt-24 sm:-mt-32 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-6">
                        <div className="aspect-[3/4] w-full max-w-[250px] mx-auto md:mx-0 rounded-xl bg-muted animate-pulse shadow-lg" />
                        <div className="space-y-4 pt-4 md:pt-8">
                            <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-1/2 bg-muted animate-pulse rounded" />
                            <div className="h-32 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !manga) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {t("failedToLoadContent")}
                    </AlertDescription>
                </Alert>
                <Button asChild variant="outline">
                    <Link to="/manga">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t("back")}
                    </Link>
                </Button>
            </div>
        );
    }

    const toggleSynopsis = () => setIsExpanded(!isExpanded);
    const synopsis = manga.synopsis || t('noSynopsisAvailable');
    const shouldShowToggle = synopsis.length > 300;
    const displaySynopsis = isExpanded || !shouldShowToggle 
        ? synopsis 
        : synopsis.slice(0, 300) + "...";

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Backdrop Bloom Effect */}
            <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] -mt-[72px] sm:-mt-24 lg:-mt-28 overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div 
                    className="absolute inset-0 opacity-30 blur-3xl scale-110" 
                    style={{
                        backgroundImage: `url(${manga.cover})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-hero" />
            </div>

            <div className="container mx-auto px-4 relative z-10 -mt-32 sm:-mt-48 md:-mt-56 lg:-mt-64">
                {/* Breadcrumb */}
                <div className="mb-4 pt-2">
                    <Breadcrumb />
                </div>
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    {/* Poster Sidebar */}
                    <div className="w-full md:w-[250px] lg:w-[300px] flex-shrink-0">
                        <FadeIn delay={0.2} direction="up">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 mx-auto md:mx-0 group max-w-[280px] sm:max-w-none">
                                <img
                                    src={manga.cover}
                                    alt={manga.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        e.currentTarget.src = "/placeholder.svg";
                                    }}
                                />
                                {manga.status && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-primary hover:bg-primary/90 text-white border-none px-3 py-1 shadow-lg backdrop-blur-md">
                                            {manga.status}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.3} direction="up" className="mt-6 space-y-4">
                            <div className="flex flex-col gap-3 p-4 rounded-xl bg-card/60 backdrop-blur-md border border-white/5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        Rating
                                    </span>
                                    <span className="font-bold text-foreground">{manga.rating || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                        {t('typeManga')}
                                    </span>
                                    <span className="font-bold text-foreground uppercase">{manga.type || "Manga"}</span>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-8">
                        <FadeIn delay={0.3} direction="up" className="space-y-4 text-center md:text-left">
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
                                    {manga.title}
                                </h1>
                                {manga.alternativeTitle && (
                                    <p className="text-muted-foreground text-base sm:text-lg italic">
                                        {manga.alternativeTitle}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                                {manga.author && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border/50 text-muted-foreground">
                                        <User className="w-4 h-4" />
                                        <span>{manga.author}</span>
                                    </div>
                                )}
                                {manga.artist && manga.artist !== manga.author && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border/50 text-muted-foreground">
                                        <User className="w-4 h-4" />
                                        <span>{manga.artist}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {manga.genres.map((genre) => (
                                    <Badge 
                                        key={genre} 
                                        variant="secondary" 
                                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                                    >
                                        {genre}
                                    </Badge>
                                ))}
                            </div>
                        </FadeIn>

                        {/* Synopsis */}
                        <FadeIn delay={0.4} direction="up" className="space-y-3">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary rounded-full" />
                                {t('synopsis')}
                            </h2>
                            <div className="p-4 sm:p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                                <p className="whitespace-pre-line">
                                    {displaySynopsis}
                                </p>
                                {shouldShowToggle && (
                                    <button 
                                        onClick={toggleSynopsis}
                                        className="mt-3 text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1 text-sm outline-none"
                                    >
                                        {isExpanded ? t('showLess') : t('readMore')}
                                    </button>
                                )}
                            </div>
                        </FadeIn>

                        {/* Chapters Section */}
                        <FadeIn delay={0.5} direction="up" className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                    {t('chapter')} List
                                </h2>
                                <Badge variant="outline" className="text-muted-foreground">
                                    {manga.chapters.length} {t('chapters')}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 transition-colors">
                                {manga.chapters.map((chapter) => (
                                    <Link 
                                        key={chapter.slug} 
                                        to={`/manga/read/${chapter.slug}`}
                                        className="group p-4 rounded-xl border border-border bg-card/40 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                                                    {chapter.title}
                                                </h3>
                                                {chapter.releaseDate && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{chapter.releaseDate}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2 rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    );
}
