import { evaluateSearchNDCG } from "@/server/handlers/evaluation/evaluateSearchNDCG";
import { decodeSearchParamsToSearchOptions } from "@/server/handlers/search/utils";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const searchParams = req.nextUrl.searchParams;
    const options = decodeSearchParamsToSearchOptions(searchParams);
    const at = searchParams.get("at");
    const result = await evaluateSearchNDCG(
      options,
      at ? Number(at) : undefined,
    );
    return NextResponse.json(result, { status: 200 });
  });
}
