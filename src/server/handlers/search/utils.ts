import { SearchOptions } from "@/server/schema/search";

export const sumScore = (items: { score: number }[]): number =>
  items.reduce((acc, curr) => acc + curr.score, 0);

export const averageScore = (items: { score: number }[]): number =>
  items.length ? sumScore(items) / items.length : 0;

export const normL1 = <T extends { score: number }>(items: T[]): T[] => {
  if (items.length === 0) {
    return [];
  }
  const sum = sumScore(items);
  return items.map((item) => ({
    ...item,
    score: sum === 0 ? 0 : item.score / sum,
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
    countries: searchParams.get("countries") ?? undefined,
    paperRetrieverWeights: weights
      ? { match: weights[0], title: weights[1], abstract: weights[2] }
      : undefined,
  } satisfies Record<keyof SearchOptions, unknown>);
};
