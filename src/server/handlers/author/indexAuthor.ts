import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  Author,
  AUTHOR_INDEX_NAME,
  AuthorIndex,
  AuthorUpsert,
} from "@/server/schema/author";

export const indexAuthor = async (data: AuthorUpsert): Promise<Author> => {
  const document = AuthorIndex.parse(data);
  const author = await prisma.author.upsert({
    where: { id: data.id ?? "" },
    create: {
      openalex_id: data.openalex_id,
      institution_id: data.institution_id,
    },
    update: {
      openalex_id: data.openalex_id,
      institution_id: data.institution_id,
    },
  });
  await elastic.index({ index: AUTHOR_INDEX_NAME, id: author.id, document });
  return { ...author, ...document };
};
