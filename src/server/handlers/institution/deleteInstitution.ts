import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { INSTITUTION_INDEX_NAME } from "@/server/schema/institution";

export const deleteInstitution = async (id: string): Promise<void> => {
  await Promise.all([
    prisma.institution.delete({ where: { id } }),
    elastic.delete({ index: INSTITUTION_INDEX_NAME, id }),
  ]);
};
