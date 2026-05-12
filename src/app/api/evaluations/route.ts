import { createEvaluation } from "@/server/handlers/evaluation/createEvaluation";
import { getJsonBody, handle } from "@/server/lib/handler";
import { EvaluationCreate } from "@/server/schema/evaluation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const data = EvaluationCreate.parse(await getJsonBody(req));
    const evaluation = await createEvaluation(data);
    return NextResponse.json(evaluation, { status: 201 });
  });
}
