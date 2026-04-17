# Frontend Guide

This guide helps our team write clean, scalable, and maintainable frontend code using **React**, **Tailwind CSS**, and **React Context**. It works for projects using either JavaScript or TypeScript, while keeping the structure simple and beginner-friendly.

## Core Principles

- choose clarity over cleverness
- keep components focused
- build the simplest version first, then refactor if needed
- always show the user what is happening when data is loading, missing, or broken
- start thinking about accessibility as you build, even if you are still learning it, and make sure the feature works well on different screen sizes

## Recommended Project Structure

Start simple. Add more structure only when the app actually needs it.

If your project uses TypeScript, use `.tsx` for React components and `.ts` for hooks, API files, and utilities. If your project uses JavaScript, use `.jsx` and `.js`.

```text
src/
  pages/
    LoginPage.tsx
    DashboardPage.tsx
  components/
    LoginForm.tsx
    Button.tsx
    Modal.tsx
  context/
    AuthContext.tsx
  hooks/
    useAuth.ts
    useLocalStorage.ts
  api/
    client.ts
    authApi.ts
    tasksApi.ts
  lib/
    formatDate.ts
  tests/
    LoginForm.test.tsx
    authApi.test.ts
  assets/
```

Guidelines:

- use `pages/` for route-level screens
- use `components/` for shared UI pieces and small page-supporting components
- use `context/` for React context providers shared across the app, such as auth or theme
- use `hooks/` for custom hooks
- use `api/` for API files and data-fetching helpers
- use `lib/` for small shared utilities such as formatters
- use `tests/` for test files if the project keeps tests in one place, or co-locate them next to the file they test (e.g., `LoginForm.test.tsx` beside `LoginForm.tsx`) — pick one and stick to it
- avoid extra subfolders until the code is hard to scan

Default rule:

1. Start with the simple top-level folders shown above.
2. If one folder gets crowded, add one level of subfolders inside that folder.
3. Keep nesting shallow and only add folders when they make files easier to find.

Examples:

- `pages/dashboard/` for a route with several related files
- `components/forms/` or `components/layout/` for shared UI groups
- `assets/icons/` and `assets/images/` for different asset types

If the app becomes much larger later, the team can choose a feature-based structure, but that is not the default starting point.

For `api/`, keep it simple:

- use `client.ts` for shared request setup (e.g., base URL, auth headers, default options)
- use one API file per feature or resource, such as `authApi.ts` or `tasksApi.ts`
- keep `fetch` calls in `api/`, not inside components
- let components and hooks call small functions from `api/`

Do not split files just to look advanced. Split them when it makes the code easier to find, reuse, or test.

## Environment Variables

Never hardcode secrets, private API keys, or base URLs in your code.

Frontend environment variables are not secret. If a value is bundled into the browser app, users can inspect it. Use frontend env vars for public config such as the API base URL, not for tokens or private credentials.

- store secrets in a `.env` file at the project root
- add `.env` to `.gitignore` immediately — never commit it
- create a `.env.example` file with the same keys but no real values, and commit that instead
- access values in code via `import.meta.env.VITE_KEY` (Vite) or `process.env.REACT_APP_KEY` (Create React App)

`.env.example` example:

```text
VITE_API_BASE_URL=
VITE_PUBLIC_APP_NAME=
```

If a teammate clones the repo and the app does not work, a missing `.env` is the first thing to check. Keep `.env.example` up to date whenever you add a new variable.

## Components

- use functional components
- name components with PascalCase
- keep each component responsible for one main job
- if a file is getting hard to scan, split it into smaller pieces
- prefer descriptive prop names over short or clever names
- use a `button` for actions and a link for navigation

## State and Data

- start with local state
- use Context only for state that is truly shared across the app, such as auth or theme
- create a custom hook when logic is reused or when a component becomes too noisy
- avoid storing derived values in state when you can calculate them from existing data
- when fetching data, always think about:
  - loading
  - success
  - empty
  - error

## Styling with Tailwind CSS

See `TAILWIND_GUIDE.md` for more Tailwind examples and class-name patterns.

- use utility classes directly in `className`
- avoid inline CSS or large `style={{ ... }}` objects; prefer Tailwind classes or a shared component
- keep styling readable; if a class list becomes overwhelming, extract a component
- build mobile-first using `sm:`, `md:`, and `lg:`
- keep spacing, colors, and typography consistent across screens
- use `clsx` or a similar helper if conditional classes become hard to read

Example:

```jsx
<button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  Submit
</button>
```

## Keeping It Responsive

Responsive design means the page should still feel usable and readable on small phones, tablets, laptops, and larger screens.

- start with the mobile layout first, then add `sm:`, `md:`, and `lg:` changes only when the layout truly needs them
- avoid fixed widths and heights when possible; prefer flexible classes like `w-full`, `max-w-*`, `min-h-*`, `flex-wrap`, and `grid-cols-*`
- let sections stack naturally on small screens, then place them side by side on larger screens
- keep text readable by limiting line length and avoiding text that becomes too tiny on mobile
- make images, cards, forms, and buttons fit their container instead of overflowing off the screen
- watch for long labels, error messages, and table content that can break narrow layouts
- test common screen sizes in browser dev tools before opening a PR
- if a layout needs too many breakpoint fixes, simplify the component structure instead of layering on more classes

Common patterns:

- use `flex-col md:flex-row` when content should stack on mobile and sit side by side later
- use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for cards and repeated content
- use `overflow-x-auto` around wide tables or code blocks so they do not break the whole page
- use `w-full` on inputs and buttons when they should adapt to narrow containers

Example:

```jsx
<section className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <div className="rounded bg-white p-4">Main content</div>
  <aside className="rounded bg-gray-100 p-4">Sidebar</aside>
</section>
```

## TypeScript Tips

If your project uses TypeScript, a few habits will save you a lot of confusion:

- define props with an `interface`, not inline types

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled }: ButtonProps) { ... }
```

- use `interface` for object shapes (props, API responses) and `type` for unions or aliases
- avoid `any` — if you are not sure of the type yet, use `unknown` and narrow it before use
- type your API responses so components know what shape of data to expect
- if a value can be `null` or `undefined`, handle it explicitly rather than ignoring the error

Do not add types to everything upfront. Start with the parts that are shared or complex, and add types as you go.

## Accessibility Basics

- every input should have a visible label
- meaningful images should have `alt` text
- keyboard users should be able to reach and use interactive elements
- focus styles should stay visible
- do not rely on color alone to communicate meaning
- use semantic HTML before adding custom behavior

## Testing

Write unit tests from the start, not as an afterthought.

- test custom hooks, utility functions, and any logic that branches or transforms data
- test components for what the user sees and does, not implementation details
- use `@testing-library/react` for component tests and `vitest` (or `jest`) for unit tests
- name tests to describe behavior: `it('shows an error when login fails')`
- run all tests before committing or opening a PR: `npm test`
- check coverage occasionally to find untested logic: `npm test -- --coverage`
- aim for coverage on critical paths (auth, form validation, data transforms), not 100% coverage everywhere

## Fixing Simple Bugs

When a small frontend bug shows up, use this order:

1. Reproduce it on purpose so you know the exact steps.
2. Read the browser error message, console, and network tab before changing code.
3. Narrow the problem down to one component, hook, or API call.
4. Fix the smallest real cause, not just the visible symptom.
5. Test the happy path again, plus one error or edge case.

Common places to check first:

- the wrong prop or state value is being passed
- the component renders before data is ready
- a form input is not updating state correctly
- the API request is failing or the response shape is different than expected
- conditional rendering is hiding the wrong thing

## How To Reach Out For Help

Ask for help early. Do not wait until you are completely stuck.

When you ask for help, include:

- what you expected
- what actually happened
- the exact error message
- the file or component you think is involved
- what you already tried

Good ways to reach out:

- post in team chat for a quick question or bug
- open a draft PR if the code needs more context
- ask for a quick pair-debugging session if you have been blocked for a while
- ask a mentor when you need a second opinion, debugging help, or help getting unstuck

This gives the person helping you enough context to help without guessing.

## Linting and Formatting

This project should use ESLint and Prettier from the start. Add the provided configs at project kickoff and use them on every PR. They eliminate style debates and catch real bugs before review.

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

- do not argue about formatting — let Prettier decide
- fix lint errors before opening a PR, not after review
- if a lint rule needs to be turned off, do it in the config, not inline with `// eslint-disable`

## Quality Checks Before a PR

Before you open a PR, check that:

- all relevant tests pass (`npm test`), or the change is docs-only/config-only
- no lint errors (`npm run lint`)
- the page works on desktop and mobile
- forms show useful feedback for invalid input
- loading, empty, and error states are handled
- there are no obvious console errors
- there is no dead code left behind
- UI changes include screenshots

## Team Habits

- ask questions early
- leave code easier to read than you found it
- prefer small reusable pieces over copy-paste when a pattern repeats
- if a pattern has only appeared once, it is okay to keep it simple for now
