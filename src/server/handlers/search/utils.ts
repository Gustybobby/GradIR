export const sumScore = (items: { score: number }[]): number =>
  items.reduce((acc, curr) => acc + curr.score, 0);

export const sumScore1p = (items: { score: number }[]): number =>
  items.reduce((acc, curr) => acc + curr.score, 0) + 1;

export const getScoreSorted = <T extends { score: number }>(items: T[]): T[] =>
  items.toSorted((a, b) => -a.score + b.score);
