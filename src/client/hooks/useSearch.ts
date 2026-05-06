import { search as callSearchAPI } from "@/client/api/search";
import { InstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";
import { useSearchParams } from "next/navigation";
import React from "react";

export function useSearch() {
  const searchParams = useSearchParams();

  const [results, setResults] =
    React.useState<InstitutionRankedSearchResult[]>();
  const [isFetching, setIsFetching] = React.useState<boolean>(true);

  const search = React.useCallback(async (options: SearchOptions) => {
    setIsFetching(true);
    await callSearchAPI(options)
      .then(setResults)
      .finally(() => setIsFetching(false));
  }, []);

  React.useEffect(() => {
    const initialQuery = searchParams.get("query") ?? "";
    if (!initialQuery) {
      return;
    }
    callSearchAPI({ query: initialQuery })
      .then(setResults)
      .finally(() => setIsFetching(false));
  }, [searchParams, search]);

  return {
    results,
    isFetching,
    paramsQuery: searchParams.get("query") ?? "",
    search,
  };
}
