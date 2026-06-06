export function shuffleIds(ids: string[], random: () => number = Math.random): string[] {
  const result = [...ids];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index];
    const swap = result[swapIndex];

    if (current !== undefined && swap !== undefined) {
      result[index] = swap;
      result[swapIndex] = current;
    }
  }

  return result;
}
