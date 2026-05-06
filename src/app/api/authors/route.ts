import { indexAuthor } from "@/server/handlers/author/indexAuthor";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { AuthorUpsert } from "@/server/schema/author";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = AuthorUpsert.parse(await req.json());
    const author = await indexAuthor(data);
    return NextResponse.json(author, { status: data.id ? 200 : 201 });
  });
}
