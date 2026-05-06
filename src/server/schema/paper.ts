import { Score, With } from "@/server/types/util";
import z from "zod";

export const PAPER_INDEX_NAME = "paper";

export const PAPER_INDEX_MAPPINGS = {
  properties: {
    semantic_title: { type: "semantic_text" },
    title: { type: "text", copy_to: "semantic_title" },
    abstract: { type: "text" },
    citations: { type: "integer" },
    published_at: { type: "date" },
  },
} as const;

export const PaperDB = z.object({
  id: z.string(),
  doi: z.string(),
  updated_at: z.date(),
  created_at: z.date(),
});
export type PaperDB = z.infer<typeof PaperDB>;

export const PaperIndex = z
  .object({
    title: z.string(),
    published_at: z.date(),
    citations: z.number().int(),
  })
  .extend({
    abstract: z.string(),
  });
export type PaperIndex = z.infer<typeof PaperIndex>;

export const Paper = PaperDB.extend(PaperIndex.shape);
export type Paper = z.infer<typeof Paper>;

export const PaperUpsert = Paper.omit({
  updated_at: true,
  created_at: true,
}).extend({
  author_ids: z.array(z.string()),
  institution_ids: z.array(z.string()),
});
export type PaperUpsert = z.infer<typeof PaperUpsert>;

export type PaperWithScore = With<Score, Paper>;
