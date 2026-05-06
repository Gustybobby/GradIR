import {
  getScoreSorted,
  sumScore,
  sumScore1p,
} from "@/server/handlers/search/utils";
import { elastic, unwrapMGetOrThrow } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { AuthorRankedSearchResult } from "@/server/schema/author";
import {
  Institution,
  INSTITUTION_INDEX_NAME,
  InstitutionIndex,
  InstitutionRankedSearchResult,
  InstitutionWithScore,
} from "@/server/schema/institution";

/**
 * #### Rank institutions
 * - Rank institutions by linear combination of normalized institution profile and authors score.
 * - `inst_score` = Norm(`inst_raw_score`) + Norm(sum(`inst_aut_score` over `inst_auts`))
 */
export const getRankedInstitutions = async (
  authors: AuthorRankedSearchResult[],
  institutions: InstitutionWithScore[],
  weights: { raw: number; authors: number },
): Promise<InstitutionRankedSearchResult[]> => {
  const institutionIds = [
    ...institutions.map((institution) => institution.id),
    ...authors.map((author) => author.institution_id),
  ];
  const unionInstitutions = await getInstitutionsByIds(institutionIds);

  const institutionsRecord = new Map(
    institutions.map((institution) => [institution.id, institution]),
  );

  const institutionScoreSum = sumScore1p(institutions);
  const authorScoreSum = sumScore1p(authors);

  return getScoreSorted(
    unionInstitutions.map((unionInstitution) => {
      const institution = institutionsRecord.get(unionInstitution.id) ?? {
        ...unionInstitution,
        raw_score: 0,
        score: 0,
      };
      const rankedAuthors = getScoreSorted(
        authors.filter((author) => author.institution_id === institution.id),
      );
      const normInstitutionRawScore =
        (weights.raw * institution.score) / institutionScoreSum;
      const normInstitutionAuthorScore =
        (weights.authors * sumScore(rankedAuthors)) / authorScoreSum;
      const finalScore = normInstitutionRawScore + normInstitutionAuthorScore;
      return {
        ...institution,
        authors: rankedAuthors,
        raw_score: normInstitutionRawScore,
        score: finalScore,
      };
    }),
  );
};

const getInstitutionsByIds = async (ids: string[]): Promise<Institution[]> => {
  const [institutionMetas, institutionDocs] = await Promise.all([
    prisma.institution.findMany({ where: { id: { in: ids } } }),
    elastic.mget<InstitutionIndex>({ index: INSTITUTION_INDEX_NAME, ids }),
  ]);
  return institutionMetas.map((meta) => ({
    ...meta,
    ...unwrapMGetOrThrow(
      institutionDocs.docs.find((doc) => doc._id === meta.id)!,
    )._source!,
  }));
};
