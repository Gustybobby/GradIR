import { setupSyncIndices } from "@/server/handlers/elastic/setupSyncIndices";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { NextResponse } from "next/server";

export async function POST() {
  return handle(async () => {
    await authorizeAPIKey();
    await setupSyncIndices();
    return NextResponse.json(null, { status: 201 });
  });
}
