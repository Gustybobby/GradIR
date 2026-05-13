import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { INSTITUTION_INDEX } from "@/server/schema/indexSetting";

export const deleteInstitution = async (id: string): Promise<void> => {
  await Promise.all([
    prisma.institution.delete({ where: { id } }),
    elastic.delete({ index: INSTITUTION_INDEX.index, id }),
  ]);
};
