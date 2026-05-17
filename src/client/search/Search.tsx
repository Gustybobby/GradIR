"use client";

import { useSearch } from "@/client/hooks/useSearch";
import { SearchHeader } from "@/client/search/SearchHeader";
import { SearchResultList } from "@/client/search/SearchResultList";

export function Search() {
  const { query, result, suggestions, isFetching, setQuery, search } =
    useSearch({
      queryIndex: "paper-eng-sem-bbq",
      suggestIndex: "paper-def",
      isSuggestionEnabled: true,
    });

  return (
    <div className="min-h-screen">
      <SearchHeader
        query={query}
        suggestions={suggestions}
        isLoading={isFetching}
        onQueryChange={(value) => {
          setQuery(value);
        }}
        onSearch={() => {
          if (!query) {
            return;
          }
          search({ query });
        }}
        onClickSuggestion={(text) => {
          if (text === query) {
            return;
          }
          setQuery(text);
          search({ query: text });
        }}
      />
      <SearchResultList result={isFetching ? undefined : result} />
    </div>
  );
}
