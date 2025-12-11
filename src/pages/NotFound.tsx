import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground space-y-4">
            <h1 className="text-6xl font-bold">{t('error404')}</h1>
            <p className="text-xl text-muted-foreground">{t('pageNotFound')}</p>
            <Button asChild>
                <Link to="/">{t('returnHome')}</Link>
            </Button>
        </div>
    );
}
