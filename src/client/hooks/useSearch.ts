import { search as callSearchAPI } from "@/client/api/search";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

export function useSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const paramsQuery = searchParams.get("query") ?? "";
  const [query, setQuery] = React.useState<string>(paramsQuery);

  const [result, setResult] =
    React.useState<CompressedInstitutionRankedSearchResult>();
  const [isFetching, setIsFetching] = React.useState<boolean>(true);

  const search = React.useCallback(
    async (options: Pick<SearchOptions, "query">) => {
      const params = new URLSearchParams(searchParams);
      params.set("query", options.query);
      window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    },
    [pathname, searchParams],
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(paramsQuery);
    setIsFetching(true);
    callSearchAPI({
      paperIndex: "paper-eng",
      query: paramsQuery,
    })
      .then(setResult)
      .finally(() => setIsFetching(false));
  }, [paramsQuery]);

  return { query, result, isFetching, setQuery, search };
}
