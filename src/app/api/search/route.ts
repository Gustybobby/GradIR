import { searchRankedInstitutions } from "@/server/handlers/search";
import { decodeSearchParamsToSearchOptions } from "@/server/handlers/search/utils";
import { handle } from "@/server/lib/handler";
import { connection, NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connection();
  return handle(async () => {
    const options = decodeSearchParamsToSearchOptions(req.nextUrl.searchParams);
    const result = await searchRankedInstitutions(options);
    return NextResponse.json(result, { status: 200 });
  });
}
