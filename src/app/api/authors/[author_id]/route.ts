import { deleteAuthor } from "@/server/handlers/author/deleteAuthor";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { NextRequest } from "next/server";

export async function DELETE(
  _: NextRequest,
  { params }: RouteContext<"/api/authors/[author_id]">,
) {
  return handle(async () => {
    const { author_id } = await params;
    await authorizeAPIKey();
    await deleteAuthor(author_id);
    return new Response(null, { status: 204 });
  });
}
