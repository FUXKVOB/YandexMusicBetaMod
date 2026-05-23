import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";

const sentryDsn = import.meta.env.VITE_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    sendDefaultPii: false,
    integrations: [Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] })],
    enableLogs: false,
    tracesSampleRate: 0,
    sampleRate: 0,
    beforeSend: (event) => {
      if (!window.__yandexMusicModAnalyticsEnabled) return null;
      return event;
    },
  });
}

Sentry.metrics.count("app_loaded", 1);

const queryClient = new QueryClient();

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.createElement("div");
  sidebar.id = "yandex-music-mod-sidebar";
  document.body.appendChild(sidebar);

  createRoot(sidebar, {}).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
});
