import {
  indexAuthor,
  indexManyAuthors,
} from "@/server/handlers/author/indexAuthor";
import { authorizeAPIKey } from "@/server/lib/auth";
import { getJsonBody, handle } from "@/server/lib/handler";
import { AuthorUpsert } from "@/server/schema/author";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = z
      .array(AuthorUpsert)
      .max(100)
      .parse(await getJsonBody(req));
    const author = await indexManyAuthors(data);
    return NextResponse.json(author, { status: 201 });
  });
}

export async function PUT(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = AuthorUpsert.parse(await getJsonBody(req));
    const author = await indexAuthor(data);
    return NextResponse.json(author, { status: data.id ? 200 : 201 });
  });
}
