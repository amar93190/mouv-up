import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/index.css";

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  // Prevent stale cached builds from breaking local development data fetches.
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister();
    });
  });
}

if (import.meta.env.PROD) {
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
