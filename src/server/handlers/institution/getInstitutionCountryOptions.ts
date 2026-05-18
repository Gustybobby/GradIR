import { elastic } from "@/server/lib/elasticsearch";
import { INSTITUTION_INDEX } from "@/server/schema/indexSetting";

export const getInstitutionCountryOptions = async (): Promise<string[]> => {
  const result = await elastic.search({
    index: INSTITUTION_INDEX.index,
    size: 0,
    aggs: {
      distinct_options: {
        terms: { field: "country", size: 100 },
      },
    },
  });

  return (
    result.aggregations?.["distinct_options"] as { buckets: unknown[] }
  ).buckets.map((bucket: unknown) => (bucket as { key: string }).key);
};
