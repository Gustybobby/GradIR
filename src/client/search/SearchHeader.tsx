import {
  SearchInput,
  SuggestionPopoverProps,
  SuggestionsPopover,
} from "@/client/ui/SearchInput";
import { PrimaryHeading } from "@/client/ui/Typography";
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
  const [focus, setFocus] = React.useState<boolean>(false);
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
