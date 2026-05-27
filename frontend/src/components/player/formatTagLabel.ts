export function formatTagLabel(tag: string): string {
  if (!tag) return tag;

  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
}

export function getVisualSubtitle(tags: string[]): string {
  const primary = tags[0];

  if (!primary) {
    return 'Reactive visualizer';
  }

  return `${formatTagLabel(primary)} visualizer`;
}
