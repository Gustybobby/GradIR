import { elastic } from "@/server/lib/elasticsearch";
import { getEmbeddings } from "@/server/lib/embedding";
import { prisma } from "@/server/lib/prisma";
import {
  PAPER_INDEX_DEFAULT,
  PaperIndexName,
} from "@/server/schema/indexSetting";
import { Paper, PaperUpsert, PaperIndex } from "@/server/schema/paper";

export const indexPaper = async (
  data: PaperUpsert,
  index: PaperIndexName,
): Promise<Paper> => {
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
  if (index === "paper-eng-sem-bbq") {
    const [title_vector, abstract_vector] = await getEmbeddings([
      document.title || "-",
      document.abstract || "-",
    ]);
    await elastic.index({
      index,
      id: paper.id,
      document: { ...document, title_vector, abstract_vector },
    });
  } else {
    await elastic.index({ index, id: paper.id, document });
  }
  if (index !== "paper-def") {
    await elastic.index({
      index: PAPER_INDEX_DEFAULT.index,
      id: paper.id,
      document,
    });
  }
  return { ...paper, ...document };
};

export const indexManyPapers = async (
  data: PaperUpsert[],
  index: PaperIndexName,
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
  const isSemanticIndex = index === "paper-eng-sem-bbq";
  try {
    const titleEmbeddings = isSemanticIndex
      ? await getEmbeddings(papers.map((paper) => paper.title || "-"))
      : [];
    const abstractEmbeddings = isSemanticIndex
      ? await getEmbeddings(papers.map((paper) => paper.abstract || "-"))
      : [];
    const operations = papers.flatMap((paper, idx) => {
      const document = {
        ...PaperIndex.parse(paper),
        title_vector: titleEmbeddings[idx],
        abstract_vector: abstractEmbeddings[idx],
      };
      return [{ index: { _index: index, _id: paper.id } }, document];
    });
    await elastic.bulk({ index, operations });
  } catch (error) {
    await prisma.paper.deleteMany({
      where: { id: { in: papers.map((paper) => paper.id) } },
    });
    throw error;
  }
  if (index !== "paper-def") {
    const operations = papers.flatMap((paper) => {
      const document = { ...PaperIndex.parse(paper) };
      return [
        { index: { _index: PAPER_INDEX_DEFAULT.index, _id: paper.id } },
        document,
      ];
    });
    await elastic.bulk({ index: PAPER_INDEX_DEFAULT.index, operations });
  }
  return papers;
};
