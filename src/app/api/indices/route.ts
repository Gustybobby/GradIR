import { setupSyncIndices } from "@/server/handlers/elastic/setupSyncIndices";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const searchParams = req.nextUrl.searchParams;
    await setupSyncIndices(Number(searchParams.get("start")!));
    return NextResponse.json(null, { status: 201 });
  });
}
