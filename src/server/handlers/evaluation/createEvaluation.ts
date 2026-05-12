import { prisma } from "@/server/lib/prisma";
import { Evaluation, EvaluationCreate } from "@/server/schema/evaluation";

export async function createEvaluation(
  data: EvaluationCreate,
): Promise<Evaluation> {
  return prisma.evaluation.create({ data });
}
