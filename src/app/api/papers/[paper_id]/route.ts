import { deletePaper } from "@/server/handlers/paper/deletePaper";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { NextRequest } from "next/server";

export async function DELETE(
  _: NextRequest,
  { params }: RouteContext<"/api/papers/[paper_id]">,
) {
  return handle(async () => {
    const { paper_id } = await params;
    await authorizeAPIKey();
    await deletePaper(paper_id);
    return new Response(null, { status: 204 });
  });
}
