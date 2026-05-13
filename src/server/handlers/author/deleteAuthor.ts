import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { AUTHOR_INDEX } from "@/server/schema/indexSetting";

export const deleteAuthor = async (id: string): Promise<void> => {
  await Promise.all([
    prisma.author.delete({ where: { id } }),
    elastic.delete({ index: AUTHOR_INDEX.index, id }),
  ]);
};
