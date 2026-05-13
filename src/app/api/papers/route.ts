import {
  indexManyPapers,
  indexPaper,
} from "@/server/handlers/paper/indexPaper";
import { authorizeAPIKey } from "@/server/lib/auth";
import { getJsonBody, handle } from "@/server/lib/handler";
import { PaperUpsert } from "@/server/schema/paper";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const INDEX = "paper-def";

export async function POST(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = z.array(PaperUpsert).parse(await getJsonBody(req));
    const result = await indexManyPapers(data, INDEX);
    return NextResponse.json(result, { status: 201 });
  });
}

export async function PUT(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = PaperUpsert.parse(await getJsonBody(req));
    const paper = await indexPaper(data, INDEX);
    const isCreated = paper.created_at.getTime() === paper.updated_at.getTime();
    return NextResponse.json(paper, { status: isCreated ? 201 : 200 });
  });
}
