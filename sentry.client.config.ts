import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Traces de performance (10% en production)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay (1% en production pour limiter les coûts)
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  debug: process.env.NODE_ENV === "development",

  integrations: [
    Sentry.replayIntegration(),
  ],
});
