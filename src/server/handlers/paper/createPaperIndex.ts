import { elastic } from "@/server/lib/elasticsearch";
import { PAPER_INDEX_MAPPINGS, PAPER_INDEX_NAME } from "@/server/schema/paper";

export const createPaperIndex = () => {
  return elastic.indices.create({
    index: PAPER_INDEX_NAME,
    mappings: PAPER_INDEX_MAPPINGS,
  });
};
