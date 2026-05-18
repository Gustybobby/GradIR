import { getInstitutionCountryOptions } from "@/server/handlers/institution/getInstitutionCountryOptions";
import { handle } from "@/server/lib/handler";
import { NextResponse } from "next/server";

export async function GET() {
  return handle(async () => {
    const data = await getInstitutionCountryOptions();
    return NextResponse.json(data, { status: 200 });
  });
}
