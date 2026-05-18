import { PaperIndexName } from "@/server/schema/indexSetting";
import z from "zod";

export const SearchOptions = z.object({
  paperIndex: PaperIndexName,
  query: z.string(),
  countries: z.string().optional(),
  paperRetrieverWeights: z
    .object({
      match: z.number(),
      title: z.number(),
      abstract: z.number(),
    })
    .optional(),
});
export type SearchOptions = z.infer<typeof SearchOptions>;

export interface SearchSuggestion {
  text: string;
  score: number;
}
