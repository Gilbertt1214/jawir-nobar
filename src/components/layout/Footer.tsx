import { Film } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background/30 mt-auto">
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    {/* Left Side - Brand */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Film className="h-3 w-3 text-primary" />
                        <span>{t('copyright')?.replace('{year}', String(currentYear))}</span>
                    </div>

                    {/* Right Side - Legal */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <a
                            href="#"
                            className="hover:text-primary transition-colors"
                        >
                            {t('terms')}
                        </a>
                        <span>•</span>
                        <span>{t('version')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
