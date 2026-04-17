# Tailwind Guide

Practical Tailwind patterns for React projects. Prefer Tailwind utilities directly in `className`.

Use plain CSS only when it clearly makes sense:

- global Tailwind setup such as `@tailwind` imports
- app-wide resets, CSS variables, or theme tokens
- third-party library overrides that Tailwind alone cannot handle

Avoid inline `style={{ ... }}` for normal spacing, colors, layout, or typography. Reach for Tailwind classes first.

## How it works

Instead of writing CSS, you compose utility classes:

```tsx
// without Tailwind
<button className="btn-primary">Save</button>

// with Tailwind
<button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  Save
</button>
```

## Layout

**Flexbox:**

```tsx
<div className="flex items-center gap-4">
  <img ... />
  <span>Username</span>
</div>

<div className="flex flex-col gap-2">   {/* vertical stack */}
  <Input ... />
  <Button ... />
</div>
```

**Grid:**

```tsx
<div className="grid grid-cols-3 gap-4">  {/* 3 equal columns */}
  ...
</div>

<div className="grid grid-cols-1 gap-4 md:grid-cols-2">  {/* 1 col → 2 on md */}
  ...
</div>
```

## Spacing

Tailwind uses a scale where `1 = 4px`:

| Class | Size |
| --- | --- |
| `p-2` | padding 8px |
| `p-4` | padding 16px |
| `px-4` | horizontal padding |
| `py-2` | vertical padding |
| `mt-4` | margin-top 16px |
| `gap-4` | gap between flex/grid children |

Prefer the built-in spacing scale before reaching for arbitrary values like `mt-[18px]`. Repeated one-off values usually make the UI harder to keep consistent.

## Typography

```tsx
<h1 className="text-2xl font-bold">Title</h1>
<p className="text-sm text-gray-500">Subtitle</p>
<p className="text-base leading-relaxed">Body text</p>
```

## Colors

Colors follow a `color-shade` pattern, from `50` (lightest) to `950` (darkest):

```tsx
<div className="bg-blue-600 text-white" />      {/* background + text */}
<div className="border border-gray-200" />      {/* border */}
<p className="text-red-500">Error message</p>   {/* text color */}
```

## Responsive design

Tailwind is mobile-first. Unprefixed classes apply to all sizes; prefixed classes kick in at that breakpoint and up.

| Prefix | Breakpoint |
| --- | --- |
| (none) | all screens |
| `sm:` | 640px+ |
| `md:` | 768px+ |
| `lg:` | 1024px+ |

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Scales up on larger screens
</div>

<div className="flex flex-col md:flex-row">
  Stacks vertically on mobile, horizontal on md+
</div>
```

## States

```tsx
<button className="bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
  Submit
</button>

<input className="border border-gray-300 focus:border-blue-500" />
```

## Conditional classes

Use `clsx` when class names depend on state. Avoid string interpolation — Tailwind's build step will miss interpolated class names.

```tsx
import clsx from 'clsx';

<button
  className={clsx(
    'rounded px-4 py-2 text-white',
    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  )}
>
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

Never do this — Tailwind will not include the class in the build:

```tsx
// bad
<div className={`text-${color}-500`} />

// good
<div className={color === 'red' ? 'text-red-500' : 'text-blue-500'} />
```

## When to extract a component

Keep utility classes inline until they become hard to read or repeat across files. Extract when:

- the same class combination appears in three or more places
- the `className` string is too long to scan at a glance

```tsx
// repeated in many places → extract
function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
      {label}
    </span>
  );
}
```
