import { EMBED_DIMENSIONS } from "@/server/lib/embedding";
import { IndicesCreateRequest } from "@elastic/elasticsearch/lib/api/types";
import z from "zod";

export const PAPER_INDEX_DEFAULT = {
  index: "paper-def",
  mappings: {
    properties: {
      title: { type: "text" },
      abstract: { type: "text" },
      citations: { type: "integer" },
      published_at: { type: "date" },
    },
  },
} as const satisfies IndicesCreateRequest;

export const PAPER_INDEX_ENG = {
  index: "paper-eng",
  mappings: {
    properties: {
      title: { type: "text", analyzer: "english" },
      abstract: { type: "text", analyzer: "english" },
      citations: { type: "integer" },
      published_at: { type: "date" },
    },
  },
} as const satisfies IndicesCreateRequest;

export const PAPER_INDEX_ENG_SEM = {
  index: "paper-eng-sem-bbq",
  mappings: {
    properties: {
      title_vector: {
        type: "dense_vector",
        dims: EMBED_DIMENSIONS,
        similarity: "cosine",
        index: true,
        index_options: {
          type: "bbq_hnsw",
          m: 64,
          ef_construction: 400,
        },
      },
      title: { type: "text", analyzer: "english" },
      abstract_vector: {
        type: "dense_vector",
        dims: EMBED_DIMENSIONS,
        similarity: "cosine",
        index: true,
        index_options: {
          type: "bbq_hnsw",
          m: 64,
          ef_construction: 400,
        },
      },
      abstract: { type: "text", analyzer: "english" },
      citations: { type: "integer" },
      published_at: { type: "date" },
    },
  },
} as const satisfies IndicesCreateRequest;

export const PaperIndexName = z.literal([
  PAPER_INDEX_DEFAULT.index,
  PAPER_INDEX_ENG.index,
  PAPER_INDEX_ENG_SEM.index,
]);
export type PaperIndexName = z.infer<typeof PaperIndexName>;

export const AUTHOR_INDEX = {
  index: "author-def",
  mappings: {
    properties: {
      full_name: { type: "keyword" },
      display_name: { type: "keyword" },
      h_index: { type: "integer" },
      orcid: { type: "keyword" },
    },
  },
} as const satisfies IndicesCreateRequest;

export const INSTITUTION_INDEX = {
  index: "institution-def",
  mappings: {
    properties: {
      title: { type: "keyword" },
      location: { type: "keyword" },
      country: { type: "keyword" },
      website: { type: "keyword" },
      type: { type: "keyword" },
    },
  },
} as const satisfies IndicesCreateRequest;
