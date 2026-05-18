import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function handle<T>(
  callback: () => Promise<NextResponse<T> | Response>,
): Promise<NextResponse | Response> {
  return callback().catch((error) => {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    }
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            message: "unique constraint violation",
            issue: error.meta?.["issue"],
          },
          { status: 409 },
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            message: "foreign key constraint violation",
            issue: error.meta?.["issue"],
          },
          { status: 409 },
        );
      }
    }
    if (error instanceof Error) {
      if (error.message === "unauthenticated") {
        return NextResponse.json(error.message, { status: 401 });
      }
      if (error.message === "unauthorized") {
        return NextResponse.json(error.message, { status: 403 });
      }
      if (error.message === "invalid json") {
        return NextResponse.json(error.message, { status: 400 });
      }
    }
    return NextResponse.json(null, { status: 500 });
  });
}

export const getJsonBody = (req: Request): Promise<unknown> =>
  req.json().catch(() => {
    throw new Error("invalid json");
  });
