import {
  SearchResult,
  SearchResultSkeleton,
} from "@/client/search/SearchResult";
import { Separator } from "@/client/ui/Separator";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import React from "react";

interface Props {
  result: CompressedInstitutionRankedSearchResult | undefined;
}

function SearchResultListComponent({ result }: Props) {
  return (
    <div className="grid grid-cols-7">
      <main className="col-span-full md:col-start-2 md:col-span-5">
        <div className="grid gap-6 px-4">
          {result ? (
            <>
              {result.institutions.length ? (
                result.institutions.map((institution) => (
                  <React.Fragment key={institution.id}>
                    <SearchResult
                      institution={institution}
                      papers={result.papers}
                    />
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
