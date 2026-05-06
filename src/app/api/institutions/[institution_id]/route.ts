import { deleteInstitution } from "@/server/handlers/institution/deleteInstitution";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { NextRequest } from "next/server";

export async function DELETE(
  _: NextRequest,
  { params }: RouteContext<"/api/institutions/[institution_id]">,
) {
  return handle(async () => {
    const { institution_id } = await params;
    await authorizeAPIKey();
    await deleteInstitution(institution_id);
    return new Response(null, { status: 204 });
  });
}
