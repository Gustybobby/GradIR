import { evaluateSearchNDCG } from "@/server/handlers/evaluation/evaluateSearchNDCG";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { SearchOptions } from "@/server/schema/search";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const searchParams = req.nextUrl.searchParams;
    const options = SearchOptions.parse({
      paperIndex: searchParams.get("paperIndex"),
      query: searchParams.get("query"),
    } satisfies Record<keyof SearchOptions, unknown>);
    const result = await evaluateSearchNDCG(options);
    return NextResponse.json(result, { status: 200 });
  });
}
