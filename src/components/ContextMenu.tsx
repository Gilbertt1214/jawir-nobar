import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { RefreshCw, Moon, Sun, Share2, Home } from "lucide-react";
import { toast } from "sonner";

interface MenuPosition {
    x: number;
    y: number;
}

export function ContextMenu() {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleContextMenu = useCallback((e: MouseEvent) => {
        e.preventDefault();

        // Calculate position to keep menu within viewport
        const menuWidth = 200;
        const menuHeight = 200;

        let x = e.clientX;
        let y = e.clientY;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        setPosition({ x, y });
        setIsVisible(true);
    }, []);

    const handleClick = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("click", handleClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleContextMenu, handleClick, handleKeyDown]);

    const handleRefresh = () => {
        window.location.reload();
        setIsVisible(false);
    };

    const handleToggleTheme = () => {
        toggleTheme();
        setIsVisible(false);
        toast.success(
            `Tema diubah ke ${theme === "dark" ? "Light" : "Dark"} mode`
        );
    };

    const handleShareLink = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: url,
                });
            } catch (err) {
                // User cancelled or error
                await navigator.clipboard.writeText(url);
                toast.success("Link berhasil disalin!");
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link berhasil disalin!");
        }
        setIsVisible(false);
    };

    const handleHome = () => {
        navigate("/");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed z-[9999] min-w-[180px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-900 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{
                left: position.x,
                top: position.y,
            }}
        >
            <div className="py-2">
                {/* Refresh */}
                <button
                    onClick={handleRefresh}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <RefreshCw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="font-medium text-gray-900 dark:text-white">
                        Refresh
                    </span>
                </button>

                {/* Ganti Tema */}
                <button
                    onClick={handleToggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                        Ganti Tema
                    </span>
                </button>

                {/* Share Link */}
                <button
                    onClick={handleShareLink}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="font-medium text-gray-900 dark:text-white">
                        Share Link
                    </span>
                </button>

                {/* Home */}
                <button
                    onClick={handleHome}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="font-medium text-gray-900 dark:text-white">
                        Home
                    </span>
                </button>
            </div>
        </div>
    );
}
