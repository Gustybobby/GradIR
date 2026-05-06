import {
  averageScore,
  getScoreSorted,
  maxScore,
  sumScore,
} from "@/server/handlers/search/utils";
import { elastic, unwrapMGetOrThrow } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  Author,
  AUTHOR_INDEX_NAME,
  AuthorIndex,
  AuthorRankedSearchResult,
  AuthorWithScore,
} from "@/server/schema/author";
import { Paper, PaperWithScore } from "@/server/schema/paper";
import { With } from "@/server/types/util";

/**
 * #### Rank authors
 * - Rank authors by linear combination of normalized author profile and papers score.
 * - `aut_score` = Norm(`aut_raw_score`) + Norm(sum(`aut_paper_score`)) + Norm(avg(`aut_paper_score`))
 * - 2nd term is author's papers score-weighted recall.
 * - 3rd term is author's papers quality.
 */
export const getRankedAuthors = async (
  papers: PaperWithScore[],
  authors: AuthorWithScore[],
  weights: { raw: number; papers_recall: number; papers_quality: number },
): Promise<AuthorRankedSearchResult[]> => {
  const unionAuthors = await getAuthorsByIds(
    authors.map((author) => author.id),
    papers.map((paper) => paper.id),
  );
  const papersRecord = new Map(papers.map((paper) => [paper.id, paper]));
  const authorsRecord = new Map(authors.map((author) => [author.id, author]));

  const paperScoreSum = sumScore(papers) + 1;
  const paperMaxScore = maxScore(papers) + 1;
  const authorScoreSum = sumScore(authors) + 1;

  return getScoreSorted(
    unionAuthors.map((unionAuthor) => {
      const author = authorsRecord.get(unionAuthor.id) ?? {
        ...unionAuthor,
        highlight: {},
        raw_score: 0,
        score: 0,
      };
      const rankedPapers = getScoreSorted(
        unionAuthor.papers.map((paper) => papersRecord.get(paper.id)!),
      );
      const normRawScore = (weights.raw * author.score) / authorScoreSum;
      const normPapersRecallScore =
        (weights.papers_recall * sumScore(rankedPapers)) / paperScoreSum;
      const normPapersQualityScore =
        (weights.papers_quality * averageScore(rankedPapers)) / paperMaxScore;
      const finalScore =
        normRawScore + normPapersRecallScore + normPapersQualityScore;
      return {
        ...author,
        papers: rankedPapers,
        raw_score: normRawScore,
        score: finalScore,
      };
    }),
  );
};

const getAuthorsByIds = async (
  authorIds: string[],
  paperIds: string[],
): Promise<With<{ papers: Pick<Paper, "id">[] }, Author>[]> => {
  if (!authorIds.length && !paperIds.length) {
    return [];
  }
  const authorMetas = await prisma.author.findMany({
    where: {
      OR: [
        { id: { in: authorIds } },
        { papers: { some: { id: { in: paperIds } } } },
      ],
    },
    include: {
      papers: {
        where: { id: { in: paperIds } },
        select: { id: true },
      },
    },
  });
  const authorDocs = await elastic.mget<AuthorIndex>({
    index: AUTHOR_INDEX_NAME,
    ids: authorMetas.map((meta) => meta.id),
  });
  return authorMetas.map((meta) => ({
    ...meta,
    ...unwrapMGetOrThrow(authorDocs.docs.find((doc) => doc._id === meta.id)!)
      ._source!,
  }));
};
