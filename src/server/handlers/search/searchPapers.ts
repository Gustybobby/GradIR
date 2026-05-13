import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { PaperIndex, PaperWithScore } from "@/server/schema/paper";
import { SearchOptions } from "@/server/schema/search";
import {
  QueryDslQueryContainer,
  SearchHighlight,
  SearchRequest,
} from "@elastic/elasticsearch/lib/api/types";

const SIZE = 20;

/**
 * ### Search paper index by query.
 * - Hybrid search (multi-match + semantic)
 * - `doc_score` = gauss_decay(`published_at`, ln(`citations`) * `raw_score`)
 */
export const searchPapers = async (
  options: SearchOptions,
): Promise<PaperWithScore[]> => {
  const matchQuery: QueryDslQueryContainer = {
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
  };

  const semanticTitleQuery: QueryDslQueryContainer = {
    semantic: {
      field: "semantic_title",
      query: options.query,
    },
  };

  const semanticAbstractQuery: QueryDslQueryContainer = {
    semantic: {
      field: "semantic_abstract",
      query: options.query,
    },
  };

  const highlight: SearchHighlight = {
    fields: {
      abstract: { pre_tags: [""], post_tags: [""] },
    },
  };

  const searchRequest: SearchRequest =
    options.paperIndex === "paper-eng-sem"
      ? {
          index: options.paperIndex,
          retriever: {
            rrf: {
              retrievers: [
                { standard: { query: matchQuery } },
                { standard: { query: semanticTitleQuery } },
                { standard: { query: semanticAbstractQuery } },
              ],
            },
          },
          highlight,
          size: SIZE,
        }
      : {
          index: options.paperIndex,
          query: matchQuery,
          highlight,
          size: SIZE,
        };

  const result = await elastic.search<PaperIndex>(searchRequest);
  const docs = result.hits.hits.map((hit) => ({
    ...hit._source!,
    highlight: hit.highlight ?? {},
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
