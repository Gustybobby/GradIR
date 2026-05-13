import { elastic } from "@/server/lib/elasticsearch";
import { INSTITUTION_INDEX } from "@/server/schema/indexSetting";

export const createInstitutionIndex = () => {
  return elastic.indices.create(INSTITUTION_INDEX);
};
