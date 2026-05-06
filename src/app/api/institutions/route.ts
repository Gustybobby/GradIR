import { indexInstitution } from "@/server/handlers/institution/indexInstitution";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { InstitutionUpsert } from "@/server/schema/institution";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = InstitutionUpsert.parse(await req.json());
    const institution = await indexInstitution(data);
    return NextResponse.json(institution, { status: data.id ? 200 : 201 });
  });
}
