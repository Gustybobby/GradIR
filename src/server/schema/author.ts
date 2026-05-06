import { PaperWithScore } from "@/server/schema/paper";
import { Highlight, Score, With } from "@/server/types/util";
import z from "zod";

export const AUTHOR_INDEX_NAME = "author";

export const AUTHOR_INDEX_MAPPINGS = {
  properties: {
    full_name: { type: "text" },
    display_name: { type: "text" },
    h_index: { type: "integer" },
    orc_id: { type: "keyword" },
    semantic_summary: { type: "semantic_text" },
    summary: { type: "text", copy_to: "semantic_summary" },
  },
} as const;

export const AuthorDB = z.object({
  id: z.string(),
  openalex_id: z.string(),
  updated_at: z.date(),
  created_at: z.date(),
  institution_id: z.string(),
});
export type AuthorDB = z.infer<typeof AuthorDB>;

export const AuthorIndex = z.object({
  full_name: z.string(),
  display_name: z.string(),
  h_index: z.number().int(),
  orcid: z.string(),
  summary: z.string(),
});
export type AuthorIndex = z.infer<typeof AuthorIndex>;

export const Author = AuthorDB.extend(AuthorIndex.shape);
export type Author = z.infer<typeof Author>;

export const AuthorUpsert = Author.omit({
  id: true,
  updated_at: true,
  created_at: true,
}).extend({
  id: z.string().optional(),
});
export type AuthorUpsert = z.infer<typeof AuthorUpsert>;

export type AuthorWithScore = With<Score & Highlight, Author>;

export type AuthorRankedSearchResult = With<
  { papers: PaperWithScore[] },
  AuthorWithScore
>;
