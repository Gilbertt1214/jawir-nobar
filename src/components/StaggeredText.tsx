import { motion } from "framer-motion";

interface StaggeredTextProps {
    text: string;
    className?: string;
    delay?: number; // Delay before animation starts
    staggerDelay?: number; // Delay between each word
}

export function StaggeredText({ 
    text, 
    className = "", 
    delay = 0,
    staggerDelay = 0.05 
}: StaggeredTextProps) {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { 
                staggerChildren: staggerDelay, 
                delayChildren: delay 
            },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
        },
    };

    return (
        <motion.div
            className={className}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    variants={child}
                    style={{ display: "inline-block", marginRight: "0.25em" }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
