import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

// Headers applied in both dev and preview
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':    'nosniff',
  'X-Frame-Options':           'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups', // 'same-origin' breaks Google OAuth popup
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'geolocation=(), microphone=(), camera=()',
};

// Strict CSP for production / preview mode (no unsafe-eval)
const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.googleusercontent.com",
  "connect-src 'self' https://oauth2.googleapis.com wss://stream.binance.com:9443 https://accounts.google.com",
  "frame-src https://accounts.google.com",
  "media-src 'self'",
].join('; ');

// Relaxed CSP for dev mode (Vite HMR needs unsafe-eval and ws://)
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.googleusercontent.com",
  "connect-src 'self' ws://localhost:* wss://localhost:* https://oauth2.googleapis.com wss://stream.binance.com:9443 https://accounts.google.com",
  "frame-src https://accounts.google.com",
  "media-src 'self'",
].join('; ');

export default defineConfig(() => ({
  root: './frontend',
  plugins: [
    checker({ typescript: { tsconfigPath: './frontend/tsconfig.json' } }),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Security-Policy': DEV_CSP,
    },
  },
  preview: {
    headers: {
      ...SECURITY_HEADERS,
      // Strict-Transport-Security only effective over HTTPS — add when deploying
      'Content-Security-Policy': PROD_CSP,
    },
  },
}));
