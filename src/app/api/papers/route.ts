import { indexPaper } from "@/server/handlers/paper/indexPaper";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { PaperUpsert } from "@/server/schema/paper";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = PaperUpsert.parse(await req.json());
    const result = await indexPaper(data);
    return NextResponse.json(result, { status: data.id ? 200 : 201 });
  });
}
