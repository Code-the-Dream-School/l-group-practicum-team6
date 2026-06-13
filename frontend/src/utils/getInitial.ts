export function getInitial(name?: string | null): string {
  if (!name) return '';

  return name.trim()[0]?.toUpperCase() ?? '?';
}
