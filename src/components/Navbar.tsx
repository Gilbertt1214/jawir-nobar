import { Link } from "react-router-dom";
import {
    Film,
    Moon,
    Sun,
    Search,
    Menu,
    Globe,
    Calendar,
    Tag,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

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
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 gap-2">
                <Link
                    to="/"
                    className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-xl flex-shrink-0"
                >
                    <img
                        src="/jawir-logo.png"
                        alt="Jawir | Kingdom of Wysteria"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                    />
                    <span className="hidden sm:inline">
                        Nobar bersama jawir
                    </span>
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-xs sm:max-w-md">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-9 h-9 text-sm"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            className="absolute right-0 top-0 h-9 w-9"
                        >
                            <Search className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Desktop Menu */}
                    <Link to="/genres" className="hidden md:block">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm px-3"
                        >
                            Genres
                        </Button>
                    </Link>
                    <Link to="/countries" className="hidden md:block">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm px-3"
                        >
                            Countries
                        </Button>
                    </Link>
                    <Link to="/years" className="hidden md:block">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm px-3"
                        >
                            Years
                        </Button>
                    </Link>

                    {/* Mobile Menu */}
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden h-9 w-9"
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[280px] sm:w-[320px]"
                        >
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 mt-6">
                                <Link
                                    to="/genres"
                                    onClick={handleMenuItemClick}
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-12 text-base"
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
                                        className="w-full justify-start gap-3 h-12 text-base"
                                    >
                                        <Globe className="h-5 w-5" />
                                        Countries
                                    </Button>
                                </Link>
                                <Link to="/years" onClick={handleMenuItemClick}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-12 text-base"
                                    >
                                        <Calendar className="h-5 w-5" />
                                        Years
                                    </Button>
                                </Link>
                                <div className="border-t pt-4 mt-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-12 text-base"
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
                        className="hidden md:flex h-9 w-9"
                    >
                        {theme === "light" ? (
                            <Moon className="h-4 w-4" />
                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </nav>
        </header>
    );
}
