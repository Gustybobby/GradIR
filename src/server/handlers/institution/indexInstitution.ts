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
    where: { id: data.id },
    create: {
      id: data.id,
      address: data.address,
      lat: data.lat,
      long: data.long,
    },
    update: {
      id: data.id,
      address: data.address,
      lat: data.lat,
      long: data.long,
    },
  });
  await elastic.index({
    index: INSTITUTION_INDEX_NAME,
    id: institution.id,
    document,
  });
  return { ...institution, ...document };
};

export const indexManyInstitutions = async (
  data: InstitutionUpsert[],
): Promise<Institution[]> => {
  const institutions = await prisma.institution
    .createManyAndReturn({
      data: data.map((institution) => ({
        id: institution.id,
        address: institution.address,
        lat: institution.lat,
        long: institution.long,
      })),
    })
    .then((institutions) =>
      institutions.map((institution) => ({
        ...InstitutionIndex.parse(data.find((d) => d.id === institution.id)),
        ...institution,
      })),
    );
  const operations = institutions.flatMap((institution) => {
    const document = InstitutionIndex.parse(institution);
    return [
      { index: { _index: INSTITUTION_INDEX_NAME, _id: institution.id } },
      document,
    ];
  });
  await elastic.bulk({ index: INSTITUTION_INDEX_NAME, operations });
  return institutions;
};
