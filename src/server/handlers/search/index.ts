import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";
import { searchPapers } from "@/server/handlers/search/searchPapers";
import { searchAuthors } from "@/server/handlers/search/searchAuthors";
import { searchInstitutions } from "@/server/handlers/search/searchInstitutions";
import { getRankedAuthors } from "@/server/handlers/search/rankAuthors";
import { getRankedInstitutions } from "@/server/handlers/search/rankInstitutions";
import { compressSearchResults } from "@/server/handlers/search/compress";

export const searchRankedInstitutions = async (
  options: SearchOptions,
): Promise<CompressedInstitutionRankedSearchResult> => {
  const [papers, authors, institutions] = await Promise.all([
    searchPapers(options),
    searchAuthors(options),
    searchInstitutions(options),
  ]);
  const rankedAuthors = await getRankedAuthors(papers, authors, {
    raw: 0.3,
    papers_recall: 0.2,
    papers_quality: 0.5,
  });
  const rankedInstitutions = await getRankedInstitutions(
    rankedAuthors,
    institutions,
    { raw: 0.3, authors_recall: 0.2, authors_quality: 0.5 },
  );
  return compressSearchResults(rankedInstitutions);
};
