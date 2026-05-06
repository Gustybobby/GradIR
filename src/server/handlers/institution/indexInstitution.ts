import { elastic } from "@/server/lib/elasticsearch";
import { prisma } from "@/server/lib/prisma";
import {
  Institution,
  INSTITUTION_INDEX_NAME,
  InstitutionIndex,
  InstitutionUpsert,
} from "@/server/schema/institution";

export const indexInstitution = async (
  data: InstitutionUpsert,
): Promise<Institution> => {
  const document = InstitutionIndex.parse(data);
  const institution = await prisma.institution.upsert({
    where: { id: data.id ?? "" },
    create: {
      address: data.address,
      lat: data.lat,
      long: data.long,
      openalex_id: data.openalex_id,
    },
    update: {
      address: data.address,
      lat: data.lat,
      long: data.long,
      openalex_id: data.openalex_id,
    },
  });
  await elastic.index({
    index: INSTITUTION_INDEX_NAME,
    id: institution.id,
    document,
  });
  return { ...institution, ...document };
};
