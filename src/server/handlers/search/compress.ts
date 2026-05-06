import { getScoreSorted } from "@/server/handlers/search/utils";
import {
  CompressedInstitutionRankedSearchResult,
  InstitutionRankedSearchResult,
} from "@/server/schema/institution";

export const compressSearchResults = (
  results: InstitutionRankedSearchResult[],
): CompressedInstitutionRankedSearchResult => {
  const institutions: CompressedInstitutionRankedSearchResult["institutions"] =
    results.map((institution) => ({
      ...institution,
      authors: institution.authors.map((author) => ({
        ...author,
        papers: undefined,
        paper_ids: author.papers.map((paper) => paper.id),
      })),
    }));
  const papers: CompressedInstitutionRankedSearchResult["papers"] = [];
  const paperIdSet = new Set<string>();
  for (const result of results) {
    for (const author of result.authors) {
      for (const paper of author.papers) {
        if (paperIdSet.has(paper.id)) {
          continue;
        }
        paperIdSet.add(paper.id);
        papers.push(paper);
      }
    }
  }
  return { institutions, papers: getScoreSorted(papers) };
};
