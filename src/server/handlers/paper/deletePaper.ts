import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  PAPER_INDEX_DEFAULT,
  PAPER_INDEX_ENG,
  PAPER_INDEX_ENG_SEM,
} from "@/server/schema/indexSetting";

export const deletePaper = async (id: string): Promise<void> => {
  await Promise.allSettled([
    prisma.paper.delete({ where: { id } }),
    elastic.delete({ index: PAPER_INDEX_DEFAULT.index, id }),
    elastic.delete({ index: PAPER_INDEX_ENG.index, id }),
    elastic.delete({ index: PAPER_INDEX_ENG_SEM.index, id }),
  ]);
};
