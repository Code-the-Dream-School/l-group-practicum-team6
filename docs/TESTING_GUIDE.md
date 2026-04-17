# Testing Guide

This guide helps our team test projects in a simple, practical way.

The goal is not to write every possible test. The goal is to catch important bugs early and give the team confidence before opening a PR.

## Core Ideas

- test the most important user flows first
- start small and add tests as the project grows
- test behavior, not implementation details
- run tests before opening a PR
- if you do not have time to test everything, test the riskiest part first

## What To Test First

For most student projects, start with:

- auth flows such as signup, login, and logout
- form validation
- CRUD actions such as create, edit, and delete
- API requests that can fail
- utility functions that transform data

If the project has very little time, test one happy path and one error case for each important feature.

## Frontend Testing

Good frontend things to test:

- what the user sees
- what happens when the user clicks, types, or submits
- error messages
- loading states
- empty states

Good examples:

- login form shows an error for invalid input
- submit button is disabled while saving
- dashboard shows a message when there is no data

Try not to test:

- internal state names
- private implementation details
- exact Tailwind class strings unless the class itself is the behavior

## Backend Testing

Good backend things to test:

- auth endpoints
- one CRUD flow for a main resource
- permission errors
- validation errors
- not-found cases

Good examples:

- user can log in with valid credentials
- creating a record fails when required fields are missing
- protected route returns an auth error for unauthenticated users
- deleting a missing record returns a not-found error

## Types of Tests

Keep the names simple:

- unit tests: small pieces of logic such as helpers or validators
- integration tests: parts of the app working together, such as route + controller + database
- manual testing: checking the app yourself in the browser or API client

For this kind of project, integration tests and careful manual testing are often the highest value.

## Where Tests Should Live

Pick one approach and stay consistent:

- keep tests in a top-level `tests/` folder
- or keep test files near the code they test

Both are fine for student projects. Consistency matters more than picking the perfect structure.

## A Good Minimum Before a PR

Before opening a PR, try to have:

- at least one automated test for the main feature you changed
- all existing automated tests passing locally
- one manual test of the main user flow
- one edge case or error case checked

If you changed UI, also check:

- desktop
- mobile
- empty state
- error state

## Example Manual Test Notes

These are good notes to paste into a PR:

```text
1. Started the frontend and backend locally
2. Logged in with a test user
3. Created a new task
4. Edited the task title
5. Confirmed validation error appears when title is empty
```

If the change is small, shorter notes are fine. The important part is that a teammate can follow what you tested.

## Useful Commands

The exact commands depend on the project, but these are common:

```bash
npm test
npm run test
npm run test:watch
npm test -- --coverage
```

For code changes, automated tests are expected when the project already has them.

If the change is docs-only or config-only, say that clearly in the PR.

## Suggested Tools

Use the tools that match the project, not every tool at once.

- frontend: `vitest` or `jest`
- React components: `@testing-library/react`
- backend/API: `supertest` plus your test runner

If the project already uses a tool, keep using it.

## When a test fails

Use this order before changing the test:

1. Re-run the failing test by itself so you can focus on one problem.
2. Read the full error message and find the exact assertion, status code, or missing element.
3. Check whether the failure is a real product bug, a broken test, or an outdated test after an intentional code change.
4. Check the real behavior yourself in the browser or API client.
5. For async or API tests, check timing, request data, response data, and test setup.
6. Fix the real cause first. Only update the test when the intended behavior changed.

If a test passes sometimes and fails sometimes, look for shared state, missing cleanup, or timing issues.

## Team Habits

- do not wait until the end of the sprint to start testing
- write tests for bugs you fixed so they do not come back
- when a test fails, understand why before changing the test
- if a test is too hard to write, the code may need to be simpler
