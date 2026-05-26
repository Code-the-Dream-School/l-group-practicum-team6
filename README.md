# Sonix

Short, clear description of what this application does and who it’s for.  
(1–2 sentences max.)

**Example:**  
A full-stack web application with a React frontend and a Node/Express backend that allows users to create, manage, and track data stored in a database.

## 🚀 Live Demo

- **Frontend Live Site:** https://your-frontend-url.com
- **Frontend Repo:** /frontend
- **Backend Repo:** /backend

## 🧠 Problem Statement

What problem does this project solve?

- Who is this application for?
- What pain point does it address?
- Why does this solution matter?

Focus on the **user problem**, not the technology.

## 🎯 Features

- User authentication (register, login, logout)
- CRUD operations for core resources
- Protected routes and authorization
- Responsive UI (mobile & desktop)
- Form validation and error handling
- RESTful API integration

## 📸 Screenshots

Add screenshots or GIFs of key features here.

## 🛠 Tech Stack

### Frontend

- React
- JavaScript (ES6+)
- HTML5
- CSS3 / Tailwind / Bootstrap
- Vite or Create React App

### Backend

- Node.js
- Express.js
- REST API

### Database

- MongoDB (Mongoose) **or**
- PostgreSQL (Prisma / Knex / Sequelize)

### Tooling

- Git & GitHub
- dotenv (environment variables)
- ESLint / Prettier

## 📁 Project Structure

```text
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 24 LTS (recommended)
- npm or yarn
- MongoDB or PostgreSQL (local or cloud)

> **Monorepo install**: always run `npm install` from the **repo root**, not from inside `frontend/`, `backend/`, or `shared/`. Husky's `prepare` script and the workspace symlinks only resolve correctly at root.

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5001
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

Backend runs on:  
http://localhost:5001

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:  
http://localhost:5173

## 🧪 Available Scripts

### Root (run from repo root)

```bash
npm run dev          # backend + frontend in parallel
npm run build        # build all workspaces
npm test             # run all tests
npm run lint         # ESLint across all 3 workspaces
npm run typecheck    # tsc --noEmit across all 3 workspaces
npm run format       # Prettier write across the repo
npm run format:check # Prettier check (no write)
npm run release -- patch|minor|major
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Backend

```bash
npm run dev
npm start
npm run seed              # idempotent: safe to run multiple times
npm run seed -- --reset   # drops collections + GridFS bucket, then seeds
```

## Database Seed

Run from repo root:

```bash
npm run seed -w backend              # idempotent — re-runs produce the same state
npm run seed -w backend -- --reset   # wipes users/visualizers/userVisuals/images + GridFS, then seeds
```

Seed inserts:

- 20 visualizers from `backend/src/seed/visualizers.seed.json` (with PNG previews uploaded to GridFS, first one marked `isDemo: true`)
- 12 extra visualizers from `backend/src/seed/visualizers-extra.seed.ts` (plasma, Lissajous, waveform, starfield, nebula, tunnel, kaleidoscope, wave grid, Mandelbrot flow, ripples, spiral, prism)
- 3 users from `backend/src/seed/users.seed.json`
- 5 `UserVisual` favorites for the first regular user

### Test credentials

- Admin — `admin@sonix.dev` / `AdminPass123!`
- User — `user1@sonix.dev` / `UserPass123!`
- User — `user2@sonix.dev` / `UserPass123!`

Also documented in `backend/.env.example`.

## 🪝 Pre-commit hooks

Husky + lint-staged run on every `git commit`, scoped to **staged files only**:

1. Prettier auto-fix (re-staged)
2. ESLint auto-fix (commit blocked on remaining errors)
3. `tsc --noEmit` for each touched workspace
4. `vitest related --run` for each touched workspace

Hooks install automatically after `npm install` at the repo root.

**To bypass in emergencies** (use sparingly):

```bash
git commit --no-verify -m "msg"
```

## 🚢 Release

```bash
npm run release -- patch   # or minor, major
```

Verifies clean tree → runs full lint + tests → bumps version → updates `CHANGELOG.md` → creates and pushes tag.

## 🔐 API Overview

### Example Endpoints

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/items
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
```

## 🤝 Team & Collaboration

### Team Members

- Name — Role
- Name — Role
- Name — Role

### Workflow

- GitHub Issues for task tracking
- Feature branches for development
- Pull Requests required for all merges
- Code reviews before merging to `main`

## 🧩 Development Process

- Agile / sprint-based workflow
- Backend API built before frontend integration
- MVP defined early
- Incremental feature development

## 📌 Known Issues / Limitations

- Limited role-based access control
- No automated tests yet
- Performance optimizations pending

## 🛣 Future Improvements

- Add automated testing (Jest, Supertest)
- Improve security and validation
- Add caching and performance improvements
- Dockerize the application

## 🙌 Acknowledgments

- Mentors
- Instructors
- Open-source libraries and tools

## 📄 License

This project is for educational purposes only.
