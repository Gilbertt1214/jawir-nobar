import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RotateCw, Share, Home, Circle, Globe } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MenuPosition {
    x: number;
    y: number;
}

export function ContextMenu() {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const handleContextMenu = useCallback((e: MouseEvent) => {
        e.preventDefault();

        const menuWidth = 200;
        const menuHeight = 240;

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

    const handleClick = useCallback((e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setIsVisible(false);
        }
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

    const cycleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            toast.success(t('switchedToDark'));
        } else if (theme === 'dark') {
            setTheme('system');
            toast.success(t('switchedToSystem'));
        } else {
            setTheme('light');
            toast.success(t('switchedToLight'));
        }
        setIsVisible(false);
    };

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'id' : 'en';
        setLanguage(newLang);
        toast.success(newLang === 'en' ? 'Language: English' : 'Bahasa: Indonesia');
        setIsVisible(false);
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
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
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
            ref={menuRef}
            className={cn(
                "fixed z-[9999] min-w-[200px]",
                "bg-white dark:bg-zinc-900",
                "rounded-2xl",
                "shadow-xl shadow-black/10 dark:shadow-black/30",
                "border border-gray-100 dark:border-zinc-800",
                "p-2",
                "animate-in fade-in zoom-in-95 duration-150"
            )}
            style={{
                left: position.x,
                top: position.y,
            }}
        >
            <div className="flex flex-col">
                <MenuItem 
                    icon={<RotateCw className="w-5 h-5" strokeWidth={2} />} 
                    label={t('refresh')} 
                    onClick={handleRefresh} 
                />
                
                <MenuItem 
                    icon={<Circle className="w-5 h-5 fill-current" strokeWidth={2} />} 
                    label={t('changeTheme')} 
                    onClick={cycleTheme} 
                />

                <MenuItem 
                    icon={<Share className="w-5 h-5" strokeWidth={2} />} 
                    label={t('shareLink')} 
                    onClick={handleShareLink} 
                />

                <MenuItem 
                    icon={<Home className="w-5 h-5" strokeWidth={2} />} 
                    label={t('home')} 
                    onClick={handleHome} 
                />

                <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />

                <MenuItem 
                    icon={<Globe className="w-5 h-5" strokeWidth={2} />} 
                    label={language === 'en' ? 'English' : 'Indonesia'}
                    onClick={toggleLanguage} 
                />
            </div>
        </div>
    );
}

function MenuItem({ 
    icon, 
    label, 
    onClick, 
    className 
}: { 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl",
                "hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-150",
                "group text-left",
                className
            )}
        >
            <div className="text-gray-700 dark:text-gray-300">
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {label}
            </span>
        </button>
    );
}

