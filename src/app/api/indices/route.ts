import { createPaperIndex } from "@/server/handlers/paper/createPaperIndex";
import { createAuthorIndex } from "@/server/handlers/author/createAuthorIndex";
import { createInstitutionIndex } from "@/server/handlers/institution/createInstitutionIndex";
import { authorizeAPIKey } from "@/server/lib/auth";
import { handle } from "@/server/lib/handler";
import { NextResponse } from "next/server";

export async function POST() {
  return handle(async () => {
    await authorizeAPIKey();

    const paperIndex = await createPaperIndex().catch(() => null);
    console.info("created", paperIndex);

    const authorIndex = await createAuthorIndex().catch(() => null);
    console.info("created", authorIndex);

    const institutionIndex = await createInstitutionIndex().catch(() => null);
    console.info("created", institutionIndex);

    return NextResponse.json(
      { paperIndex, authorIndex, institutionIndex },
      { status: 201 },
    );
  });
}
