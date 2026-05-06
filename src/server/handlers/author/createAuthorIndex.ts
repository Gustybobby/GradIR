import { elastic } from "@/server/lib/elasticsearch";
import {
  AUTHOR_INDEX_MAPPINGS,
  AUTHOR_INDEX_NAME,
} from "@/server/schema/author";

export const createAuthorIndex = () => {
  return elastic.indices.create({
    index: AUTHOR_INDEX_NAME,
    mappings: AUTHOR_INDEX_MAPPINGS,
  });
};
