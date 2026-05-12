"use client";

import { useSearch } from "@/client/hooks/useSearch";
import { SearchResultList } from "@/client/search/SearchResultList";
import { SearchInput } from "@/client/ui/SearchInput";
import { PrimaryHeading } from "@/client/ui/Typography";

export function Search() {
  const { query, result, isFetching, setQuery, search } = useSearch();

  return (
    <div className="min-h-screen">
      <header className="px-2 py-4 mb-8 bg-zinc-900 shadow-md border-b border-border grid grid-cols-7">
        <div className="flex items-center justify-center col-span-2 md:col-span-1">
          <PrimaryHeading className="text-center text-accent">
            GradIR
          </PrimaryHeading>
        </div>
        <form
          className="col-span-5 col-start-3 md:col-span-5 px-2 flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (!query) {
              return;
            }
            search({ query });
          }}
        >
          <SearchInput
            name="search-query"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
            }}
            isLoading={isFetching}
          />
        </form>
      </header>
      <SearchResultList result={isFetching ? undefined : result} />
    </div>
  );
}
