// Provided by https://stackoverflow.com/a/27664971
// Merges multiple arrays while removing duplicates
// To make it compile AOT, the Array.from is needed (see https://stackoverflow.com/a/33464709).
export function mergeDedupe(arr: any[][]): any[] {
  return [...Array.from(new Set([].concat(...arr)))];
}
