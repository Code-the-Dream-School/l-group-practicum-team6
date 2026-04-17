# TypeScript Guide

Practical TypeScript patterns for React and Node projects. Focus on the cases you will hit every day.

This guide covers shared TypeScript habits first, then common React and backend examples.

## interface vs type

Use `interface` for object shapes. Use `type` for unions and aliases.

```ts
// object shape → interface
interface User {
  id: string;
  name: string;
  email: string;
}

// union → type
type Status = 'idle' | 'loading' | 'success' | 'error';
type ID = string | number;
```

## React props

Always define props with an interface. Mark optional props with `?`.

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

## React state

TypeScript usually infers the type from the initial value. Only annotate when needed.

```ts
const [count, setCount] = useState(0);           // inferred: number
const [name, setName] = useState('');            // inferred: string
const [user, setUser] = useState<User | null>(null); // needs annotation
```

## React event handlers

```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}
```

## Typed API data

Type what comes back from the API so the rest of the code knows what to expect.

```ts
interface Task {
  id: string;
  title: string;
  done: boolean;
}

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks');
  const data: Task[] = await res.json();
  return data;
}
```

## Backend service functions

Type service inputs and return values at the boundary. This makes controllers easier to read and keeps backend code predictable.

```ts
interface CreateBookInput {
  title: string;
  author: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
}

async function createBook(input: CreateBookInput): Promise<Book> {
  const savedBook = await db.books.create(input);
  return savedBook;
}

async function getBookById(id: string): Promise<Book | null> {
  return db.books.findById(id);
}
```

If a service can return nothing, show that in the return type with `null` or `undefined` instead of hiding it.

## Safe process.env handling

Do not read `process.env` all over the codebase. Read it once in a config file, validate it there, and export typed values.

```ts
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? '5000'),
  MONGO_URI: requireEnv('MONGO_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
};
```

That gives the rest of the app `env.MONGO_URI` instead of `process.env.MONGO_URI`, which removes repeated `string | undefined` checks.

## Typing validated req.body

Validate first, then use the validated value as the typed value. Do not trust raw `req.body`.

Example with Zod:

```ts
import type { Request, Response } from 'express';
import { z } from 'zod';

const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
});

type CreateBookBody = z.infer<typeof createBookSchema>;

async function createBookHandler(req: Request, res: Response) {
  const body: CreateBookBody = createBookSchema.parse(req.body);
  const book = await createBook(body);

  res.status(201).json(book);
}
```

If your project uses Joi or another validator, the rule is the same: validate once at the edge, then pass typed data deeper into the app.

## Typing req.params and req.query

`req.params` and `req.query` are also request data boundaries, so type them when the route depends on them.

```ts
import type { Request, Response } from 'express';

type BookParams = {
  id: string;
};

type BooksQuery = {
  page?: string;
  sort?: 'title' | 'author';
};

async function getBookHandler(req: Request<BookParams>, res: Response) {
  const book = await getBookById(req.params.id);
  res.json(book);
}

async function listBooksHandler(
  req: Request<{}, {}, {}, BooksQuery>,
  res: Response
) {
  const page = Number(req.query.page ?? '1');
  const sort = req.query.sort ?? 'title';

  res.json({ page, sort });
}
```

## Shared API response shapes

Pick a small response pattern and reuse it across backend and frontend code.

```ts
interface ApiSuccess<T> {
  ok: true;
  data: T;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

Backend:

```ts
res.status(200).json({ ok: true, data: book } satisfies ApiResponse<Book>);
res.status(404).json({ ok: false, error: 'Book not found' } satisfies ApiResponse<Book>);
```

Frontend:

```ts
async function fetchBook(id: string): Promise<ApiResponse<Book>> {
  const res = await fetch(`/api/books/${id}`);
  return res.json();
}
```

## Avoid any

`any` turns off type checking. Use `unknown` instead and narrow it before use.

```ts
// bad
function parse(input: any) {
  return input.value; // no safety
}

// better
function parse(input: unknown) {
  if (typeof input === 'object' && input !== null && 'value' in input) {
    return (input as { value: string }).value;
  }
}
```

If you are not sure of the type yet, use `unknown` and come back to it. Do not use `any` as a shortcut.

## Null and undefined

Handle them explicitly rather than ignoring the error.

```ts
const user = getUser(); // User | null

// bad — TypeScript error
console.log(user.name);

// good
if (user) {
  console.log(user.name);
}

// also fine for simple cases
console.log(user?.name);
```

## Useful built-in types

A few that come up often:

```ts
Partial<User>        // all fields optional
Required<User>       // all fields required
Pick<User, 'id' | 'name'>   // only those fields
Omit<User, 'email'>         // everything except those fields
```

## When not to type everything

Do not annotate everything upfront. Start with the parts that are shared, complex, or reused. Add annotations where TypeScript complains or where a teammate would have to guess what the shape is.

Good places to start:

- component props
- API response shapes
- service inputs and return values
- validated request data
- shared env parsing in one config file
