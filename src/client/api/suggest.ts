import { SearchOptions, SearchSuggestion } from "@/server/schema/search";

export const suggest = async (
  options: SearchOptions,
): Promise<SearchSuggestion[]> => {
  const response = await fetch(
    `/api/suggestions?${new URLSearchParams(
      Object.entries({ ...options, threshold: String(0.7) }).map(
        ([key, value]) => [key, value.toString()],
      ),
    ).toString()}`,
  );
  return response.json();
};
