import { elastic } from "@/server/lib/elasticsearch";
import {
  PAPER_INDEX_DEFAULT,
  PAPER_INDEX_ENG,
  PAPER_INDEX_ENG_SEM,
  PaperIndexName,
} from "@/server/schema/indexSetting";

export const createPaperIndex = (index: PaperIndexName) => {
  return elastic.indices.create(
    index === "paper-def"
      ? PAPER_INDEX_DEFAULT
      : index === "paper-eng"
        ? PAPER_INDEX_ENG
        : PAPER_INDEX_ENG_SEM,
  );
};
