import {
  averageScore,
  getScoreSorted,
  sumScore,
} from "@/server/handlers/search/utils";
import { elastic, unwrapMGetOrThrow } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  Author,
  AuthorIndex,
  AuthorRankedSearchResult,
  AuthorWithScore,
} from "@/server/schema/author";
import { AUTHOR_INDEX } from "@/server/schema/indexSetting";
import { Paper, PaperWithScore } from "@/server/schema/paper";
import { With } from "@/server/types/util";

export interface AuthorRankConfig {
  top_k: number;
  raw: number;
  recall: number;
  avg: number;
}

/**
 * #### Rank authors
 * - Rank authors by linear combination of normalized author profile and papers score.
 * - `aut_score` = Norm(`aut_raw_score`) + Norm(top_k_sum(`aut_paper_score`)) + Norm(avg(`aut_paper_score`))
 * - 2nd term is author's papers score-weighted recall.
 */
export const getRankedAuthors = async (
  papers: PaperWithScore[],
  authors: AuthorWithScore[],
  config: AuthorRankConfig,
): Promise<AuthorRankedSearchResult[]> => {
  const unionAuthors = await getAuthorsByIds(
    authors.map((author) => author.id),
    papers.map((paper) => paper.id),
  );
  const papersRecord = new Map(papers.map((paper) => [paper.id, paper]));
  const authorsRecord = new Map(authors.map((author) => [author.id, author]));

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
      ).slice(0, config.top_k);
      const { finalScore, normRawScore } = calculateAuthorScore(
        config,
        author,
        rankedPapers,
      );
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
    index: AUTHOR_INDEX.index,
    ids: authorMetas.map((meta) => meta.id),
  });
  return authorMetas.map((meta) => ({
    ...meta,
    ...unwrapMGetOrThrow(authorDocs.docs.find((doc) => doc._id === meta.id)!)
      ._source!,
  }));
};

const calculateAuthorScore = (
  config: AuthorRankConfig,
  author: AuthorWithScore,
  rankedPapers: PaperWithScore[],
) => {
  const normRawScore = config.raw * author.score;
  const normPapersRecallScore = config.recall * sumScore(rankedPapers);
  const normPapersAvgScore = config.avg * averageScore(rankedPapers);
  const finalScore = normRawScore + normPapersRecallScore + normPapersAvgScore;
  return { finalScore, normRawScore };
};
