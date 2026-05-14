import { SearchInput } from "@/client/ui/SearchInput";
import { PrimaryHeading } from "@/client/ui/Typography";
import { cn } from "@/client/ui/utils";
import { SearchSuggestion } from "@/server/schema/search";
import React from "react";

interface Props extends SuggestionPopoverProps {
  query: string;
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchHeader({
  query,
  suggestions,
  isLoading,
  onQueryChange,
  onSearch,
  onClickSuggestion,
}: Props) {
  const [focus, setFocus] = React.useState<boolean>(true);
  return (
    <header className="px-2 py-4 mb-8 bg-zinc-900 shadow-md border-b border-border grid grid-cols-7">
      <div className="hidden md:flex items-center justify-center col-span-1">
        <PrimaryHeading className="text-center text-accent">
          GradIR
        </PrimaryHeading>
      </div>
      <form
        className="relative col-span-full md:col-span-5 px-2 flex items-center"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <SearchInput
          name="search-query"
          value={query}
          onValueChange={onQueryChange}
          isLoading={isLoading}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 300)}
        />
        {focus && (
          <SuggestionsPopover
            query={query}
            suggestions={suggestions}
            onClickSuggestion={onClickSuggestion}
          />
        )}
      </form>
    </header>
  );
}

interface SuggestionPopoverProps {
  query: string;
  suggestions?: SearchSuggestion[];
  onClickSuggestion?: (text: string) => void;
}

function SuggestionsPopover({
  query,
  suggestions,
  onClickSuggestion,
}: SuggestionPopoverProps) {
  if (!suggestions?.length) {
    return null;
  }
  return (
    <div
      className={cn(
        "w-[calc(100%-16px)] bg-card absolute top-0 mt-1 translate-y-12",
        "rounded-xl shadow-lg border border-border flex flex-col overflow-hidden",
      )}
    >
      {suggestions?.map((suggestion, idx) => (
        <button
          key={idx}
          className={cn(
            "py-2 pl-10 pr-4 text-start hover:bg-card-header",
            query === suggestion.text ? "bg-card-header" : "",
          )}
          onClick={() => onClickSuggestion?.(suggestion.text)}
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
}
