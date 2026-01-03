import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function HeroParticles() {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        // Create initial particles
        if (shouldReduceMotion) return;

        // Reduce count for mobile
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 8 : 15;
        
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1, // 1px to 5px
            duration: Math.random() * 20 + 10, // 10s to 30s
        }));
        
        setParticles(newParticles);
    }, [shouldReduceMotion]);

    if (shouldReduceMotion) return null;

    // Opacity: 20% in light mode (default), 40% in dark mode (dark:opacity-40) 
    // to avoid visual noise in light theme while consistent in dark.
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1] opacity-30 dark:opacity-50 transition-opacity duration-500">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white/20 blur-[1px]"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        y: [0, -100, 0], // Float up and back down
                        x: [0, Math.random() * 50 - 25, 0], // Horizontal drift
                        opacity: [0, 0.5, 0], // Fade in/out
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
}
