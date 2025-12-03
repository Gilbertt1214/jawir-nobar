import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AOS from "aos";
import "aos/dist/aos.css";

// Initialize AOS with advanced settings (inspired by Antigravity.id)
AOS.init({
    duration: 600,           // Slightly longer for smoother feel
    easing: "ease-out-cubic", // Smooth deceleration
    once: true,              // Animate only once
    offset: 100,             // Trigger earlier for seamless experience
    delay: 0,
    mirror: false,           // Don't animate on scroll up
    anchorPlacement: "top-bottom", // Start when element top hits viewport bottom
});

createRoot(document.getElementById("root")!).render(<App />);
