# Git Naming Guide

This guide covers naming for branches, pull requests, and commits.

For the full team workflow, see `CONTRIBUTING.md`.

## Branch Names

Use this format:

```text
type/short-description
```

### Recommended Types

| Type | Use for |
| --- | --- |
| `feature` | New user-facing work |
| `fix` | Bug fixes |
| `chore` | Small maintenance tasks |
| `refactor` | Code cleanup without behavior change |
| `docs` | Documentation updates |
| `test` | Adding or updating tests |
| `hotfix` | Urgent production fixes |

### Branch Naming Rules

- use lowercase letters
- use dashes instead of spaces
- keep the name short and specific
- make one branch for one task

### Examples

- `feature/login-page`
- `fix/header-overlap`
- `chore/update-eslint-config`
- `docs/setup-instructions`
- `test/login-form`

## Pull Request Titles

When you open a PR, GitHub automatically loads the template from `.github/pull_request_template.md`. Fill in each section before requesting review.

Prefer short, descriptive titles in commit-message style:

```text
type: short description
```

Examples:

- `feat: add login page`
- `fix: prevent duplicate form submit`
- `docs: clarify local setup steps`

## Commit Messages

Use this format:

```text
type: short description
```

### Common Types

| Type | Use for |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance or tooling |
| `refactor` | Code cleanup without behavior change |
| `docs` | Documentation only |
| `test` | Tests |
| `style` | Formatting-only changes |

### Commit Message Tips

- start with the change, not the file name
- use present tense
- be specific enough that a teammate understands the change
- avoid vague messages like `stuff`, `updates`, or `changes`

### Good Examples

- `feat: add login form validation`
- `fix: keep navbar visible on mobile`
- `refactor: extract reusable modal component`
- `docs: update setup checklist`
- `test: add coverage for signup form`
