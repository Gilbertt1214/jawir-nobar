
import { motion, useInView, Variant } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    fullWidth?: boolean;
    once?: boolean;
}

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction = "up",
    fullWidth = false,
    once = true,
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: "-10% 0px" });

    const getInitial = (): Variant => {
        switch (direction) {
            case "up":
                return { opacity: 0, y: 40 };
            case "down":
                return { opacity: 0, y: -40 };
            case "left":
                return { opacity: 0, x: 40 };
            case "right":
                return { opacity: 0, x: -40 };
            case "none":
            default:
                return { opacity: 0 };
        }
    };

    const getAnimate = (): Variant => {
        switch (direction) {
            case "up":
                return { opacity: 1, y: 0 };
            case "down":
                return { opacity: 1, y: 0 };
            case "left":
                return { opacity: 1, x: 0 };
            case "right":
                return { opacity: 1, x: 0 };
            case "none":
            default:
                return { opacity: 1 };
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={getInitial() as any}
            animate={isInView ? (getAnimate() as any) : (getInitial() as any)}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Custom smooth cubic-bezier
                type: "spring",
                stiffness: 100,
                damping: 20,
            }}
            className={cn(fullWidth ? "w-full" : "", className)}
        >
            {children}
        </motion.div>
    );
}
