import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    List,
    ArrowLeft,
    RotateCcw,
    LayoutGrid,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function MangaRead() {
    const { chapterSlug } = useParams<{ chapterSlug: string }>();
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    // Extract manga slug from chapter slug (usually manga-slug-chapter-X)
    // Sanka Komikindo slug pattern: chapter slug usually contains manga slug
    // But better to get it from API if possible. For now, let's assume we need to find it.
    // Actually, we can fetch images first.
    
    const {
        data: images,
        isLoading: loadingImages,
        error: imageError,
    } = useQuery({
        queryKey: ["chapterImages", chapterSlug, language],
        queryFn: () => {
            if (!chapterSlug) return null;
            return movieAPI.getChapterImages(chapterSlug);
        },
        enabled: !!chapterSlug,
    });

    // We need manga detail to handle navigation between chapters
    // In Bacaman, chapter slug is usually: [manga-slug]-chapter-[number]-[suffix]
    // Example: one-piece-chapter-516-bahasa-indonesia -> one-piece-bahasa-indonesia
    const guessedMangaSlug = useMemo(() => {
        if (!chapterSlug) return "";
        return chapterSlug.replace(/-chapter-\d+/, "");
    }, [chapterSlug]);

    const { data: manga } = useQuery({
        queryKey: ["mangaDetail", guessedMangaSlug, language],
        queryFn: () => movieAPI.getMangaDetail(guessedMangaSlug),
        enabled: !!guessedMangaSlug,
    });

    const { currentChapter, nextChapter, prevChapter } = useMemo(() => {
        if (!manga || !chapterSlug) return { currentChapter: null, nextChapter: null, prevChapter: null };
        
        const chapters = manga.chapters;
        // Normalize slugs by removing trailing slashes for comparison
        const normalizedChapterSlug = chapterSlug.replace(/\/$/, "");
        const currentIndex = chapters.findIndex(c => c.slug.replace(/\/$/, "") === normalizedChapterSlug);
        
        console.log("📍 Navigation Check:", {
            totalChapters: chapters.length,
            currentIndex,
            chapterSlug,
            guessedMangaSlug,
            normalizedChapterSlug
        });

        if (currentIndex === -1) {
             console.warn("⚠️ Chapter index not found in list!");
             return { currentChapter: null, nextChapter: null, prevChapter: null };
        }

        return {
            currentChapter: chapters[currentIndex],
            // Ascending order: Ch 1 is index 0, Ch 2 is index 1
            nextChapter: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
            prevChapter: currentIndex > 0 ? chapters[currentIndex - 1] : null,
        };
    }, [manga, chapterSlug, guessedMangaSlug]);

    // Handle scroll to top on chapter change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [chapterSlug]);

    if (loadingImages) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">{t('loading')}...</p>
            </div>
        );
    }

    if (imageError || !images || images.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <LayoutGrid className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <h2 className="text-xl font-bold mb-2">{t('error')}</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Gagal memuat gambar chapter. Ganti provider atau coba lagi nanti.
                </p>
                <div className="flex gap-3">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" /> {t('retry')}
                    </Button>
                    <Button asChild>
                        <Link to={`/manga/${guessedMangaSlug}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> {t('back')}
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20">
            {/* Reader Header */}
            <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl">
                <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">

                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base font-bold truncate">
                                {manga?.title || "Reading Manga"}
                            </h1>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate italic">
                                {currentChapter?.title || chapterSlug}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {manga && (
                             <Select 
                                value={chapterSlug} 
                                onValueChange={(val) => navigate(`/manga/read/${val}`)}
                             >
                                <SelectTrigger className="w-[120px] sm:w-[180px] h-9 bg-secondary/50 border-white/10 text-xs sm:text-sm">
                                    <SelectValue placeholder="Jump to..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {manga.chapters.map((ch) => (
                                        <SelectItem key={ch.slug} value={ch.slug}>
                                            {ch.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* Images Container */}
            <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-0.5 sm:space-y-1">
                {images.map((img) => (
                    <div key={img.index} className="relative w-full overflow-hidden bg-zinc-900 group">
                        <img
                            src={img.url}
                            alt={`Page ${img.index + 1}`}
                            className="w-full h-auto block select-none"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                // Try to reload image once or show placeholder
                                const target = e.target as HTMLImageElement;
                                if (!target.dataset.retry) {
                                    target.dataset.retry = "1";
                                    setTimeout(() => {
                                        target.src = img.url + "?retry=" + Date.now();
                                    }, 2000);
                                } else {
                                    target.src = "/placeholder.svg";
                                }
                            }}
                        />
                        {/* Page number indicator */}
                        <div className="absolute bottom-2 right-4 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.index + 1} / {images.length}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Footer */}
            {(prevChapter || nextChapter) && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
                    <div className="container mx-auto max-w-xl flex items-center justify-between gap-4 bg-background/90 backdrop-blur shadow-2xl border border-white/10 p-3 rounded-2xl pointer-events-auto">
                        {prevChapter ? (
                            <Button
                                variant="ghost"
                                asChild
                                className="flex-1 gap-2 h-11"
                            >
                                <Link to={`/manga/read/${prevChapter.slug}`}>
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">{t('prevChapter')}</span>
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex-1" /> // Spacer if no prev
                        )}

                        <div className="w-px h-6 bg-border mx-2" />

                        {nextChapter ? (
                            <Button
                                variant="default"
                                asChild
                                className="flex-1 gap-2 h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                            >
                                <Link to={`/manga/read/${nextChapter.slug}`}>
                                    <span className="hidden sm:inline">{t('nextChapter')}</span>
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex-1" /> // Spacer if no next
                        )}
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="container mx-auto px-4 py-8 text-center">
                {/* <p className="text-xs text-muted-foreground opacity-50">
                    {t('mangaSourceDisclaimer')}
                </p> */}
            </div>
        </div>
    );
}
