import { decodeSearchParamsToSearchOptions } from "@/server/handlers/search/utils";
import { suggestSearch } from "@/server/handlers/suggest/suggestSearch";
import { handle } from "@/server/lib/handler";
import { connection, NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connection();
  return handle(async () => {
    const searchParams = req.nextUrl.searchParams;
    const options = decodeSearchParamsToSearchOptions(searchParams);
    const scoreThreshold = Number(searchParams.get("threshold") ?? 0.6);
    const result = await suggestSearch(options, scoreThreshold);
    return NextResponse.json(result, { status: 200 });
  });
}
