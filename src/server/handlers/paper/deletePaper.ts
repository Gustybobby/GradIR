import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { PAPER_INDEX_NAME } from "@/server/schema/paper";

export const deletePaper = async (id: string): Promise<void> => {
  await Promise.all([
    prisma.paper.delete({ where: { id } }),
    elastic.delete({ index: PAPER_INDEX_NAME, id }),
  ]);
};
