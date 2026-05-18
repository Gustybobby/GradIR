import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";

export const search = async (
  options: SearchOptions,
): Promise<CompressedInstitutionRankedSearchResult> => {
  const response = await fetch(
    `/api/search?${new URLSearchParams(
      Object.entries(options)
        .filter(([, value]) => value)
        .map(([key, value]) => [key, value.toString()]),
    ).toString()}`,
  );
  return response.json();
};
