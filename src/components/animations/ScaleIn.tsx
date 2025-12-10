
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ScaleInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    fullWidth?: boolean;
    scale?: number;
}

export function ScaleIn({
    children,
    className,
    delay = 0,
    duration = 0.4,
    fullWidth = false,
    scale = 0.9,
}: ScaleInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Custom smooth easing
            }}
            className={cn(fullWidth ? "w-full" : "", className)}
        >
            {children}
        </motion.div>
    );
}
