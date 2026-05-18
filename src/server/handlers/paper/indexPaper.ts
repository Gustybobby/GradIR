import { chunk } from "@/server/lib/chunk";
import { elastic } from "@/server/lib/elasticsearch";
import { getEmbeddings } from "@/server/lib/embedding";
import { prisma } from "@/server/lib/prisma";
import {
  PAPER_INDEX_DEFAULT,
  PAPER_INDEX_ENG,
  PAPER_INDEX_ENG_SEM,
  PaperIndexName,
} from "@/server/schema/indexSetting";
import { Paper, PaperUpsert, PaperIndex, PaperDB } from "@/server/schema/paper";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export const indexPaper = async (data: PaperUpsert): Promise<Paper> => {
  const document = PaperIndex.parse(data);
  const paper = await upsertPaper(data);

  await Promise.all([
    elastic.index({ index: PAPER_INDEX_DEFAULT.index, id: paper.id, document }),
    elastic.index({ index: PAPER_INDEX_ENG.index, id: paper.id, document }),
    indexVector(paper, document),
  ]);

  return { ...paper, ...document };
};

export const indexManyPapers = async (
  data: PaperUpsert[],
): Promise<Paper[]> => {
  const papers: Paper[] = [];
  for (const segments of chunk(data, 20)) {
    const upsertedSegments = await Promise.all(segments.map(upsertPaper)).then(
      (papers) =>
        papers.map((paper) => ({
          ...PaperIndex.parse(data.find((d) => d.id === paper.id)),
          ...paper,
        })),
    );
    papers.push(...upsertedSegments);
  }
  await Promise.all([
    addManyToIndex("paper-def", papers),
    addManyToIndex("paper-eng", papers),
    addManyToIndex("paper-eng-sem-bbq", papers),
  ]);
  return papers;
};

const upsertPaper = async (data: PaperUpsert) =>
  prisma.paper
    .upsert({
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
    })
    .catch((error) => {
      console.error("something went wrong with", data);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.meta) {
          error.meta["issue"] = data;
        }
      }
      throw error;
    });

const indexVector = async (paper: PaperDB, document: PaperIndex) => {
  const [title_vector, abstract_vector] = await getEmbeddings([
    document.title || "-",
    document.abstract.split(" ").slice(0, 8000).join(" ") || "-",
  ]);
  await elastic.index({
    index: PAPER_INDEX_ENG_SEM.index,
    id: paper.id,
    document: { ...document, title_vector, abstract_vector },
  });
};

const addManyToIndex = async (index: PaperIndexName, papers: Paper[]) => {
  const isSemanticIndex = index === "paper-eng-sem-bbq";
  const titleEmbeddings = isSemanticIndex
    ? await getEmbeddings(papers.map((paper) => paper.title || "-"))
    : [];
  const abstractEmbeddings = isSemanticIndex
    ? await getEmbeddings(
        papers.map(
          (paper) => paper.abstract.split(" ").slice(0, 3000).join(" ") || "-",
        ),
      )
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
};
