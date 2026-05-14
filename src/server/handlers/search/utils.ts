import { SearchOptions } from "@/server/schema/search";

export const sumScore = (items: { score: number }[]): number =>
  items.reduce((acc, curr) => acc + curr.score, 0);

export const averageScore = (items: { score: number }[]): number =>
  items.length ? sumScore(items) / items.length : 0;

export const minMaxNorm = <T extends { score: number }>(items: T[]): T[] => {
  if (items.length === 0) {
    return [];
  }
  const min = Math.min(...items.map((item) => item.score));
  const max = Math.max(...items.map((item) => item.score));
  if (min === max) {
    return items.map((item) => ({ ...item, score: 1 }));
  }
  return items.map((item) => ({
    ...item,
    score: (item.score - min) / (max - min),
  }));
};

export const getScoreSorted = <T extends { score: number }>(items: T[]): T[] =>
  items.toSorted((a, b) => -a.score + b.score);

export const decodeSearchParamsToSearchOptions = (
  searchParams: URLSearchParams,
): SearchOptions => {
  const weights = searchParams.get("paperRetrieverWeights")?.split(",");
  return SearchOptions.parse({
    paperIndex: searchParams.get("paperIndex"),
    query: searchParams.get("query"),
    paperRetrieverWeights: weights
      ? { match: weights[0], title: weights[1], abstract: weights[2] }
      : undefined,
  } satisfies Record<keyof SearchOptions, unknown>);
};
