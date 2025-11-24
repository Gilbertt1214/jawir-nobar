import { Film } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background/30 mt-auto">
            <div className="container mx-auto px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                    {/* Left Side - Brand */}
                    <div className="flex items-center gap-2">
                        <Film className="h-3 w-3 text-primary" />
                        <span>jawiracademy &copy; {currentYear}</span>
                    </div>

    

                    {/* Right Side - Legal */}
                    <div className="flex items-center gap-3">
                        <a
                            href="#"
                            className="hover:text-primary transition-colors"
                        >
                            Terms
                        </a>
                        <span>•</span>
                        <span>v1.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
