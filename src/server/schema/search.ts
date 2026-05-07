import z from "zod";

export const SearchOptions = z.object({
  query: z.string(),
  semantic: z.boolean().optional(),
});
export type SearchOptions = z.infer<typeof SearchOptions>;
