import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Production security: Disable console methods and DevTools
if (import.meta.env.PROD) {
    // Disable console methods
    const noop = () => {};
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    console.warn = noop;
    // Keep console.error for critical issues
    
    // Disable DevTools keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });

    // Detect DevTools open (optional deterrent)
    const detectDevTools = () => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            // DevTools might be open - you can add custom behavior here
            // For now, just log to error (which we kept enabled)
        }
    };
    
    window.addEventListener('resize', detectDevTools);
}

createRoot(document.getElementById("root")!).render(<App />);
