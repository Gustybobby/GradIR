"use client";

import { useSearch } from "@/client/hooks/useSearch";
import { SearchResultList } from "@/client/search/SearchResultList";
import { SearchInput } from "@/client/ui/SearchInput";
import { PrimaryHeading } from "@/client/ui/Typography";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

export function Search() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { result, isFetching, paramsQuery, search } = useSearch();

  const [query, setQuery] = React.useState<string>(paramsQuery);

  return (
    <div className="min-h-screen">
      <header className="px-2 py-4 mb-8 bg-zinc-900 shadow-md border-b border-border grid grid-cols-7">
        <div className="flex items-center justify-center">
          <PrimaryHeading className="text-center">Grad IR</PrimaryHeading>
        </div>
        <form
          className="col-span-full col-start-2 md:col-span-5 px-2 flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (!query) {
              return;
            }
            const params = new URLSearchParams(searchParams);
            params.set("query", query);
            window.history.pushState(
              {},
              "",
              `${pathname}?${params.toString()}`,
            );
            search({ query });
          }}
        >
          <SearchInput
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
