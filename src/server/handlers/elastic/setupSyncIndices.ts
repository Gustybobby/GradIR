import { createAuthorIndex } from "@/server/handlers/author/createAuthorIndex";
import { createInstitutionIndex } from "@/server/handlers/institution/createInstitutionIndex";
import { createPaperIndex } from "@/server/handlers/paper/createPaperIndex";

export async function setupSyncIndices(): Promise<void> {
  await createPaperIndex("paper-def");
  await createPaperIndex("paper-eng");
  await createPaperIndex("paper-eng-sem-bbq");

  await createAuthorIndex();

  await createInstitutionIndex();
}
