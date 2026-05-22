# Deployment Guide

## CI/CD

GitHub Actions workflow is located at:

`.github/workflows/ci.yml`

The workflow performs:

- dependency installation
- shared workspace build
- frontend/backend typechecking
- frontend/backend tests
- coverage checks
- production builds

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
