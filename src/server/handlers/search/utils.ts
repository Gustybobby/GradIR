export const sumScore = (items: { score: number }[]): number =>
  items.reduce((acc, curr) => acc + curr.score, 0);

export const averageScore = (items: { score: number }[]): number =>
  items.length ? sumScore(items) / items.length : 0;

export const maxScore = (items: { score: number }[]): number =>
  items.length ? Math.max(...items.map((item) => item.score)) : 0;

export const getScoreSorted = <T extends { score: number }>(items: T[]): T[] =>
  items.toSorted((a, b) => -a.score + b.score);
