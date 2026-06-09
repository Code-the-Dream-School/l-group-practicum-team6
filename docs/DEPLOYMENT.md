# Deployment Guide

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`. It runs on pull requests
and pushes to `dev` and `main`.

**Test job** (runs on Node 24):

- install dependencies (`npm ci --include=optional`)
- check formatting (`npm run format:check`)
- lint (`npm run lint`)
- typecheck (`npm run typecheck`)
- test (`npm run test`)
- coverage (`npm run coverage`)
- build (`npm run build`)

**E2E job** (runs after the test job): spins up MongoDB, installs Playwright,
and runs `npm run test:e2e`. Reports are uploaded as artifacts.

Coverage is reported but thresholds are not enforced.

## Hosting

Sonix.ai deploys to Render as a **single web service** (see `render.yaml`). The
build compiles every workspace and the backend serves the built frontend, so
there is no separate frontend host.

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| Type              | Render Web Service (Node)      |
| Build command     | `npm install && npm run build` |
| Start command     | `npm start`                    |
| Health check path | `/api/v1/health`               |
| Deploy branch     | `dev` (auto-deploy on push)    |

### Environment Variables

Set these in the Render dashboard (never commit real values):

```env
NODE_ENV=production
MONGO_URI=
JWT_SECRET=
JWT_LIFETIME=1d
CLIENT_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=
GEMINI_API_KEY=
GEMINI_MODEL=
```

`render.yaml` also generates `JWT_SECRET` and pins the Node version. The
frontend reads `VITE_API_BASE_URL` at build time; in the single-service setup
it can stay empty so the browser calls the same origin.

## Local Development

```bash
npm run dev            # backend + frontend together
npm run dev -w frontend  # frontend only
npm run dev -w backend   # backend only
```
