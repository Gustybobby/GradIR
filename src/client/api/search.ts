import { InstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";

export const search = async (
  options: SearchOptions,
): Promise<InstitutionRankedSearchResult[]> => {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
  return response.json();
};
