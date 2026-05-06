"use client";

import { useSearch } from "@/client/hooks/useSearch";
import {
  SearchResult,
  SearchResultSkeleton,
} from "@/client/search/SearchResult";
import { SearchInput } from "@/client/ui/SearchInput";
import { Separator } from "@/client/ui/Separator";
import { PrimaryHeading } from "@/client/ui/Typography";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { results, isFetching, paramsQuery, search } = useSearch();

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
            router.push(`${pathname}?${params.toString()}`);
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
      <div className="grid grid-cols-7">
        <main className="col-span-full md:col-start-2 md:col-span-5">
          <div className="grid gap-6 px-4">
            {results && !isFetching ? (
              <>
                {results.length ? (
                  results.map((result) => (
                    <React.Fragment key={result.id}>
                      <SearchResult institution={result} />
                      <Separator />
                    </React.Fragment>
                  ))
                ) : (
                  <div className="w-full text-center">No result found.</div>
                )}
              </>
            ) : (
              <>
                <SearchResultSkeleton />
                <SearchResultSkeleton />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
