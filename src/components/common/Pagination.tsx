import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        pages.push(1);

        if (currentPage > 3) {
            pages.push("...");
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 flex-wrap px-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 sm:h-10 sm:w-10"
            >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>

            {getPageNumbers().map((page, idx) =>
                typeof page === "number" ? (
                    <Button
                        key={idx}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => onPageChange(page)}
                        className="min-w-8 h-8 sm:min-w-10 sm:h-10 text-xs sm:text-sm px-2 sm:px-3"
                    >
                        {page}
                    </Button>
                ) : (
                    <span
                        key={idx}
                        className="px-1 sm:px-2 text-muted-foreground text-xs sm:text-sm"
                    >
                        {page}
                    </span>
                )
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 sm:h-10 sm:w-10"
            >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
        </div>
    );
}
