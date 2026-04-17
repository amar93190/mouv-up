import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const enablePwaDev = env.VITE_ENABLE_PWA_DEV === "true";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
        devOptions: {
          enabled: enablePwaDev
        },
        manifest: {
          name: "Solimouv’",
          short_name: "Solimouv",
          description:
            "L'application officielle du festival Solimouv' organisé par Up Sport! pour promouvoir un sport inclusif et accessible.",
          theme_color: "#f1f1f4",
          background_color: "#f1f1f4",
          display: "standalone",
          start_url: "/",
          scope: "/",
          lang: "fr",
          categories: ["sports", "events", "social"],
          icons: [
            {
              src: "icons/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "icons/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "icons/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        }
      })
    ]
  };
});
