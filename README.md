# Sonix

A curated audio visualizer web app. Sign in, connect an audio source, watch
reactive 3D visuals, browse the visual library, and save your favorites. Create
your own visuals or generate them with AI.

## 🛠 Tech Stack

This is a TypeScript monorepo with three npm workspaces: `frontend`, `backend`,
and `shared`.

| Workspace  | Stack                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| `frontend` | React 19, Vite, Tailwind CSS, React Router, TanStack Query, three.js (visuals) |
| `backend`  | Node.js, Express 5, MongoDB (Mongoose), JWT auth                               |
| `shared`   | TypeScript types and constants shared by both apps                             |

Tooling: TypeScript, ESLint, Prettier, Vitest (unit), Playwright (e2e),
Husky + lint-staged (pre-commit), deployed on Render.

## 📁 Project Structure

```text
l-group-practicum-team6/
├── frontend/   # React + Vite client
├── backend/    # Express + MongoDB API
├── shared/     # Types and constants shared by both apps
├── e2e/        # Playwright end-to-end tests
├── docs/       # Project and contributor guides
└── README.md
```

## ⚙️ Setup

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- npm
- A MongoDB connection string (local or Atlas)

### Install

This is a workspace monorepo — always run `npm install` from the **repo root**,
not from inside a workspace folder.

```bash
git clone <repo-url>
cd l-group-practicum-team6
npm install
```

### Environment Variables

Backend (`backend/.env`):

| Variable     | Description                    |
| ------------ | ------------------------------ |
| `PORT`       | Backend port (default `5001`)  |
| `MONGO_URI`  | MongoDB connection string      |
| `JWT_SECRET` | Secret used to sign JWT tokens |

Frontend (`frontend/.env`):

| Variable               | Description                   |
| ---------------------- | ----------------------------- |
| `VITE_API_BASE_URL`    | Backend URL the browser calls |
| `VITE_PUBLIC_APP_NAME` | App name shown in the UI      |

Never commit `.env` files. For full setup details and troubleshooting, see
[SETUP.md](SETUP.md).

### Run

```bash
npm run dev      # backend + frontend together
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## 🧪 Scripts

Run from the repo root:

```bash
npm run dev          # backend + frontend in parallel
npm run build        # build all workspaces
npm test             # unit tests (backend + frontend)
npm run test:e2e     # Playwright end-to-end tests
npm run lint         # ESLint across all workspaces
npm run typecheck    # TypeScript check across all workspaces
npm run format       # Prettier write
```

## 🔐 API Overview

All routes are prefixed with `/api/v1`.

```text
GET    /api/v1/health
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/users/current
GET    /api/v1/visualizers
GET    /api/v1/images
```

## 🤝 Contributing

This is a student team project. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
workflow and [docs/GIT_GUIDE.md](docs/GIT_GUIDE.md) for branch, commit, and PR
naming. Pull requests and code review are required before merging to `dev`.

## 📄 License

For educational purposes only.
