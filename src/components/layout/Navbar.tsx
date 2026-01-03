import { Link } from "react-router-dom";
import {
    Search,
    Menu,
    Globe,
    Calendar,
    Tag,
    Tv,
    Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'id' : 'en';
        setLanguage(newLang);
        toast.success(newLang === 'en' ? 'Language: English' : 'Bahasa: Indonesia');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isSearchOpen) setIsSearchOpen(false);
                if (isMenuOpen) setIsMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchOpen, isMenuOpen]);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 0);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setIsSearchOpen(false);
        }
    };

    const handleMenuItemClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-md py-2"
                    : "bg-transparent border-transparent py-2"
            )}
        >
            <nav className="container mx-auto flex h-14 sm:h-16 lg:h-20 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4 relative">
                {/* Logo - Hidden when search is open on mobile */}
                <Link
                    to="/"
                    className={cn(
                        "flex items-center gap-2 font-bold text-base sm:text-lg lg:text-2xl flex-shrink-0 group transition-all duration-300",
                        isSearchOpen ? "hidden sm:flex" : "flex"
                    )}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src="/jawir-logo.png"
                            alt="Jawir | Kingdom of Wysteria"
                            className="relative h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 transition-transform group-hover:scale-110 duration-300"
                        />
                    </div>
                    <span className={cn(
                        "hidden xs:inline sm:inline bg-clip-text text-transparent bg-gradient-to-r transition-all duration-300",
                        isScrolled 
                            ? "from-foreground to-foreground/80 group-hover:to-primary" 
                            : "from-hero-foreground to-hero-foreground/80 group-hover:to-primary"
                    )}>
                        JawirNobar
                    </span>
                </Link>

                {/* Search Bar - Responsive */}
                <div className={cn(
                    "flex-1 flex justify-end lg:justify-center transition-all duration-300",
                    isMenuOpen ? "hidden" : "flex",
                    isSearchOpen ? "w-full absolute left-0 right-0 px-2 sm:static sm:w-auto z-50" : ""
                )}>
                    <form
                        onSubmit={handleSearch}
                        className={cn(
                            "relative transition-all duration-300 flex items-center bg-transparent",
                            isSearchOpen 
                                ? "w-full sm:w-[300px] lg:w-[400px]" 
                                : "w-auto sm:w-[300px] lg:w-[400px]"
                        )}
                    >
                         {/* Enhanced Backdrop Blur for Mobile Search Overlay */}
                        <div className={cn(
                            "absolute inset-0 bg-primary/20 blur-md rounded-full transition-opacity duration-300",
                            isSearchOpen || searchQuery ? "opacity-100" : "opacity-0"
                        )} />
                        
                        <div className={cn(
                            "relative flex items-center w-full transition-all duration-300 overflow-hidden",
                            isSearchOpen 
                                ? "bg-background/95 backdrop-blur-md border border-primary/20 shadow-lg rounded-full sm:bg-secondary sm:shadow-none sm:border-none" 
                                : "bg-transparent sm:bg-secondary sm:rounded-full"
                        )}>
                            <Input
                                type="search"
                                placeholder={t('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchOpen(true)}
                                onBlur={() => {
                                    if (!searchQuery) {
                                        setIsSearchOpen(false);
                                    }
                                }}
                                className={cn(
                                    "transition-all duration-300 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground",
                                    "h-10 sm:h-10 lg:h-11",
                                    isSearchOpen 
                                        ? "w-full pl-4 pr-10 opacity-100" 
                                        : "w-0 sm:w-full pl-0 sm:pl-4 opacity-0 sm:opacity-100 p-0 sm:p-2"
                                )}
                            />
                            
                            {/* Mobile Search Toggle / Submit Button */}
                             <Button
                                type={isSearchOpen ? "submit" : "button"}
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                    if (!isSearchOpen) {
                                        e.preventDefault();
                                        setIsSearchOpen(true);
                                        // Wait for state update then focus input
                                        setTimeout(() => {
                                            const input = e.currentTarget.parentElement?.querySelector('input');
                                            input?.focus();
                                        }, 10);
                                    } 
                                    // If open and has query, let it submit
                                    // If open and empty, maybe close? (handled by blur mostly)
                                }}
                                className={cn(
                                    "rounded-full hover:bg-primary/20 hover:text-primary transition-colors z-10",
                                    "h-10 w-10 sm:h-10 sm:w-10 lg:h-11 lg:w-11",
                                    isSearchOpen 
                                        ? "absolute right-0" 
                                        : "relative sm:absolute sm:right-0 bg-secondary/50 sm:bg-transparent"
                                )}
                                aria-label={t('search')}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Desktop Menu - Hidden on mobile/tablet */}
                    <div className="hidden lg:flex items-center gap-1">
                        <Link to="/anime">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "text-sm px-3 xl:px-4 rounded-full transition-all duration-300",
                                    isScrolled ? "text-foreground/80 hover:bg-secondary hover:text-primary" : "text-white/90 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {t('anime')}
                            </Button>
                        </Link>
                        <Link to="/genres">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "text-sm px-3 xl:px-4 rounded-full transition-all duration-300",
                                    isScrolled ? "text-foreground/80 hover:bg-secondary hover:text-primary" : "text-hero-foreground/90 hover:bg-white/10 hover:text-hero-foreground"
                                )}
                            >
                                {t('genres')}
                            </Button>
                        </Link>
                        <Link to="/countries">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "text-sm px-3 xl:px-4 rounded-full transition-all duration-300",
                                    isScrolled ? "text-foreground/80 hover:bg-secondary hover:text-primary" : "text-white/90 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {t('countries')}
                            </Button>
                        </Link>
                        <Link to="/years">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "text-sm px-3 xl:px-4 rounded-full transition-all duration-300",
                                    isScrolled ? "text-foreground/80 hover:bg-secondary hover:text-primary" : "text-white/90 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {t('years')}
                            </Button>
                        </Link>
                        
                        {/* Language Toggle - Desktop */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleLanguage}
                            className={cn(
                                "h-9 w-9 rounded-full transition-all",
                                isScrolled ? "text-foreground/80 hover:bg-secondary hover:text-primary" : "text-hero-foreground/90 hover:bg-white/10 hover:text-hero-foreground"
                            )}
                            title={language === 'en' ? t('switchToIndonesian') : t('switchToEnglish')}
                        >
                            <Globe className="h-4 w-4" />
                            <span className="sr-only">{t('toggleLanguage')}</span>
                        </Button>
                    </div>

                    {/* Theme Toggle - Desktop only */}
                    <div className="hidden lg:flex">
                        <ModeToggle className={cn(
                            isScrolled ? "text-foreground/80 hover:bg-secondary hover:text-primary" : "text-hero-foreground/90 hover:bg-white/10 hover:text-hero-foreground"
                        )} />
                    </div>

                    {/* Mobile/Tablet Menu */}
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "lg:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-secondary",
                                    !isScrolled && "text-hero-foreground hover:bg-white/10"
                                )}
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[80vw] sm:w-[350px] border-l border-border bg-background/95 backdrop-blur-xl"
                        >
                            <SheetHeader>
                                <SheetTitle className="text-left text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                    {t('menuTitle')}
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-1 sm:gap-2 mt-6 sm:mt-8">
                                <Link to="/anime" onClick={handleMenuItemClick}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 sm:gap-4 h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Tv className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {t('anime')}
                                    </Button>
                                </Link>
                                <Link to="/genres" onClick={handleMenuItemClick}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 sm:gap-4 h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {t('genres')}
                                    </Button>
                                </Link>
                                <Link to="/countries" onClick={handleMenuItemClick}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 sm:gap-4 h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {t('countries')}
                                    </Button>
                                </Link>
                                <Link to="/years" onClick={handleMenuItemClick}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 sm:gap-4 h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {t('years')}
                                    </Button>
                                </Link>
                                
                                {/* Divider */}
                                <div className="border-t border-border/50 my-2 sm:my-3" />

                                {/* Language Toggle - Mobile */}
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        toggleLanguage();
                                        handleMenuItemClick();
                                    }}
                                    className="w-full justify-start gap-3 sm:gap-4 h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                                    {language === 'en' ? t('languageEn') : t('languageId')}
                                </Button>

                                {/* Theme Toggle - Mobile */}
                                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-muted/50 rounded-xl transition-colors">
                                    <span className="text-sm font-medium">{t('changeTheme')}</span>
                                    <ModeToggle />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}

