import { CompressedInstitutionRankedSearchResult } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";
import { searchPapers } from "@/server/handlers/search/searchPapers";
import { searchAuthors } from "@/server/handlers/search/searchAuthors";
import { searchInstitutions } from "@/server/handlers/search/searchInstitutions";
import {
  AuthorRankConfig,
  getRankedAuthors,
} from "@/server/handlers/search/rankAuthors";
import {
  getRankedInstitutions,
  InstitutionRankConfig,
} from "@/server/handlers/search/rankInstitutions";
import { compressSearchResults } from "@/server/handlers/search/compress";
import { minMaxNorm } from "@/server/handlers/search/utils";

const authorRankConfig: AuthorRankConfig = {
  top_k: 3,
  raw: 0.5,
  recall: 0.4,
  avg: 0.1,
};

const institutionRankConfig: InstitutionRankConfig = {
  top_k: 3,
  raw: 0.5,
  recall: 0.4,
  avg: 0.1,
};

export const searchRankedInstitutions = async (
  options: SearchOptions,
): Promise<CompressedInstitutionRankedSearchResult> => {
  const [papers, authors, institutions] = await Promise.all([
    searchPapers(options).then(minMaxNorm),
    searchAuthors(options).then(minMaxNorm),
    searchInstitutions(options).then(minMaxNorm),
  ]);
  const rankedAuthors = await getRankedAuthors(
    papers,
    authors,
    authorRankConfig,
  ).then(minMaxNorm);
  const rankedInstitutions = await getRankedInstitutions(
    rankedAuthors,
    institutions,
    institutionRankConfig,
  ).then(minMaxNorm);
  return compressSearchResults(rankedInstitutions);
};
