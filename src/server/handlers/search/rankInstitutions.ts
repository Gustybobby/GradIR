import {
  averageScore,
  getScoreSorted,
  maxScore,
  sumScore,
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
 * - Rank institutions by linear combination of normalized institution profile and researchers (authors) score.
 * - `inst_score` = Norm(`inst_raw_score`) + Norm(sum(`inst_aut_score`)) + Norm(avg(`inst_aut_score`))
 * - 2nd term is institution's researchers score-weighted recall.
 * - 3rd term is institution's researchers quality.
 */
export const getRankedInstitutions = async (
  authors: AuthorRankedSearchResult[],
  institutions: InstitutionWithScore[],
  weights: { raw: number; authors_recall: number; authors_quality: number },
): Promise<InstitutionRankedSearchResult[]> => {
  const institutionIds = [
    ...institutions.map((institution) => institution.id),
    ...authors.map((author) => author.institution_id),
  ];
  const unionInstitutions = await getInstitutionsByIds(institutionIds);

  const institutionsRecord = new Map(
    institutions.map((institution) => [institution.id, institution]),
  );

  const authorScoreSum = sumScore(authors) + 1;
  const authorMaxScore = maxScore(authors) + 1;
  const institutionScoreSum = sumScore(institutions) + 1;

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
      const normRawScore =
        (weights.raw * institution.score) / institutionScoreSum;
      const normAuthorsRecallScore =
        (weights.authors_recall * sumScore(rankedAuthors)) / authorScoreSum;
      const normAuthorsQualityScore =
        (weights.authors_quality * averageScore(rankedAuthors)) /
        authorMaxScore;
      const finalScore =
        normRawScore + normAuthorsRecallScore + normAuthorsQualityScore;
      return {
        ...institution,
        authors: rankedAuthors,
        raw_score: normRawScore,
        score: finalScore,
      };
    }),
  );
};

const getInstitutionsByIds = async (ids: string[]): Promise<Institution[]> => {
  if (!ids.length) {
    return [];
  }
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
