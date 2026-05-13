import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import { Author, AuthorIndex, AuthorUpsert } from "@/server/schema/author";
import { AUTHOR_INDEX } from "@/server/schema/indexSetting";

export const indexAuthor = async (data: AuthorUpsert): Promise<Author> => {
  const document = AuthorIndex.parse(data);
  const author = await prisma.author.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      institution_id: data.institution_id,
    },
    update: {
      id: data.id,
      institution_id: data.institution_id,
    },
  });
  await elastic.index({ index: AUTHOR_INDEX.index, id: author.id, document });
  return { ...author, ...document };
};

export const indexManyAuthors = async (
  data: AuthorUpsert[],
): Promise<Author[]> => {
  const authors = await prisma.author
    .createManyAndReturn({
      data: data.map((author) => ({
        id: author.id,
        institution_id: author.institution_id,
      })),
    })
    .then((authors) =>
      authors.map((author) => ({
        ...AuthorIndex.parse(data.find((d) => d.id === author.id)),
        ...author,
      })),
    );
  const operations = authors.flatMap((author) => {
    const document = AuthorIndex.parse(author);
    return [
      { index: { _index: AUTHOR_INDEX.index, _id: author.id } },
      document,
    ];
  });
  await elastic
    .bulk({ index: AUTHOR_INDEX.index, operations })
    .catch(async (error) => {
      await prisma.author.deleteMany({
        where: { id: { in: authors.map((author) => author.id) } },
      });
      throw error;
    });
  return authors;
};
