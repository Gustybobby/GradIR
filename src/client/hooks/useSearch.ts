import { search as callSearchAPI } from "@/client/api/search";
import { suggest as callSuggestAPI } from "@/client/api/suggest";
import { PaperIndexName } from "@/server/schema/indexSetting";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions, SearchSuggestion } from "@/server/schema/search";
import { usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import React from "react";

export interface UseSearchProps {
  queryIndex: PaperIndexName;
  suggestIndex: PaperIndexName;
  isSuggestionEnabled?: boolean;
}

export function useSearch({
  queryIndex,
  suggestIndex,
  isSuggestionEnabled,
}: UseSearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const paramsQueryIndex = searchParams.get(
    "queryIndex",
  ) as PaperIndexName | null;

  const paramsQuery = searchParams.get("query") ?? "";
  const [query, setQuery] = React.useState<string>(paramsQuery);

  const [result, setResult] =
    React.useState<CompressedInstitutionRankedSearchResult>();
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>();
  const [isFetching, setIsFetching] = React.useState<boolean>(true);

  const search = React.useCallback(
    async (options: Pick<SearchOptions, "query">) => {
      const params = new URLSearchParams(searchParams);
      params.set("query", options.query);
      window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    },
    [pathname, searchParams],
  );

  const debouncedCallSuggestAPI = useDebouncedCallback(
    (options) => callSuggestAPI(options).then(setSuggestions),
    500,
  );

  const suggest = React.useCallback(
    (query: string) =>
      isSuggestionEnabled
        ? debouncedCallSuggestAPI({ paperIndex: suggestIndex, query })
        : undefined,
    [suggestIndex, isSuggestionEnabled, debouncedCallSuggestAPI],
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(paramsQuery);
    setIsFetching(true);
    callSearchAPI({
      paperIndex: paramsQueryIndex ?? queryIndex,
      query: paramsQuery,
    })
      .then(setResult)
      .finally(() => setIsFetching(false));
    suggest(paramsQuery);
  }, [queryIndex, paramsQueryIndex, paramsQuery, suggest]);

  return { query, result, suggestions, isFetching, setQuery, search, suggest };
}
