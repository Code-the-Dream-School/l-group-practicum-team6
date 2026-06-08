# Setup Guide

Get Sonix running locally for the first time. For a project overview, see
[README.md](README.md).

## Prerequisites

- Git
- Node.js 24 (see `.nvmrc`) and npm
- A MongoDB connection string (local or Atlas)

## 1. Clone and Install

This is a workspace monorepo (`frontend`, `backend`, `shared`). Always run
`npm install` from the **repo root**, not from inside a workspace folder.

```bash
git clone <repo-url>
cd l-group-practicum-team6
npm install
```

## 2. Set Up Environment Variables

Copy each app's `.env.example` and fill in real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend (`backend/.env`):

| Variable     | Description                    |
| ------------ | ------------------------------ |
| `PORT`       | Backend port (default `5001`)  |
| `MONGO_URI`  | MongoDB connection string      |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `CLIENT_URL` | Frontend URL allowed by CORS   |

Frontend (`frontend/.env`):

| Variable               | Description                   |
| ---------------------- | ----------------------------- |
| `VITE_API_BASE_URL`    | Backend URL the browser calls |
| `VITE_PUBLIC_APP_NAME` | App name shown in the UI      |

Never commit `.env` files. See each `.env.example` for the full list of
variables (including AI and test-database settings).

### Test databases

Backend tests use a separate database so they never touch your dev data:

| Variable         | Used by                |
| ---------------- | ---------------------- |
| `MONGO_URI_TEST` | unit/integration tests |
| `MONGO_URI_E2E`  | Playwright e2e tests   |

Add your GitHub username to the test database name to avoid clashing with
teammates, for example:

```text
MONGO_URI_TEST=mongodb://127.0.0.1:27017/sonix-test-<your-github-username>
```

## 3. Start the Apps

From the repo root:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## 4. Verify It Works

- Frontend loads at `http://localhost:5173`
- Backend health check responds at `http://localhost:5001/api/v1/health`
- Sign up / log in works end to end

## Common Commands

Run these from the repo root:

```bash
npm run dev        # start backend + frontend
npm run build      # build all workspaces
npm test           # unit tests
npm run test:e2e   # Playwright e2e tests
```

## Troubleshooting

- **`npm install` errors** — run it from the repo root, not a workspace folder
- **Port already in use** — change `PORT` in `backend/.env` or free the port
- **MongoDB connection failed** — check `MONGO_URI` in `backend/.env`
- **Frontend can't reach backend** — confirm `VITE_API_BASE_URL` matches the
  backend port

Still stuck? Copy the exact error into team chat or open a draft PR with notes.
