import { suggestSearch } from "@/server/handlers/suggest/suggestSearch";
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
    const scoreThreshold = Number(searchParams.get("threshold") ?? 0.6);
    const result = await suggestSearch(options, scoreThreshold);
    return NextResponse.json(result, { status: 200 });
  });
}
