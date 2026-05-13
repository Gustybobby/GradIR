import { elastic } from "@/server/lib/elasticsearch";
import { AUTHOR_INDEX } from "@/server/schema/indexSetting";

export const createAuthorIndex = () => {
  return elastic.indices.create(AUTHOR_INDEX);
};
