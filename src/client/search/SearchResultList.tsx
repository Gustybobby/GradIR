import {
  SearchResult,
  SearchResultSkeleton,
} from "@/client/search/SearchResult";
import { Separator } from "@/client/ui/Separator";
import { InstitutionRankedSearchResult } from "@/server/schema/institution";
import React from "react";

interface Props {
  results: InstitutionRankedSearchResult[] | undefined;
}

function SearchResultListComponent({ results }: Props) {
  return (
    <div className="grid grid-cols-7">
      <main className="col-span-full md:col-start-2 md:col-span-5">
        <div className="grid gap-6 px-4">
          {results ? (
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
  );
}

export const SearchResultList = React.memo(SearchResultListComponent);
