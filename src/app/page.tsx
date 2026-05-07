import { Home } from "@/client/home/Home";
import { prisma } from "@/server/lib/prisma";
import { cacheLife } from "next/cache";

export default async function HomePage() {
  "use cache";
  cacheLife("hours");

  const [institutionCount, authorCount, paperCount] = await Promise.all([
    prisma.institution.count(),
    prisma.author.count(),
    prisma.paper.count(),
  ]);
  return (
    <Home
      institutionCount={institutionCount}
      authorCount={authorCount}
      paperCount={paperCount}
    />
  );
}
