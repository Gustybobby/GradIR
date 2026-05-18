"use client";

import { useSearch } from "@/client/hooks/useSearch";
import { SearchHeader } from "@/client/search/SearchHeader";
import { SearchResultList } from "@/client/search/SearchResultList";

export function Search() {
  const {
    query,
    result,
    suggestions,
    isFetching,
    selectedCountries,
    setQuery,
    search,
    suggest,
    setSelectedCountries,
  } = useSearch({
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
        selectedCountries={selectedCountries}
        onQueryChange={(value) => {
          setQuery(value);
        }}
        onSearch={() => {
          if (!query) {
            return;
          }
          search({ query });
        }}
        onSuggest={suggest}
        onSelectSuggestion={(value) => {
          if (value === query) {
            return;
          }
          setQuery(value);
          search({ query: value });
        }}
        onCountriesChange={setSelectedCountries}
      />
      <SearchResultList result={isFetching ? undefined : result} />
    </div>
  );
}
