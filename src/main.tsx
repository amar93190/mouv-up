import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/index.css";

const enablePwaDev = import.meta.env.DEV && import.meta.env.VITE_ENABLE_PWA_DEV === "true";

if (import.meta.env.DEV && "serviceWorker" in navigator && !enablePwaDev) {
  // Default dev mode: avoid stale caches. To test installability in dev, set VITE_ENABLE_PWA_DEV=true.
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister();
    });
  });
}

if (import.meta.env.PROD || enablePwaDev) {
  registerSW({ immediate: true });
}

const appElement = import.meta.env.DEV ? (
  <App />
) : (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  appElement
);
