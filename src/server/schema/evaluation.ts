import z from "zod";

export const Evaluation = z.object({
  id: z.number().int(),
  query: z.string(),
  score: z.number(),
  institution_id: z.string(),
});
export type Evaluation = z.infer<typeof Evaluation>;

export const EvaluationCreate = Evaluation.omit({ id: true });
export type EvaluationCreate = z.infer<typeof EvaluationCreate>;
