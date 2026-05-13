import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { AuthorIndex, AuthorWithScore } from "@/server/schema/author";
import { AUTHOR_INDEX } from "@/server/schema/indexSetting";
import { SearchOptions } from "@/server/schema/search";

/**
 * ### Search author index by query.
 * - Multi-match search
 */
export const searchAuthors = async (
  options: SearchOptions,
): Promise<AuthorWithScore[]> => {
  const result = await elastic.search<AuthorIndex>({
    index: AUTHOR_INDEX.index,
    query: {
      function_score: {
        query: {
          multi_match: {
            query: options.query,
            fields: ["full_name", "display_name", "orcid^3"],
          },
        },
        functions: [
          {
            field_value_factor: {
              field: "h_index",
              modifier: "sqrt",
              missing: 0,
            },
          },
        ],
      },
    },
  });
  const docs = result.hits.hits.map((hit) => ({
    ...hit._source!,
    highlight: hit.highlight ?? {},
    id: hit._id!,
    raw_score: hit._score ?? 0,
    score: hit._score ?? 0,
  }));
  return prisma.author
    .findMany({ where: { id: { in: docs.map((doc) => doc.id) } } })
    .then((metas) =>
      metas.map((meta) => ({
        ...meta,
        ...docs.find((doc) => doc.id === meta.id)!,
      })),
    );
};
