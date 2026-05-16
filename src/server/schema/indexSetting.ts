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
  index: "author",
  mappings: {
    properties: {
      full_name: { type: "keyword" },
      display_name: { type: "keyword" },
      h_index: { type: "integer" },
      orc_id: { type: "keyword" },
    },
  },
} as const satisfies IndicesCreateRequest;

export const INSTITUTION_INDEX = {
  index: "institution",
  settings: {
    analysis: {
      filter: {
        english_stop: {
          type: "stop",
          stopwords: "_english_",
        },
        institution_stop: {
          type: "stop",
          stopwords: [
            "university",
            "institute",
            "college",
            "school",
            "faculty",
            "technology",
            "autonomous",
          ],
        },
      },
      analyzer: {
        institution_analyzer: {
          type: "custom",
          tokenizer: "standard",
          filter: [
            "lowercase",
            "asciifolding",
            "english_stop",
            "institution_stop",
          ],
        },
        location_analyzer: {
          type: "custom",
          tokenizer: "standard",
          filter: ["lowercase", "english_stop", "asciifolding"],
        },
      },
    },
  },
  mappings: {
    properties: {
      title: { type: "text", analyzer: "institution_analyzer" },
      location: { type: "text", analyzer: "location_analyzer" },
      country: { type: "keyword" },
      website: { type: "keyword" },
      type: { type: "keyword" },
    },
  },
} as const satisfies IndicesCreateRequest;
