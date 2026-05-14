import { search as callSearchAPI } from "@/client/api/search";
import { suggest } from "@/client/api/suggest";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions, SearchSuggestion } from "@/server/schema/search";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

const PAPER_INDEX = "paper-eng";
const SUGGEST_INDEX = "paper-def";

interface Props {
  isSuggestionEnabled?: boolean;
}

export function useSearch({ isSuggestionEnabled }: Props) {
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

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(paramsQuery);
    setIsFetching(true);
    callSearchAPI({
      paperIndex: PAPER_INDEX,
      query: paramsQuery,
    })
      .then(setResult)
      .finally(() => setIsFetching(false));
    suggest({ paperIndex: SUGGEST_INDEX, query: paramsQuery }).then(
      setSuggestions,
    );
  }, [paramsQuery]);

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
    const timeout = setTimeout(() => {
      suggest({ paperIndex: SUGGEST_INDEX, query }).then(setSuggestions);
    }, 500);
    return () => clearTimeout(timeout);
  }, [isSuggestionEnabled, query, paramsQuery]);

  return { query, result, suggestions, isFetching, setQuery, search };
}
