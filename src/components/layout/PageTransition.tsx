import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const pageVariants = {
    initial: { 
        opacity: 0, 
        y: 20, 
        scale: 0.98,
        filter: "blur(10px)"
    },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        filter: "blur(0px)" 
    },
    exit: { 
        opacity: 0, 
        y: -10, 
        scale: 0.99,
        filter: "blur(5px)" 
    },
};

const pageTransition = {
    type: "tween" as const,
    ease: "circOut" as const, // More dramatic ease
    duration: 0.5,
};

export const PageTransition = ({ children, className }: PageTransitionProps) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className={className}
        >
            {children}
        </motion.div>
    );
};
