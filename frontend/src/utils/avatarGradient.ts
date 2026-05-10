const gradients: [string, string][] = [
  ["#7C5CFC", "#00E5FF"],
  ["#FF4D6D", "#7C5CFC"],
  ["#00D68F", "#00E5FF"],
  ["#947DFF", "#FF4D6D"],
  ["#00E5FF", "#947DFF"],
  ["#7C5CFC", "#00D68F"],
];

export function pickGradient(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}
