import React, { useState, useEffect } from "react";
import { SketchProgress } from "@/components/ui/SketchProgress";

export const InitialLoader: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [fading, setFading] = useState(false);

    const handleComplete = () => {
        if (fading) return;
        setFading(true);
        setTimeout(() => {
            setVisible(false);
        }, 500); // 500ms fade transition
    };

    useEffect(() => {
        // Safety timeout so user is never stuck
        const timer = setTimeout(() => {
            handleComplete();
        }, 2900);

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div
            onClick={handleComplete}
            title="Klik untuk melewati loading"
            className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-background/98 backdrop-blur-2xl transition-opacity duration-500 cursor-pointer select-none ${
                fading ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
            <div className="w-full max-w-[320px] px-4 flex flex-col items-center text-center">
                <div className="relative mb-3">
                    <img
                        src="/jawir-logo.png"
                        alt="JawirNobar"
                        className="w-20 h-20 animate-bounce duration-1000 drop-shadow-[0_10px_25px_rgba(56,189,248,0.4)]"
                    />
                </div>
                <h1 className="text-3xl font-black tracking-wide text-foreground mb-1">
                    JawirNobar
                </h1>
                <p className="text-xs uppercase tracking-widest text-primary font-bold mb-4">
                    Kingdom of Wysteria
                </p>

                <div className="w-full flex justify-center scale-95 sm:scale-100 origin-top">
                    <SketchProgress
                        demo
                        label="Memuat JawirNobar..."
                        doneLabel="Siap Ditonton ✓"
                        onDone={handleComplete}
                    />
                </div>

                <p className="text-[11px] text-muted-foreground mt-4 italic">
                    Tap di mana saja untuk lewati
                </p>
            </div>
        </div>
    );
};
