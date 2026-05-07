import {
  SearchResult,
  SearchResultSkeleton,
} from "@/client/search/SearchResult";
import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import React from "react";

interface Props {
  result: CompressedInstitutionRankedSearchResult | undefined;
}

function SearchResultListComponent({ result }: Props) {
  return (
    <div className="grid grid-cols-7 mb-8">
      <main className="col-span-full md:col-start-2 md:col-span-5">
        <div className="grid gap-4 px-4">
          {result ? (
            <>
              {result.institutions.length ? (
                result.institutions.map((institution, idx) => (
                  <SearchResult
                    key={institution.id}
                    rank={idx + 1}
                    institution={institution}
                    papers={result.papers}
                  />
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
