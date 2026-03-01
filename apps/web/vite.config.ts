import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { execSync } from "child_process";
import packageJson from "../../package.json";

// Extract Git hash and build time to create a unique ascending version string
let commitHash = "";
try {
  commitHash = execSync("git rev-parse --short HEAD").toString().trim();
} catch (e) {
  // Fallback if git is not available
}

const buildTime = new Date().toISOString().replace(/T/, " ").slice(0, 16);
const baseVersion = (packageJson as any).version || "1.0.0";
const appVersion = `${baseVersion} (${commitHash ? commitHash + " - " : ""}${buildTime})`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "pwa-icon.svg"],
      manifest: {
        name: "HomeBoard",
        short_name: "HomeBoard",
        description: "Household Dashboard",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/events": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
