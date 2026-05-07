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
    where: { id: data.id },
    create: {
      id: data.id,
      doi: data.doi,
      authors: { connect: data.author_ids.map((id) => ({ id })) },
      institutions: { connect: data.institution_ids.map((id) => ({ id })) },
    },
    update: {
      id: data.id,
      doi: data.doi,
      authors: { set: data.author_ids.map((id) => ({ id })) },
      institutions: { set: data.institution_ids.map((id) => ({ id })) },
    },
  });
  await elastic.index({ index: PAPER_INDEX_NAME, id: paper.id, document });
  return { ...paper, ...document };
};

export const indexManyPapers = async (
  data: PaperUpsert[],
): Promise<Paper[]> => {
  const papers = await prisma.paper
    .createManyAndReturn({
      data: data.map((paper) => ({
        id: paper.id,
        doi: paper.doi,
        authors: { connect: paper.author_ids.map((id) => ({ id })) },
        institutions: { connect: paper.institution_ids.map((id) => ({ id })) },
      })),
    })
    .then((papers) =>
      papers.map((paper) => ({
        ...PaperIndex.parse(data.find((d) => d.id === paper.id)),
        ...paper,
      })),
    );
  const operations = papers.flatMap((paper) => {
    const document = PaperIndex.parse(paper);
    return [{ index: { _index: PAPER_INDEX_NAME, _id: paper.id } }, document];
  });
  await elastic
    .bulk({ index: PAPER_INDEX_NAME, operations })
    .catch(async (error) => {
      await prisma.paper.deleteMany({
        where: { id: { in: papers.map((paper) => paper.id) } },
      });
      throw error;
    });
  return papers;
};
