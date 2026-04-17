# Contributing Guide

This guide explains how we work together in the practicum project.

Starter-kit note:

- this starter kit currently uses the workflow below
- if your team changes the branching model later, update this document
- this starter kit currently documents one workflow: `feature -> dev -> main`
- day-to-day work happens only on feature branches
- do not code, commit, or push feature work directly on `dev` or `main`

Our goals are simple:

- keep changes small
- make PRs easy to review
- protect long-lived branches like `dev` and `main`
- help each other early when blocked

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Protected production branch. Only release PRs from `dev` go here. |
| `dev` | Protected integration branch. Feature PRs merge here first. |
| `feature/*`, `fix/*`, `chore/*`, `refactor/*`, `docs/*`, `test/*` | The only branches used for day-to-day work. |

## Standard Workflow

### 1. Start from a fresh `dev`

```bash
git checkout dev
git pull origin dev
```

Only use `dev` to sync with the remote. Do not do feature work there.

### 2. Create a feature branch right away

```bash
git checkout -b feature/short-description
```

Examples:

- `feature/login-page`
- `fix/mobile-nav`
- `chore/update-readme`

See `docs/GIT_GUIDE.md` for naming conventions.

### 3. Build in small steps

- Keep each commit focused on one change
- Check `git status` before staging
- Avoid `git add .` unless you have reviewed every changed file

Example:

```bash
git add src/features/login/
git commit -m "feat: add login form validation"
```

### 4. Before you push

Do a quick self-review:

- run the app locally
- run tests or linting if the project has them
- remove debug code and stray `console.log` statements
- make sure you did not add secrets, `.env` files, build output, or unrelated files

### 5. Keep your branch up to date

Merge the latest `dev` into your feature branch.

```bash
git fetch origin
git merge origin/dev
```

Why we use this as the default:

- it is easier for beginners to recover from
- it avoids accidental history rewrites
- the final PR can still use squash merge

### 6. Open a pull request

- Base branch: `dev`
- Title: use commit-message style, for example `feat: add login form`
- Keep the PR focused on one feature or fix
- Fill in the PR template (`.github/pull_request_template.md`) — GitHub loads it automatically when you open a PR
- Add screenshots for UI changes
- Ask for review early; a draft PR is okay

### 7. Review, fix, merge

- Respond to review comments kindly and clearly
- Resolve conversations before merge
- Use squash merge after approval
- Delete the branch after merge

### 8. Merge to `main`

When `dev` is stable:

1. Open a PR from `dev` to `main`
2. Use a short title that summarizes what is shipping
3. Get approval
4. Merge

## Resolving Merge Conflicts

A merge conflict happens when two branches changed the same lines in the same file and Git cannot decide which version to keep. This is normal — it does not mean anything went wrong.

### When conflicts happen

Conflicts appear after you run:

```bash
git fetch origin
git merge origin/dev
```

Git will print something like:

```text
CONFLICT (content): Merge conflict in src/components/Header.jsx
Automatic merge failed; fix conflicts and then commit the result.
```

### What a conflict looks like in a file

```text
<<<<<<< HEAD
const title = "My App";
=======
const title = "Our App";
>>>>>>> origin/dev
```

The incoming branch name in the marker will match the branch you merged from.

- Everything between `<<<<<<< HEAD` and `=======` is your version
- Everything between `=======` and `>>>>>>>` is the incoming version
- You need to pick one, combine them, or write something new

### How to resolve conflicts

#### Option 1 — VS Code (recommended for beginners)

VS Code highlights conflicts with inline buttons:

- **Accept Current Change** — keep your version
- **Accept Incoming Change** — keep the incoming version
- **Accept Both Changes** — keep both (you may need to clean up the result)
- **Compare Changes** — see a side-by-side diff

Click the option that makes sense, then save the file.

#### Option 2 — Edit the file directly

Remove all the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and leave only the final code you want.

### After resolving

Stage the resolved files and complete the merge:

```bash
git add src/components/Header.jsx
git commit
```

Git will pre-fill a merge commit message — you can accept it as-is.

### If you get stuck

Run `git status` to see which files still have conflicts (they show as `both modified`). If things feel unrecoverable, you can abort the merge and start over:

```bash
git merge --abort
```

Then ask a teammate before trying again.

### Tips to avoid conflicts

- Pull from `dev` frequently — the longer your feature branch diverges, the harder conflicts get
- Keep PRs small and focused on one thing
- Coordinate with teammates when working in the same file

## Pull Request Checklist

Before asking for review, make sure:

- all relevant tests pass (`npm test`), or the change is docs-only/config-only
- no relevant lint errors (`npm run lint`), or lint is not set up for this project
- the base branch is correct
- the branch includes only related changes
- the app runs locally
- you tested the main user flow and at least one edge case
- the UI works on desktop and mobile if the change affects layout
- there are no secrets, build files, or unrelated changes in the PR
- screenshots are included for visible UI changes

## Team Norms

- Never do day-to-day work directly on `dev` or `main`
- Never commit feature work directly to `dev` or `main`
- Keep PRs small when possible
- Ask for help when blocked for too long
- Prefer clear code over clever code
- Do not merge your own PR without review unless the team explicitly agrees
- Leave respectful, specific review comments

## When You Are Unsure

If you are stuck, open a draft PR or ask in team chat. Early questions are better than late surprises.
