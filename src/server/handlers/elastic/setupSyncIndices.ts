import { elastic, unwrapMGetOrThrow } from "@/server/lib/elasticsearch";
import { getEmbeddings } from "@/server/lib/embedding";
import { prisma } from "@/server/lib/prisma";
import { PaperIndex } from "@/server/schema/paper";

export async function setupSyncIndices(start: number): Promise<void> {
  const papers = await prisma.paper.findMany({
    orderBy: { id: "asc" },
    take: 200,
    skip: start,
  });
  if (papers.length === 0) {
    return;
  }
  const paperDocuments = await elastic
    .mget<PaperIndex>({
      index: "paper-def",
      ids: papers.map((paper) => paper.id),
    })
    .then((items) => items.docs.map(unwrapMGetOrThrow));
  const embeddings = await getEmbeddings(
    paperDocuments
      .map((paper) => paper._source!.title || "-")
      .concat(paperDocuments.map((paper) => paper._source!.abstract || "-")),
  );
  const operations = papers.flatMap((paper, idx) => {
    const document = {
      ...PaperIndex.parse(
        paperDocuments.find((doc) => doc._id === paper.id)?._source,
      ),
      title_vector: embeddings[idx],
      abstract_vector: embeddings[idx + embeddings.length / 2],
    };
    return [
      { index: { _index: "paper-eng-sem-bbq", _id: paper.id } },
      document,
    ];
  });
  await elastic.bulk({ index: "paper-eng-sem-bbq", operations });
}
