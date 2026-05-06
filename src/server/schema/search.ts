import z from "zod";

export const SearchOptions = z.object({ query: z.string() });
export type SearchOptions = z.infer<typeof SearchOptions>;
