# Deployment Guide

## CI/CD

GitHub Actions workflow is located at:

`.github/workflows/ci.yml`

The workflow runs on pull requests and pushes to `dev` and `main`.

The workflow performs:

- dependency installation with `npm ci --include=optional`
- shared workspace build with `npm run format:check`
- linting with `npm run lint`
- typechecking with `npm run typecheck`
- test execution with `npm run test`
- coverage reporting with `npm run coverage`
- production builds with `npm run build`

Coverage reports are generated, but coverage thresholds are not currently enforced.

---

## Frontend Deployment

Platform: `Render Static Site`

### Build Command

`npm run build -w frontend`

### Publish Directory

`frontend/dist`

### Environment Variables

`VITE_API_URL=<backend-api-url>`

---

## Backend Deployment

Platform: `Render Web Service`

### Build Command

`npm run build`

### Start Command

`npm start`

### Required Environment Variables

```env
PORT=5001
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
NODE_ENV=production
```

---

## Local Development

### Run both services

`npm run dev`

### Run frontend only

`npm run dev -w frontend`

### Run backend only

`npm run dev -w backend`
