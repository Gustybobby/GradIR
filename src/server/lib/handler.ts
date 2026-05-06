import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function handle<T>(
  callback: () => Promise<NextResponse<T> | Response>,
): Promise<NextResponse | Response> {
  return callback().catch((error) => {
    console.error(error);
    if (error instanceof Error) {
      if (error.message === "unauthenticated") {
        return NextResponse.json(null, { status: 401 });
      }
      if (error.message === "unauthorized") {
        return NextResponse.json(null, { status: 403 });
      }
    }
    if (error instanceof ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    }
    return NextResponse.json(null, { status: 500 });
  });
}
