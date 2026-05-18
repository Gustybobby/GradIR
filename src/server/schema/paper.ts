import { Highlight, Score, With } from "@/server/types/util";
import z from "zod";

export const PaperDB = z.object({
  id: z.string(),
  doi: z.string(),
  citations: z.number().int(),
  updated_at: z.date(),
  created_at: z.date(),
});
export type PaperDB = z.infer<typeof PaperDB>;

export const PaperIndex = z.object({
  title: z.string(),
  published_at: z.coerce.date(),
  citations: z.number().int(),
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

export type PaperWithScore = With<Score & Highlight, Paper>;
