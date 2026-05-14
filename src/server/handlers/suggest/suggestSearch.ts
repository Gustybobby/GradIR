import { elastic } from "@/server/lib/elasticsearch";
import { SearchOptions, SearchSuggestion } from "@/server/schema/search";
import { SearchTermSuggest } from "@elastic/elasticsearch/lib/api/types";

const TOP_K = 5;

export const suggestSearch = async (
  options: SearchOptions,
  scoreThreshold: number,
): Promise<SearchSuggestion[]> => {
  const result = await elastic.search({
    index: options.paperIndex,
    suggest: {
      text: options.query,
      title: {
        term: {
          field: "title",
          analyzer: "standard",
        },
      },
      abstract: {
        term: {
          field: "abstract",
          analyzer: "standard",
        },
      },
    },
  });
  const suggest = result.suggest;
  if (!suggest) {
    return [];
  }
  const suggestions: SearchSuggestion[][] = [];

  iterateSuggestions(
    suggest["title"] as SearchTermSuggest[],
    [],
    suggestions,
    scoreThreshold,
  );

  return suggestions
    .map((suggestion) => ({
      text: suggestion.map((term) => term.text).join(" "),
      score:
        suggestion.reduce((acc, curr) => acc + curr.score, 0) /
        suggestion.length,
    }))
    .filter((suggestion) => suggestion.score >= scoreThreshold)
    .sort((a, b) => -a.score + b.score)
    .slice(0, TOP_K);
};

const iterateSuggestions = (
  terms: SearchTermSuggest[],
  suggestion: SearchSuggestion[],
  suggestions: SearchSuggestion[][],
  scoreThreshold: number,
) => {
  if (!terms.length) {
    return;
  }
  const term = terms[0];
  if (!Array.isArray(term.options)) {
    throw new Error("term options is not an array");
  }
  const candidates: SearchSuggestion[] = [
    { text: term.text, score: 1 },
    ...term.options
      .filter((option) => option.score >= scoreThreshold)
      .map((option) => ({ text: option.text, score: option.score })),
  ];
  for (const candidate of candidates) {
    if (terms.length === 1) {
      suggestions.push(suggestion.concat(candidate));
      continue;
    }
    iterateSuggestions(
      terms.slice(1),
      suggestion.concat(candidate),
      suggestions,
      scoreThreshold,
    );
  }
};
