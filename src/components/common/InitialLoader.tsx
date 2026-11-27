import React, { useState, useEffect, useRef } from "react";
import { SketchProgress, SketchProgressHandle } from "@/components/ui/SketchProgress";

export const InitialLoader: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [fading, setFading] = useState(false);
    const progressRef = useRef<SketchProgressHandle>(null);

    useEffect(() => {
        // Drive progress smoothly from 0% all the way to 100%
        const startTimer = setTimeout(() => {
            progressRef.current?.set(1);
        }, 60);

        return () => clearTimeout(startTimer);
    }, []);

    const handleDone = () => {
        // Wait 450ms for the full "ドン!" burst & Complete label animation
        setTimeout(() => {
            setFading(true);
            setTimeout(() => {
                setVisible(false);
            }, 500);
        }, 450);
    };

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[999999] flex items-center justify-center bg-background/98 backdrop-blur-2xl transition-opacity duration-500 select-none ${
                fading ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
            <div className="w-[300px] max-w-[90vw] flex flex-col items-center justify-center">
                <SketchProgress
                    ref={progressRef}
                    label="Loading..."
                    doneLabel="Complete ✓"
                    onDone={handleDone}
                />
            </div>
        </div>
    );
};

