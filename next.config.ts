import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: 'cdn.discordapp.com' },
      { hostname: 'media.discordapp.net' },
    ],
  },
  experimental: {
    // NE PAS SUPPRIMER — bug Next.js 16.1.6 sur macOS (Darwin 25+) :
    // isolatedDevBuild: true (défaut) change distDir → .next/dev, mais Turbopack
    // tente d'écrire sa DB interne avant que ce répertoire soit créé → crash immédiat.
    // Symptôme : "Persisting failed: Unable to write SST file 00000001.sst"
    isolatedDevBuild: false,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "",
  project: process.env.SENTRY_PROJECT ?? "",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: false },
  disableLogger: true,
  automaticVercelMonitors: true,
});
