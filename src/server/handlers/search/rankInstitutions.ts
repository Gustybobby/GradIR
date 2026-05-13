import {
  averageScore,
  getScoreSorted,
  maxScore,
  sumScore,
} from "@/server/handlers/search/utils";
import { elastic, unwrapMGetOrThrow } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { AuthorRankedSearchResult } from "@/server/schema/author";
import { INSTITUTION_INDEX } from "@/server/schema/indexSetting";
import {
  Institution,
  InstitutionIndex,
  InstitutionRankedSearchResult,
  InstitutionWithScore,
} from "@/server/schema/institution";

export interface InstitutionRankConfig {
  top_k: number;
  raw: number;
  recall: number;
  avg: number;
}

/**
 * #### Rank institutions
 * - Rank institutions by linear combination of normalized institution profile and researchers (authors) score.
 * - `inst_score` = Norm(`inst_raw_score`) + Norm(top_k_sum(`inst_aut_score`))
 * - 2nd term is institution's researchers score-weighted recall.
 */
export const getRankedInstitutions = async (
  authors: AuthorRankedSearchResult[],
  institutions: InstitutionWithScore[],
  config: InstitutionRankConfig,
): Promise<InstitutionRankedSearchResult[]> => {
  const institutionIds = [
    ...institutions.map((institution) => institution.id),
    ...authors.map((author) => author.institution_id),
  ];
  const unionInstitutions = await getInstitutionsByIds(institutionIds);

  const institutionsRecord = new Map(
    institutions.map((institution) => [institution.id, institution]),
  );

  const authorScoreSum = sumScore(authors);
  const maxAuthorScoreSum = maxScore(authors);
  const institutionScoreSum = sumScore(institutions);

  return getScoreSorted(
    unionInstitutions.map((unionInstitution) => {
      const institution = institutionsRecord.get(unionInstitution.id) ?? {
        ...unionInstitution,
        raw_score: 0,
        score: 0,
      };
      const rankedAuthors = getScoreSorted(
        authors.filter((author) => author.institution_id === institution.id),
      ).slice(0, config.top_k);
      const { finalScore, normRawScore } = calculateInstitutionScore(
        config,
        institution,
        rankedAuthors,
        institutionScoreSum,
        authorScoreSum,
        maxAuthorScoreSum,
      );
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
    elastic.mget<InstitutionIndex>({ index: INSTITUTION_INDEX.index, ids }),
  ]);
  return institutionMetas.map((meta) => ({
    ...meta,
    ...unwrapMGetOrThrow(
      institutionDocs.docs.find((doc) => doc._id === meta.id)!,
    )._source!,
  }));
};

const calculateInstitutionScore = (
  config: InstitutionRankConfig,
  institution: InstitutionWithScore,
  rankedAuthors: AuthorRankedSearchResult[],
  institutionScoreSum: number,
  authorScoreSum: number,
  maxAuthorScoreSum: number,
) => {
  const normRawScore = institutionScoreSum
    ? (config.raw * institution.score) / institutionScoreSum
    : 0;
  const normAuthorsRecallScore = authorScoreSum
    ? (config.recall * sumScore(rankedAuthors)) / authorScoreSum
    : 0;
  const normAuthorsAvgScore = maxAuthorScoreSum
    ? (config.avg * averageScore(rankedAuthors)) / maxAuthorScoreSum
    : 0;
  const finalScore =
    normRawScore + normAuthorsRecallScore + normAuthorsAvgScore;
  return { finalScore, normRawScore };
};
