import { getRankedAuthors } from "@/server/handlers/search/rankAuthors";
import { elastic, unwrapMGetOrThrow } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { PAPER_INDEX_DEFAULT } from "@/server/schema/indexSetting";
import { InstitutionRankedSearchResult } from "@/server/schema/institution";
import { Paper, PaperIndex, PaperWithScore } from "@/server/schema/paper";

const TOP_K = 3;

export const fillEmpty = async (
  institutions: InstitutionRankedSearchResult[],
): Promise<InstitutionRankedSearchResult[]> => {
  const filledInstitutions: InstitutionRankedSearchResult[] = [];
  for (const institution of institutions) {
    const matchedAuthorCount = institution.authors.length;
    const matchedPaperCount = institution.authors.flatMap(
      (author) => author.papers,
    ).length;
    if (matchedPaperCount > 0 || matchedAuthorCount > 0) {
      filledInstitutions.push(institution);
      continue;
    }
    const papers = await getInstitutionTopCitedPapers(institution);
    const authors = await getRankedAuthors(papers, [], {
      top_k: TOP_K,
      raw: 0,
      recall: 0,
      avg: 1,
    }).then((allAuthors) =>
      allAuthors
        .filter(({ institution_id }) => institution_id === institution.id)
        .map((author) => ({ ...author, filled: true })),
    );
    filledInstitutions.push({ ...institution, authors });
  }
  return filledInstitutions;
};

const getInstitutionTopCitedPapers = async (
  institution: InstitutionRankedSearchResult,
): Promise<PaperWithScore[]> => {
  const topCitedPaperMetas = await prisma.paper.findMany({
    where: { authors: { some: { institution_id: institution.id } } },
    orderBy: { citations: "desc" },
    take: TOP_K,
  });
  const documents = await elastic
    .mget<PaperIndex>({
      index: PAPER_INDEX_DEFAULT.index,
      ids: topCitedPaperMetas.map((paper) => paper.id),
    })
    .then((results) => results.docs.map(unwrapMGetOrThrow));
  return topCitedPaperMetas.map((meta) => ({
    ...Paper.parse({
      ...meta,
      ...documents.find((doc) => doc._id === meta.id)?._source,
    }),
    score: meta.citations,
    raw_score: meta.citations,
    highlight: {},
    filled: true,
  }));
};
