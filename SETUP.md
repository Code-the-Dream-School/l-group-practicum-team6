# Setup Guide

This guide helps you get Sonix running locally for the first time.

## Prerequisites

- Git
- Node.js v18+ and npm
- VS Code or another editor
- A MongoDB connection string (local or Atlas)

## Project Layout

This is a monorepo with two apps:

```text
l-group-practicum-team6/
  frontend/   # React + TypeScript + Vite
  backend/    # Node.js + Express + MongoDB
```

## 1. Clone the Repo

```bash
git clone <repo-url>
cd l-group-practicum-team6
```

## 2. Install Dependencies

```bash
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

## 3. Set Up Environment Variables

Each app has its own `.env.example`. Copy and fill in real values:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

**Frontend** (`frontend/.env`):

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend URL the browser calls (e.g. `http://localhost:8080`) |
| `VITE_PUBLIC_APP_NAME` | App name shown in the UI |

**Backend** (`backend/.env`):

| Variable | Description |
| --- | --- |
| `PORT` | Backend port (default `8080`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |

Never commit `.env`.

## 4. Start the Apps

Open two terminals:

```bash
# Terminal 1 — frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

```bash
# Terminal 2 — backend
cd backend
npm run dev
# Runs on http://localhost:8080
```

## 5. Verify It Works

- Frontend loads at `http://localhost:5173`
- Backend responds at `http://localhost:8080`
- Sign up / log in flow works end-to-end

## Common Commands

```bash
npm run dev      # start in development mode
npm start        # start in production mode (backend)
npm run build    # production build (frontend)
npm test         # run tests
```

## Troubleshooting

- **`npm install` errors** — make sure you are inside the correct folder
- **Port already in use** — kill the process on that port or change `PORT` in `.env`
- **MongoDB connection failed** — check `MONGO_URI` in `.env`
- **Frontend can't reach backend** — confirm `VITE_API_BASE_URL` matches the backend port

If you are still stuck, copy the exact error and post it in team chat or open a draft PR with notes.

## Keep This File Updated

Whenever setup steps change — new env vars, new scripts, new dependencies — update this file right away.
