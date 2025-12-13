import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

interface ParallaxWrapperProps {
    children: ReactNode;
    speed?: number; 
    className?: string;
}

export function ParallaxWrapper({ 
    children, 
    speed = 0.5, 
    className = "" 
}: ParallaxWrapperProps) {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 1000 * (1 - speed)]);

    return (
        <motion.div style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}
