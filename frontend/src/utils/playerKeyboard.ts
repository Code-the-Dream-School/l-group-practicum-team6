export function shouldHandlePlayerShortcut(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return false;
  }

  const target = event.target;

  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  ) {
    return false;
  }

  return true;
}
