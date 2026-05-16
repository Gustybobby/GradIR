import { AuthorRankedSearchResult } from "@/server/schema/author";
import { PaperWithScore } from "@/server/schema/paper";
import { Score, With } from "@/server/types/util";
import z from "zod";

export const InstitutionDB = z.object({
  id: z.string(),
  address: z.string(),
  location: z.string(),
  lat: z.number(),
  long: z.number(),
  updated_at: z.date(),
  created_at: z.date(),
});
export type InstitutionDB = z.infer<typeof InstitutionDB>;

export const InstitutionIndex = z.object({
  title: z.string(),
  location: z.string(),
  country: z.string(),
  website: z.string(),
  type: z.string(),
});
export type InstitutionIndex = z.infer<typeof InstitutionIndex>;

export const Institution = InstitutionDB.extend(InstitutionIndex.shape);
export type Institution = z.infer<typeof Institution>;

export const InstitutionUpsert = Institution.omit({
  updated_at: true,
  created_at: true,
});
export type InstitutionUpsert = z.infer<typeof InstitutionUpsert>;

export type InstitutionWithScore = With<Score, Institution>;

export type InstitutionRankedSearchResult = With<
  { authors: AuthorRankedSearchResult[]; evalCount: number },
  InstitutionWithScore
>;

export type CompressedInstitution = With<
  {
    authors: With<
      { paper_ids: PaperWithScore["id"][] },
      Omit<AuthorRankedSearchResult, "papers">
    >[];
    evalCount: number;
  },
  InstitutionWithScore
>;

export type CompressedInstitutionRankedSearchResult = {
  institutions: CompressedInstitution[];
  papers: PaperWithScore[];
};
