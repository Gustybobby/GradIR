import { elastic } from "@/server/lib/elasticsearch";
import {
  INSTITUTION_INDEX_MAPPINGS,
  INSTITUTION_INDEX_NAME,
} from "@/server/schema/institution";

export const createInstitutionIndex = () => {
  return elastic.indices.create({
    index: INSTITUTION_INDEX_NAME,
    mappings: INSTITUTION_INDEX_MAPPINGS,
  });
};
