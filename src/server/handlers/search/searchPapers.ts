import { elastic } from "@/server/lib/elasticsearch";
import { getEmbeddings } from "@/server/lib/embedding";
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
          script_score: {
            script: {
              source: "Math.log(Math.min(doc['citations'].value, 500)+2)",
            },
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

  const highlight: SearchHighlight = {
    fields: { abstract: { pre_tags: [""], post_tags: [""] } },
  };

  const isSemantic = options.paperIndex === "paper-eng-sem-bbq";

  const query_vector = isSemantic
    ? await getEmbeddings([options.query]).then((embeddings) => embeddings[0])
    : undefined;

  const searchRequest: SearchRequest = isSemantic
    ? {
        index: options.paperIndex,
        retriever: {
          linear: {
            retrievers: [
              {
                weight: options.paperRetrieverWeights?.match ?? 0.5,
                normalizer: "minmax",
                retriever: { standard: { query: matchQuery } },
              },
              {
                weight: options.paperRetrieverWeights?.title ?? 0.3,
                normalizer: "minmax",
                retriever: {
                  standard: {
                    query: {
                      knn: { k: SIZE, field: "title_vector", query_vector },
                    },
                  },
                },
              },
              {
                weight: options.paperRetrieverWeights?.abstract ?? 0.2,
                normalizer: "minmax",
                retriever: {
                  standard: {
                    query: {
                      knn: { k: SIZE, field: "abstract_vector", query_vector },
                    },
                  },
                },
              },
            ],
            rank_window_size: SIZE,
          },
        },
        highlight,
        size: SIZE,
      }
    : { index: options.paperIndex, query: matchQuery, highlight, size: SIZE };

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
