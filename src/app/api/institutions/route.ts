import {
  indexInstitution,
  indexManyInstitutions,
} from "@/server/handlers/institution/indexInstitution";
import { authorizeAPIKey } from "@/server/lib/auth";
import { getJsonBody, handle } from "@/server/lib/handler";
import { InstitutionUpsert } from "@/server/schema/institution";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = z
      .array(InstitutionUpsert)
      .max(100)
      .parse(await getJsonBody(req));
    const institution = await indexManyInstitutions(data);
    return NextResponse.json(institution, { status: 201 });
  });
}

export async function PUT(req: NextRequest) {
  return handle(async () => {
    await authorizeAPIKey();
    const data = InstitutionUpsert.parse(await getJsonBody(req));
    const institution = await indexInstitution(data);
    return NextResponse.json(institution, { status: data.id ? 200 : 201 });
  });
}
