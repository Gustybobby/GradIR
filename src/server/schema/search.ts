import { PaperIndexName } from "@/server/schema/indexSetting";
import z from "zod";

export const SearchOptions = z.object({
  paperIndex: PaperIndexName,
  query: z.string(),
});
export type SearchOptions = z.infer<typeof SearchOptions>;
