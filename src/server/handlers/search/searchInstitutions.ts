import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { INSTITUTION_INDEX } from "@/server/schema/indexSetting";
import {
  InstitutionIndex,
  InstitutionWithScore,
} from "@/server/schema/institution";
import { SearchOptions } from "@/server/schema/search";

/**
 * ### Search institution index by query.
 * - Multi-match search
 */
export const searchInstitutions = async (
  options: SearchOptions,
): Promise<InstitutionWithScore[]> => {
  const result = await elastic.search<InstitutionIndex>({
    index: INSTITUTION_INDEX.index,
    query: {
      multi_match: {
        query: options.query,
        fields: ["title", "location", "country", "website", "type"],
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
