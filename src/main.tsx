import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// DEBUG: Global Error Handler to show errors on the white screen
window.onerror = function (msg, url, lineNo, columnNo, error) {
    const errorMsg = `Error: ${msg}\nURL: ${url}\nLine: ${lineNo}`;
    document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace; white-space: pre-wrap; font-size: 16px; background: #fff;">
      <h1>Application Crashed</h1>
      <pre>${errorMsg}</pre>
      <pre>${error?.stack || ''}</pre>
    </div>`;
    return false;
};

console.log("Main entry point executing...");

try {
    const root = document.getElementById("root");
    if (!root) throw new Error("Root element not found");
    
    createRoot(root).render(<App />);
    console.log("React render initiated");
} catch (e) {
    console.error("Render failed:", e);
    if (e instanceof Error) {
        document.body.innerHTML += `<div style="color: red; padding: 20px;">Render Error: ${e.message}</div>`;
    }
}
