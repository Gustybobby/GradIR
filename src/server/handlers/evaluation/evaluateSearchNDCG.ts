import { searchRankedInstitutions } from "@/server/handlers/search";
import { prisma } from "@/server/lib/prisma";
import { CompressedInstitution } from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";

export async function evaluateSearchNDCG(
  searchOptions: SearchOptions,
  at?: number,
) {
  const { institutions } = await searchRankedInstitutions(searchOptions);

  const queryScores = await getInstitutionQueryScores(searchOptions.query);

  const dcg = calculateDCG(institutions, queryScores, at);
  const idcg = calculateIDCG(queryScores, at);
  const ndcg = dcg / idcg;

  return { dcg, idcg, ndcg };
}

async function getInstitutionQueryScores(
  query: SearchOptions["query"],
): Promise<Map<string, number>> {
  const scores = await prisma.evaluation.groupBy({
    where: { query: query.toLowerCase() },
    by: ["institution_id"],
    _avg: { score: true },
  });
  return new Map(
    scores.map((score) => [score.institution_id, score._avg.score ?? 0]),
  );
}

function calculateDCG(
  institutions: CompressedInstitution[],
  queryScores: Map<string, number>,
  limit?: number,
): number {
  return institutions
    .slice(0, limit)
    .reduce(
      (acc, curr, idx) =>
        acc + calculateDCGElement(idx + 1, queryScores.get(curr.id) ?? 0),
      0,
    );
}

function calculateIDCG(
  queryScores: Map<string, number>,
  limit?: number,
): number {
  const sortedScores = queryScores
    .entries()
    .toArray()
    .toSorted((a, b) => -a[1] + b[1])
    .slice(0, limit);
  return sortedScores.reduce(
    (acc, curr, idx) => acc + calculateDCGElement(idx + 1, curr[1]),
    0,
  );
}

function calculateDCGElement(position: number, rel: number): number {
  const discount = 1 / Math.log2(position + 1);
  return discount * rel;
}
