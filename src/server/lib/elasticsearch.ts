import { Client } from "@elastic/elasticsearch";
import { MgetResponseItem } from "@elastic/elasticsearch/lib/api/types";

export const elastic = new Client({
  node: process.env["ELASTIC_NODE"],
  auth: {
    apiKey: process.env["ELASTIC_API_KEY"]!,
  },
});

export const unwrapMGetOrThrow = <T>(responseItem: MgetResponseItem<T>) => {
  if ("error" in responseItem) {
    throw responseItem.error;
  }
  return responseItem;
};
