import { searchRankedInstitutions } from "@/server/handlers/search";
import { handle } from "@/server/lib/handler";
import { SearchOptions } from "@/server/schema/search";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const searchParams = req.nextUrl.searchParams;
    const options = SearchOptions.parse({
      paperIndex: searchParams.get("paperIndex"),
      query: searchParams.get("query"),
    } satisfies Record<keyof SearchOptions, unknown>);
    const result = await searchRankedInstitutions(options);
    return NextResponse.json(result, { status: 200 });
  });
}
