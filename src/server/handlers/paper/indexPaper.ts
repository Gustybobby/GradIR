import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  Paper,
  PAPER_INDEX_NAME,
  PaperUpsert,
  PaperIndex,
} from "@/server/schema/paper";

export const indexPaper = async (data: PaperUpsert): Promise<Paper> => {
  const document = PaperIndex.parse(data);
  const paper = await prisma.paper.upsert({
    where: { id: data.id ?? "" },
    create: {
      doi: data.doi,
      openalex_id: data.openalex_id,
      authors: { connect: data.author_ids.map((id) => ({ id })) },
      institutions: { connect: data.institution_ids.map((id) => ({ id })) },
    },
    update: {
      doi: data.doi,
      openalex_id: data.openalex_id,
      authors: { set: data.author_ids.map((id) => ({ id })) },
      institutions: { set: data.institution_ids.map((id) => ({ id })) },
    },
  });
  await elastic.index({ index: PAPER_INDEX_NAME, id: paper.id, document });
  return { ...paper, ...document };
};
