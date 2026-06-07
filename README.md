# Kairos

A fullstack web application built as a trainee assignment. Features a landing page with a live video background, Google OAuth2 sign-in, and real-time cryptocurrency prices streamed via WebSocket.

Live: https://kairos-delta-nine.vercel.app

---

## Tech Stack

**Frontend**
- TypeScript (no frameworks)
- CSS (no libraries)
- Vite 8

**Backend**
- Go 1.23
- chi v5 (router)
- rs/cors (CORS middleware)

**External APIs**
- Google Identity Services — OAuth2 sign-in
- Google tokeninfo — server-side token verification
- Binance WebSocket — real-time crypto prices

---

## Project Structure

```
kairos/
├── backend/
│   ├── handlers/
│   │   └── auth.go          # Google sign-in endpoint
│   ├── middleware/
│   │   └── cors.go          # CORS configuration
│   ├── main.go              # HTTP server entry point
│   ├── go.mod
│   └── .env.example         # Backend environment variables template
├── frontend/
│   ├── assets/
│   │   ├── icons/           # SVG icons and logo
│   │   ├── images/          # Hero background image (WebP)
│   │   └── videos/          # Hero background video (mp4, webm)
│   ├── public/
│   │   ├── fonts/           # Self-hosted Bruno Ace font (woff2)
│   │   └── robots.txt
│   ├── src/
│   │   ├── a11y.ts          # Focus trap utility
│   │   ├── auth.ts          # Google OAuth2 flow
│   │   ├── crypto.ts        # Binance WebSocket + price rendering
│   │   ├── header.ts        # Header scroll behavior
│   │   ├── hero.ts          # Hero section interactions
│   │   ├── main.ts          # Entry point
│   │   ├── nav.ts           # Mobile navigation
│   │   ├── popups.ts        # Dialog/popup management
│   │   ├── style.css        # All styles
│   │   └── vite-env.d.ts    # Vite environment type declarations
│   ├── index.html
│   └── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Go 1.23+
- A Google Cloud project with OAuth2 credentials

### 1. Clone the repository

```bash
git clone https://github.com/avanyushkin/kairos.git
cd kairos
git checkout dev
```

### 2. Configure environment variables

**Backend** — create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
PORT=8080
```

**Frontend** — create `frontend/.env` from the example:

```bash
cp frontend/.env.example frontend/.env
```

The default value points to the local backend and works without changes:

```env
VITE_BACKEND_URL=http://localhost:8080
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Start the backend

```bash
cd backend
source .env   # Linux/macOS
# or on Windows PowerShell:
# $env:GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"; $env:PORT="8080"
go run .
```

The backend starts on `http://localhost:8080`.

### 5. Start the frontend dev server

In a separate terminal from the project root:

```bash
npm run dev
```

The frontend starts on `http://localhost:5174`.

Open `http://localhost:5174` in your browser.

---

## Building for Production

```bash
npm run build
```

Output is placed in `dist/`. To preview the production build locally:

```bash
npm run preview
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check — returns `{"ok": true}` |
| POST | `/api/auth/google` | Verify Google ID token, return user info |

### POST /api/auth/google

Request body:
```json
{ "token": "<Google ID token>" }
```

Success response `200`:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

Error responses: `400` (missing token), `401` (invalid token or audience mismatch), `502` (Google unreachable).

---

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a project
2. Enable the **Google Identity** API
3. Create an **OAuth 2.0 Client ID** (Web application type)
4. Add your domains to **Authorized JavaScript origins**:
   ```
   http://localhost:5174
   https://your-production-domain.com
   ```
5. Copy the Client ID and set it as `GOOGLE_CLIENT_ID` in `backend/.env`

---

## Deployment

The frontend is deployed to [Vercel](https://vercel.com) and the backend to [Render](https://render.com).

### Backend (Render)

1. Create a new **Web Service** and connect the GitHub repository
2. Configure the service:

   | Field | Value |
   |-------|-------|
   | Branch | `dev` |
   | Root Directory | `backend` |
   | Build Command | `go build -o kairos-server .` |
   | Start Command | `./kairos-server` |

3. Set environment variables in the **Environment** tab:

   | Key | Value |
   |-----|-------|
   | `GOOGLE_CLIENT_ID` | your OAuth2 client ID |
   | `ALLOWED_ORIGIN` | your Vercel frontend URL |

### Frontend (Vercel)

1. Import the GitHub repository in Vercel
2. Configure the project:

   | Field | Value |
   |-------|-------|
   | Branch | `dev` |
   | Framework Preset | Other |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. Set environment variables:

   | Key | Value |
   |-----|-------|
   | `VITE_BACKEND_URL` | your Render backend URL |

4. Add the Vercel domain to **Authorized JavaScript origins** in Google Cloud Console

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | OAuth2 Client ID from Google Cloud Console |
| `PORT` | No | HTTP server port (default: `8080`) |
| `ALLOWED_ORIGIN` | No | Additional CORS origin for production |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | No | Backend API URL (default: `http://localhost:8080`) |
