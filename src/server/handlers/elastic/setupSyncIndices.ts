import { createAuthorIndex } from "@/server/handlers/author/createAuthorIndex";
import { createInstitutionIndex } from "@/server/handlers/institution/createInstitutionIndex";
import { createPaperIndex } from "@/server/handlers/paper/createPaperIndex";
import { elastic } from "@/server/lib/elasticsearch";

export async function setupSyncIndices(
  source?: string,
  dests?: string[],
): Promise<void> {
  await createPaperIndex("paper-def").catch(() => {});
  await createPaperIndex("paper-eng").catch(() => {});
  await createPaperIndex("paper-res").catch(() => {});
  await createPaperIndex("paper-eng-sem").catch(() => {});

  await createAuthorIndex().catch(() => {});

  await createInstitutionIndex().catch(() => {});

  if (!source) {
    return;
  }

  for (const dest of dests ?? []) {
    await elastic.reindex({
      source: { index: source },
      dest: { index: dest },
    });
    console.info("reindex source:", source, "to:", dest);
  }
}
