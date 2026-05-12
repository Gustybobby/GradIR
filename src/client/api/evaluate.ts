import { Evaluation, EvaluationCreate } from "@/server/schema/evaluation";

export const evaluate = async (data: EvaluationCreate): Promise<Evaluation> => {
  const response = await fetch("/api/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};
