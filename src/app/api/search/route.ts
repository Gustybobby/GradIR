import { searchRankedInstitutions } from "@/server/handlers/search";
import { getJsonBody, handle } from "@/server/lib/handler";
import { SearchOptions } from "@/server/schema/search";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const options = SearchOptions.parse(await getJsonBody(req));
    const result = await searchRankedInstitutions(options);
    return NextResponse.json(result, { status: 200 });
  });
}
