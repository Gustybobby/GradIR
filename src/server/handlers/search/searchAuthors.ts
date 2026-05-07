import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  AUTHOR_INDEX_NAME,
  AuthorIndex,
  AuthorWithScore,
} from "@/server/schema/author";
import { SearchOptions } from "@/server/schema/search";
import { RRFRetrieverEntry } from "@elastic/elasticsearch/lib/api/types";

/**
 * ### Search author index by query.
 * - Hybrid search (multi-match + semantic)
 */
export const searchAuthors = async (
  options: SearchOptions,
): Promise<AuthorWithScore[]> => {
  const retrievers: RRFRetrieverEntry[] = [
    {
      standard: {
        query: {
          function_score: {
            query: {
              multi_match: {
                query: options.query,
                fields: ["full_name", "display_name", "orcid", "summary^2"],
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
      },
    },
  ];

  if (options.semantic) {
    retrievers.push({
      standard: {
        query: {
          semantic: {
            field: "semantic_summary",
            query: options.query,
          },
        },
      },
    });
  }

  const result = await elastic.search<AuthorIndex>({
    index: AUTHOR_INDEX_NAME,
    retriever: { rrf: { retrievers } },
    highlight: {
      fields: {
        summary: {},
        semantic_summary: {},
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
