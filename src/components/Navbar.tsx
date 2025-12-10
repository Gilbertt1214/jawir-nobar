import { Link } from "react-router-dom";
import {
    Moon,
    Sun,
    Search,
    Menu,
    Globe,
    Calendar,
    Tag,
    Tv,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
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

export function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

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
        }
    };

    const handleMenuItemClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-500 ease-in-out",
                isScrolled
                    ? "bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl py-2"
                    : "bg-transparent border-transparent py-4"
            )}
        >
            <nav className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 gap-4">
                <Link
                    to="/"
                    className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-2xl flex-shrink-0 group"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src="/jawir-logo.png"
                            alt="Jawir | Kingdom of Wysteria"
                            className="relative h-8 w-8 sm:h-10 sm:w-10 transition-transform group-hover:scale-110 duration-300"
                        />
                    </div>
                    <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 group-hover:to-primary transition-all duration-300">
                        JawirNobar
                    </span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-[200px] xs:max-w-xs sm:max-w-md mx-auto transition-all duration-300">
                    <form
                        onSubmit={handleSearch}
                        className="relative flex-1 group"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative pr-10 h-10 sm:h-11 text-base sm:text-sm bg-secondary/50 border-white/10 rounded-full focus:bg-background/80 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/70 sm:placeholder:content-['Search_movies,_series,_anime...']"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link to="/anime">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm px-4 rounded-full hover:bg-white/10 hover:text-primary transition-all duration-300"
                            >
                                Anime
                            </Button>
                        </Link>
                        <Link to="/genres">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm px-4 rounded-full hover:bg-white/10 hover:text-primary transition-all duration-300"
                            >
                                Genres
                            </Button>
                        </Link>
                        <Link to="/countries">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm px-4 rounded-full hover:bg-white/10 hover:text-primary transition-all duration-300"
                            >
                                Countries
                            </Button>
                        </Link>
                        <Link to="/years">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm px-4 rounded-full hover:bg-white/10 hover:text-primary transition-all duration-300"
                            >
                                Years
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden h-10 w-10 rounded-full hover:bg-white/10"
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[280px] sm:w-[320px] border-l border-white/10 bg-background/95 backdrop-blur-xl"
                        >
                            <SheetHeader>
                                <SheetTitle className="text-left text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                    Menu
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2 mt-8">
                                <Link to="/anime" onClick={handleMenuItemClick}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 h-12 text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Tv className="h-5 w-5" />
                                        Anime
                                    </Button>
                                </Link>
                                <Link
                                    to="/genres"
                                    onClick={handleMenuItemClick}
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 h-12 text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Tag className="h-5 w-5" />
                                        Genres
                                    </Button>
                                </Link>
                                <Link
                                    to="/countries"
                                    onClick={handleMenuItemClick}
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 h-12 text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Globe className="h-5 w-5" />
                                        Countries
                                    </Button>
                                </Link>
                                <Link to="/years" onClick={handleMenuItemClick}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 h-12 text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        <Calendar className="h-5 w-5" />
                                        Years
                                    </Button>
                                </Link>
                                <div className="border-t border-white/10 pt-4 mt-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 h-12 text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                        onClick={() => {
                                            toggleTheme();
                                            handleMenuItemClick();
                                        }}
                                    >
                                        {theme === "light" ? (
                                            <>
                                                <Moon className="h-5 w-5" />
                                                Dark Mode
                                            </>
                                        ) : (
                                            <>
                                                <Sun className="h-5 w-5" />
                                                Light Mode
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Theme Toggle (Desktop) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="hidden md:flex h-10 w-10 rounded-full hover:bg-white/10 hover:text-primary transition-all"
                    >
                        {theme === "light" ? (
                            <Moon className="h-5 w-5" />
                        ) : (
                            <Sun className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </nav>
        </header>
    );
}
