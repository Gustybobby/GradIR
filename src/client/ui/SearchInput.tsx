"use client";

import { Spinner } from "@/client/ui/Spinner";
import { cn } from "@/client/ui/utils";
import { SearchSuggestion } from "@/server/schema/search";
import { SearchIcon } from "lucide-react";
import React from "react";

interface Props extends React.ComponentProps<"input"> {
  isLoading?: boolean;
  onValueChange?: (value: string) => void;
}

export function SearchInput({ isLoading, onValueChange, ...props }: Props) {
  return (
    <div
      className="bg-input rounded-full w-full outline-none border-2 border-transparent has-[[data-slot=input-control]:focus-visible]:border-border transition-colors flex items-center"
      onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
    >
      <div className="px-2 h-full flex items-center">
        {isLoading ? <Spinner /> : <SearchIcon />}
      </div>
      <input
        className="w-full outline-none py-2 rounded-r-full text-lg"
        data-slot="input-control"
        placeholder="Search..."
        autoComplete="off"
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
}

export interface SuggestionPopoverProps {
  query: string;
  suggestions?: SearchSuggestion[];
  onClickSuggestion?: (text: string) => void;
}

export function SuggestionsPopover({
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
