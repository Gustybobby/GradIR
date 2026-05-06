import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  PAPER_INDEX_NAME,
  PaperIndex,
  PaperWithScore,
} from "@/server/schema/paper";
import { SearchOptions } from "@/server/schema/search";

/**
 * ### Search paper index by query.
 * - Hybrid search (multi-match + semantic)
 * - `doc_score` = gauss_decay(`published_at`, ln(`citations`) * `raw_score`)
 */
export const searchPapers = async (
  options: SearchOptions,
): Promise<PaperWithScore[]> => {
  const result = await elastic
    .search<PaperIndex>({
      index: PAPER_INDEX_NAME,
      retriever: {
        rrf: {
          retrievers: [
            {
              standard: {
                query: {
                  function_score: {
                    query: {
                      multi_match: {
                        query: options.query,
                        fields: ["title^2", "abstract"],
                      },
                    },
                    functions: [
                      {
                        field_value_factor: {
                          field: "citations",
                          modifier: "ln1p",
                          missing: 0,
                        },
                      },
                      {
                        gauss: {
                          published_at: {
                            origin: "now",
                            scale: "7000d",
                            offset: "700d",
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              standard: {
                query: {
                  semantic: {
                    field: "semantic_title",
                    query: options.query,
                  },
                },
              },
            },
          ],
        },
      },
    })
    .catch((error) => {
      const errorInfo = error.meta?.body?.error;
      if (errorInfo) {
        console.error(JSON.stringify(errorInfo));
      }
      throw error;
    });
  const docs = result.hits.hits.map((hit) => ({
    ...hit._source!,
    id: hit._id!,
    raw_score: hit._score ?? 0,
    score: hit._score ?? 0,
  }));
  return prisma.paper
    .findMany({ where: { id: { in: docs.map((doc) => doc.id) } } })
    .then((metas) =>
      metas.map((meta) => ({
        ...meta,
        ...docs.find((doc) => doc.id === meta.id)!,
      })),
    );
};
