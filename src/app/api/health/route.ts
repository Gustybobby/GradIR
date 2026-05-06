import { handle } from "@/server/lib/handler";
import { NextResponse } from "next/server";

export async function GET() {
  return handle(async () => {
    return NextResponse.json("ok", { status: 200 });
  });
}
