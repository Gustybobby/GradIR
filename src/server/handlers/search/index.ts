import { InstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";
import { searchPapers } from "@/server/handlers/search/searchPapers";
import { searchAuthors } from "@/server/handlers/search/searchAuthors";
import { searchInstitutions } from "@/server/handlers/search/searchInstitutions";
import { getRankedAuthors } from "@/server/handlers/search/rankAuthors";
import { getRankedInstitutions } from "@/server/handlers/search/rankInstitutions";

export const searchRankedInstitutions = async (
  options: SearchOptions,
): Promise<InstitutionRankedSearchResult[]> => {
  const [papers, authors, institutions] = await Promise.all([
    searchPapers(options),
    searchAuthors(options),
    searchInstitutions(options),
  ]);
  const rankedAuthors = await getRankedAuthors(papers, authors, {
    raw: 0.5,
    papers: 0.5,
  });
  const rankedInstitutions = await getRankedInstitutions(
    rankedAuthors,
    institutions,
    { raw: 0.3, authors: 0.7 },
  );
  return rankedInstitutions;
};
