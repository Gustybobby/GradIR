import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  INSTITUTION_INDEX_NAME,
  InstitutionIndex,
  InstitutionWithScore,
} from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";

/**
 * ### Search institution index by query.
 */
export const searchInstitutions = async (
  options: SearchOptions,
): Promise<InstitutionWithScore[]> => {
  const result = await elastic.search<InstitutionIndex>({
    index: INSTITUTION_INDEX_NAME,
    query: {
      multi_match: {
        query: options.query,
        fields: ["title^3", "location", "country", "website", "type^2"],
      },
    },
  });
  const docs = result.hits.hits.map((hit) => ({
    ...hit._source!,
    id: hit._id!,
    raw_score: hit._score ?? 0,
    score: hit._score ?? 0,
  }));
  return prisma.institution
    .findMany({ where: { id: { in: docs.map((doc) => doc.id) } } })
    .then((metas) =>
      metas.map((meta) => ({
        ...meta,
        ...docs.find((doc) => doc.id === meta.id)!,
      })),
    );
};
