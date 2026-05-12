import { searchRankedInstitutions } from "@/server/handlers/search";
import { prisma } from "@/server/lib/prisma";
import { CompressedInstitution } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";

const DEFAULT_SCORE = 1.5;

export async function evaluateSearchNDCG(searchOptions: SearchOptions) {
  const { institutions } = await searchRankedInstitutions(searchOptions);

  const queryScores = await getInstitutionQueryScores(searchOptions.query);

  const dcg = calculateDCG(institutions, queryScores);
  const idcg = calculateIDCG(queryScores);
  const ndcg = dcg / idcg;

  return { dcg, idcg, ndcg };
}

async function getInstitutionQueryScores(
  query: SearchOptions["query"],
): Promise<Map<string, number>> {
  const scores = await prisma.evaluation.groupBy({
    where: { query },
    by: ["institution_id"],
    _avg: { score: true },
  });
  return new Map(
    scores.map((score) => [
      score.institution_id,
      score._avg.score ?? DEFAULT_SCORE,
    ]),
  );
}

function calculateDCG(
  institutions: CompressedInstitution[],
  queryScores: Map<string, number>,
): number {
  return institutions.reduce(
    (acc, curr, idx) =>
      acc +
      calculateDCGElement(idx + 1, queryScores.get(curr.id) ?? DEFAULT_SCORE),
    0,
  );
}

function calculateIDCG(queryScores: Map<string, number>): number {
  const sortedScores = queryScores
    .entries()
    .toArray()
    .toSorted((a, b) => -a[1] + b[1]);
  return sortedScores.reduce(
    (acc, curr, idx) => acc + calculateDCGElement(idx + 1, curr[1]),
    0,
  );
}

function calculateDCGElement(position: number, rel: number): number {
  const discount = 1 / Math.log2(position + 1);
  return discount * rel;
}
