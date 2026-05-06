import { timingSafeEqual } from "crypto";
import { headers } from "next/headers";

export const authorizeAPIKey = async (): Promise<void> => {
  const key = process.env["API_KEY"];
  if (!key) {
    throw new Error("api key is undefined");
  }
  const apiKeyHeaderValue = await headers().then((header) =>
    header.get("x-api-key"),
  );
  if (!apiKeyHeaderValue) {
    throw new Error("unauthenticated");
  }
  if (!timingSafeEqual(Buffer.from(apiKeyHeaderValue), Buffer.from(key))) {
    throw new Error("unauthorized");
  }
};
