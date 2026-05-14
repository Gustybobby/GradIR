import { search as callSearchAPI } from "@/client/api/search";
import { suggest as callSuggestAPI } from "@/client/api/suggest";
import { PaperIndexName } from "@/server/schema/indexSetting";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions, SearchSuggestion } from "@/server/schema/search";
import { usePathname, useSearchParams } from "next/navigation";
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

  const suggest = React.useCallback(
    (query: string) =>
      callSuggestAPI({ paperIndex: suggestIndex, query }).then(setSuggestions),
    [suggestIndex],
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(paramsQuery);
    setIsFetching(true);
    callSearchAPI({ paperIndex: queryIndex, query: paramsQuery })
      .then(setResult)
      .finally(() => setIsFetching(false));
    suggest(paramsQuery);
  }, [queryIndex, paramsQuery, suggest]);

  React.useEffect(() => {
    if (!isSuggestionEnabled || query === paramsQuery) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuggestions((suggestions) =>
      suggestions
        ? [{ text: query, score: 1 }, ...suggestions?.slice(1)]
        : undefined,
    );
    const timeout = setTimeout(() => suggest(query), 500);
    return () => clearTimeout(timeout);
  }, [queryIndex, isSuggestionEnabled, query, paramsQuery, suggest]);

  return { query, result, suggestions, isFetching, setQuery, search };
}
