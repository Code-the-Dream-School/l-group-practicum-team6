# Backend Guide

This guide helps our team build a simple, organized backend with **Node.js**, **Express**, and **MongoDB/Mongoose**. It works for projects using either JavaScript or TypeScript while keeping the structure beginner-friendly.

The goal is not to build a perfect enterprise backend. The goal is to keep the backend clear, safe, predictable, and easy for the whole team to understand.

## Core Principles

- keep the structure simple
- keep the request flow predictable
- give each file one main job
- keep database code out of routes
- validate input before saving data
- return clear status codes and errors
- keep secrets in `.env`, never in Git
- prefer consistency over advanced architecture

## Recommended Project Structure

Start simple. Add more structure only when the app actually needs it.

If your project uses TypeScript, use `.ts`. If your project uses JavaScript, use `.js`.

```text
src/
  app.ts
  server.ts
  config/
    env.ts
    passport.ts
  db/
    connect.ts
  routes/
    authRoutes.ts
    booksRoutes.ts
  controllers/
    authController.ts
    booksController.ts
  services/
    authService.ts
    booksService.ts
  models/
    User.ts
    Book.ts
  middleware/
    auth.ts
    errorHandler.ts
    notFound.ts
  validators/
    authSchemas.ts
    booksSchemas.ts
  utils/
    parseValidationError.ts
tests/
  auth.test.ts
  books.test.ts
views/
public/
```

Guidelines:

- use `app.ts` to create the Express app, add middleware, and register routes
- use `server.ts` to connect to the database and start the server
- use `routes/` to define endpoints and connect them to controllers
- use `controllers/` for request and response logic
- use `services/` when business logic or database work is reused across controllers
- use `models/` for Mongoose schemas and models
- use `middleware/` for reusable request logic such as auth or error handling
- use `validators/` when request validation starts to grow
- use `utils/` for small helpers that do not fit elsewhere
- use `tests/` for backend tests if the project keeps tests in one place

Notes:

- `views/` and `public/` are mainly for server-rendered apps such as Express + EJS
- API-only backends may not need `views/` or `public/`
- very small apps may not need `services/` or `validators/` on day one
- if the project is tiny, `app.ts` and `server.ts` can live in the same file
- add folders only when they make the code easier to find, reuse, or test

Default rule:

1. Start with the simple top-level folders shown above.
2. If one folder gets crowded, add one level of subfolders inside that folder.
3. Keep nesting shallow and avoid splitting files just to look advanced.

## What Each Folder Is For

- `app.ts`: create the Express app, add middleware, and register routes
- `server.ts`: connect to the database and start the server
- `config/`: shared setup such as environment parsing or Passport config
- `db/`: database connection setup
- `routes/`: define endpoints and connect them to controller functions
- `controllers/`: handle request and response logic
- `services/`: reusable business logic or grouped database operations
- `models/`: Mongoose schemas and models
- `middleware/`: auth, validation, error handling, and other reusable request logic
- `validators/`: request validation schemas or helper functions
- `utils/`: small helpers that do not fit elsewhere
- `tests/`: backend tests
- `views/`: templates for server-rendered apps
- `public/`: static files for server-rendered apps

## Two Common Backend Styles

Most practicum projects fit one of these styles:

### API Backend

Use this when the frontend is a separate React app or when the backend mainly serves JSON.

- routes point to controllers
- controllers return JSON and status codes
- the frontend calls the backend with `fetch` or Axios
- auth is often token-based

### Server-Rendered Backend

Use this when Express renders pages directly with EJS.

- controllers usually `render` views or `redirect`
- `views/` and `public/` are part of the app structure
- auth often uses sessions and Passport
- flash messages and form handling are common

Pick one main style per project and stay consistent.

## Simple Request Flow

Try to keep the default flow like this:

```text
route -> middleware -> controller -> service/model -> response
```

If the app is very small, this is also fine:

```text
route -> controller -> model/database -> response
```

Examples:

- `routes/booksRoutes.ts` defines `GET /books`
- `controllers/booksController.ts` reads request data and decides what response to send
- `services/booksService.ts` can hold reused business logic or grouped database work
- `models/Book.ts` defines the data shape

## Request Data and Responses

Keep request handling and responses predictable.

- validate `req.body`, `req.params`, and `req.query`
- use consistent response shapes so the frontend knows what to expect
- think about success, validation error, not found, unauthorized, and unexpected error states
- return the correct status code for the situation
- if an endpoint changes in a breaking way, tell the team early

Simple API response examples:

```json
{ "message": "Book created", "book": { "id": "123" } }
```

```json
{ "error": "Book not found" }
```

The exact shape can vary by project. Consistency matters more than picking the perfect format.

## Routes

Keep routes small. Route files should mostly say which controller runs for which URL and which middleware applies.

Good examples:

- `/auth/register`
- `/auth/login`
- `/books`
- `/books/:id`

Try not to put database queries, large validation blocks, or business rules directly inside route files.

## Controllers

Controllers handle request and response logic.

- read data from the request
- call the model or service that does the real work
- return JSON and status codes for API apps, or render and redirect for server-rendered apps
- keep controllers readable and focused on one action
- if a controller is getting too large, extract repeated logic into a service or helper
- use `try/catch` or an async error helper so rejected promises do not disappear

## Data Access and Services

You do not need a `services/` folder on day one, but it becomes useful when backend logic starts repeating.

- move reused business logic into a service instead of copying it into multiple controllers
- group related database operations together
- keep multi-step actions in one place so they are easier to test
- query only the fields you actually need when possible
- handle not-found cases explicitly instead of letting them turn into confusing errors

If a controller is just becoming a long list of Mongoose calls and conditionals, that is usually the signal to extract a service.

## Models

Use models for database structure and validation rules.

- keep model files focused on one resource
- use clear field names
- put schema-level validation where it belongs
- avoid repeating the same validation logic in many places if the model can enforce it
- keep model hooks and methods small enough that a teammate can follow them

## Middleware

Middleware is useful for logic that should run in many places.

Common examples:

- auth middleware to protect routes
- validation middleware for request bodies or params
- `notFound` middleware for missing routes
- `errorHandler` middleware for consistent errors
- rate limiting or logging middleware

If the same request logic appears in many routes, it may belong in middleware.

## Auth

Keep auth simple.

- if the project needs auth, use one clear approach
- server-rendered apps often use sessions and Passport
- API backends often use token-based auth
- keep auth logic in dedicated routes, controllers, and middleware
- hash passwords before saving them
- protect private routes with auth middleware
- never send passwords or secret tokens back in responses

For student projects, consistency matters more than advanced auth patterns.

## Security Basics

- use `helmet` or similar middleware for safer defaults
- add rate limiting to sensitive routes such as login or signup
- validate and sanitize user input
- lock down CORS to the frontend origin the app actually uses
- if you use sessions and forms, consider CSRF protection
- avoid logging secrets, tokens, or full connection strings

## Errors and Validation

- validate user input before creating or updating records
- return helpful error messages
- use custom errors when the same error pattern repeats
- log unexpected server errors for debugging
- do not send raw stack traces to users
- use `400` for invalid input
- use `401` or `403` for auth and permission problems
- use `404` for missing resources
- use `500` for unexpected server errors

If the backend returns random error shapes from different endpoints, the frontend becomes harder to build and debug.

## Environment Variables

Backend environment variables often contain real secrets. Treat them carefully.

- store secrets in a `.env` file during local development
- add `.env` to `.gitignore` immediately
- create a `.env.example` file with the same keys but no real values
- access values through `process.env`
- fail fast at startup if a required env var is missing

Common backend values:

- `PORT`
- `MONGO_URI`
- `SESSION_SECRET`
- `JWT_SECRET`
- `CLIENT_ORIGIN`

`.env.example` example:

```text
PORT=5000
MONGO_URI=
SESSION_SECRET=
JWT_SECRET=
CLIENT_ORIGIN=http://localhost:5173
```

For deployment, use MongoDB Atlas or another managed database provider and set these values in the hosting platform instead of hardcoding them.

## TypeScript Tips

If your project uses TypeScript, a few habits will save you time:

- define interfaces for shared request data, model inputs, and API response shapes
- use `interface` for object shapes and `type` for unions or aliases
- avoid `any`; if you are not sure yet, use `unknown` and narrow it
- type helper functions and service inputs before trying to type every Express detail
- add types where data crosses boundaries, such as request parsing or database helpers

Example:

```ts
interface CreateBookInput {
  title: string;
  author: string;
}

async function createBook(input: CreateBookInput) {
  return Book.create(input);
}
```

Do not try to type everything perfectly on day one. Start with the shared or error-prone parts and improve from there.

## Testing

Write backend tests from the start, not only after bugs show up.

- test important routes and main user flows first
- test success cases and at least one failure case
- test auth, validation, and CRUD behavior before edge-case polish
- use `supertest` for API route testing with `vitest` or `jest`
- name tests by behavior, such as `it('returns 401 when no token is provided')`
- run all tests before committing or opening a PR: `npm test`
- check coverage occasionally to spot untested critical paths: `npm test -- --coverage`

Good early backend tests:

- one auth test
- one CRUD test
- one validation or permission error test

If time is short, test the most important user flow first.

## Fixing Simple Bugs

When a small backend bug shows up, use this order:

1. Reproduce it on purpose so you know the exact request that fails.
2. Read the terminal error, stack trace, and logs before changing code.
3. Narrow the problem down to one route, controller, service, model, or env variable.
4. Fix the smallest real cause, not just the visible symptom.
5. Test the happy path again, plus one error or edge case.

Common places to check first:

- the route method or path does not match the frontend request
- the request body shape is different than the controller expects
- a required env var is missing
- auth middleware is blocking the route
- a Mongoose validation rule is failing
- an async function is missing `await`
- the database is not connected

## How To Reach Out For Help

Ask for help early. Do not wait until you are completely stuck.

When you ask for help, include:

- what you expected to happen
- what actually happened
- the exact error message or response body
- the route and HTTP method involved
- a sample request payload if relevant
- the file or layer you think is involved
- what you already tried

Good ways to reach out:

- post in team chat for a quick debugging question
- open a draft PR if the code needs context
- ask for a short pair-debugging session if you have been blocked for a while
- ask a mentor when you need a second opinion or help narrowing the problem down

This gives the person helping you enough context to help without guessing.

## Linting and Formatting

This project should use ESLint and Prettier from the start. Add the provided configs at project kickoff and use them on every PR. They reduce style debates and catch easy mistakes before review.

Enable **format on save** in VS Code by installing the ESLint and Prettier extensions and adding this to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

Run checks manually before opening a PR:

```bash
npm run lint
npm run format
```

- do not argue about formatting; let Prettier decide
- fix lint errors before opening a PR when possible
- if a lint rule needs to change, update the config instead of scattering inline disables everywhere

## Quality Checks Before a PR

Before you open a PR, check that:

- all relevant tests pass (`npm test`), or the change is docs-only/config-only
- there are no relevant lint errors (`npm run lint`)
- the main endpoint or user flow works locally
- validation failures return useful messages
- auth and permission failures behave the way you expect
- there are no obvious debug logs or dead code left behind
- no secrets, `.env` files, or private keys are included
- `.env.example` is updated if you added a new environment variable
- API contract changes are explained in the PR if they affect the frontend

## When To Keep It Smaller

If the project is tiny, it is okay to start with fewer files.

For example, you may not need:

- a `services/` folder on day one
- a `validators/` folder before validation grows
- dedicated custom error classes for a very small app
- many utility files for a simple project

Start simple, then split things when the code becomes hard to read, reuse, or test.

## Team Habits

- keep route names clear and predictable
- use consistent response shapes
- remove debug logs before opening a PR
- leave backend code easier to read than you found it
- ask questions early
- if a pattern has only appeared once, it is okay to keep it simple for now
- if a controller or model is getting hard to scan, pause and refactor before it grows further
