"use client";

import { SearchIcon } from "lucide-react";

interface Props {
  id?: string;
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function SearchInput({ onValueChange, ...props }: Props) {
  return (
    <div
      className="bg-input rounded-full w-full outline-none border-2 border-transparent has-[[data-slot=input-control]:focus-visible]:border-border transition-colors flex items-center"
      onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
    >
      <div className="px-2 h-full flex items-center">
        <SearchIcon />
      </div>
      <input
        className="w-full outline-none py-2 rounded-r-full"
        data-slot="input-control"
        placeholder="Search..."
        autoComplete="off"
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
}
