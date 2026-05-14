import OpenAI from "openai";

export const EMBED_DIMENSIONS = 768;

export const getEmbeddings = async (
  texts: string[],
): Promise<Array<number>[]> => {
  const openai = new OpenAI();
  return openai.embeddings
    .create({
      model: "text-embedding-3-small",
      input: texts,
      dimensions: EMBED_DIMENSIONS,
    })
    .then((response) => response.data.map((embedding) => embedding.embedding));
};
