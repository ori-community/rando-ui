export function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-expect-error TypeScript cannot infer array length here
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array
}
