import {
  averageScore,
  getScoreSorted,
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
import { SearchOptions } from "@/server/schema/search";

export interface InstitutionRankConfig {
  top_k: number;
  raw: number;
  recall: number;
  avg: number;
}

/**
 * #### Rank institutions
 * - Rank institutions by linear combination of normalized institution profile and researchers (authors) score.
 * - `inst_score` = Norm(`inst_raw_score`) + Norm(top_k_sum(`inst_aut_score`)) + Norm(avg(`inst_aut_score`))
 * - 2nd term is institution's researchers score-weighted recall.
 */
export const getRankedInstitutions = async (
  authors: AuthorRankedSearchResult[],
  institutions: InstitutionWithScore[],
  config: InstitutionRankConfig,
  query: string,
): Promise<InstitutionRankedSearchResult[]> => {
  const institutionIds = [
    ...institutions.map((institution) => institution.id),
    ...authors.map((author) => author.institution_id),
  ];
  const [unionInstitutions, evalCounts] = await Promise.all([
    getInstitutionsByIds(institutionIds),
    getInstitutionsEvalCount(query, institutionIds),
  ]);

  const institutionsRecord = new Map(
    institutions.map((institution) => [institution.id, institution]),
  );

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
      );
      return {
        ...institution,
        authors: rankedAuthors,
        raw_score: normRawScore,
        score: finalScore,
        evalCount: evalCounts[institution.id] ?? 0,
      };
    }),
  );
};

export const filterInstitutionsByCountries = (
  institutions: InstitutionRankedSearchResult[],
  options: Pick<SearchOptions, "countries">,
) =>
  options.countries
    ? institutions.filter((institution) =>
        options.countries?.split(",").includes(institution.country),
      )
    : institutions;

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

const getInstitutionsEvalCount = async (
  query: string,
  ids: string[],
): Promise<Record<string, number>> => {
  if (!ids.length) {
    return {};
  }
  const counts = await prisma.evaluation.groupBy({
    by: ["institution_id"],
    where: { query },
    _count: { _all: true },
  });
  return Object.fromEntries(
    counts.map((count) => [count.institution_id, count._count._all]),
  );
};

const calculateInstitutionScore = (
  config: InstitutionRankConfig,
  institution: InstitutionWithScore,
  rankedAuthors: AuthorRankedSearchResult[],
) => {
  const normRawScore = config.raw * institution.score;
  const normAuthorsRecallScore = config.recall * sumScore(rankedAuthors);
  const normAuthorsAvgScore = config.avg * averageScore(rankedAuthors);
  const finalScore =
    normRawScore + normAuthorsRecallScore + normAuthorsAvgScore;
  return { finalScore, normRawScore };
};
