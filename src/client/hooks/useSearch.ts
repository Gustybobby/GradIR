import { search as callSearchAPI } from "@/client/api/search";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";
import { useSearchParams } from "next/navigation";
import React from "react";

export function useSearch() {
  const searchParams = useSearchParams();
  const initialQueryRef = React.useRef<string>(searchParams.get("query") ?? "");

  const [result, setResult] =
    React.useState<CompressedInstitutionRankedSearchResult>();
  const [isFetching, setIsFetching] = React.useState<boolean>(true);

  const search = React.useCallback(async (options: SearchOptions) => {
    setIsFetching(true);
    await callSearchAPI(options)
      .then(setResult)
      .finally(() => setIsFetching(false));
  }, []);

  React.useEffect(() => {
    if (!initialQueryRef.current) {
      return;
    }
    callSearchAPI({ query: initialQueryRef.current })
      .then(setResult)
      .finally(() => setIsFetching(false));
  }, [search]);

  return {
    result,
    isFetching,
    paramsQuery: searchParams.get("query") ?? "",
    search,
  };
}
