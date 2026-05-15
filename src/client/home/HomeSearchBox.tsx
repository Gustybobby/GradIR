"use client";

import { useTypewriter } from "@/client/hooks/useTypewriter";
import { SearchInput } from "@/client/ui/SearchInput";
import { useRouter } from "next/navigation";
import React from "react";

const PLACEHOLDERS = [
  "Search...",
  "Reinforcement Learning",
  "Quantum Computing Algorithms",
  "Biomedical AI",
];

export function HomeSearchBox() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const placeholder = useTypewriter({
    textQueue: PLACEHOLDERS,
    charIntervalMs: 40,
  });

  return (
    <form
      className="w-full md:w-3/4 px-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get("search-query");
        if (!query) {
          return;
        }
        setIsLoading(true);
        const searchParams = new URLSearchParams({ query: query.toString() });
        router.push(`/search?${searchParams.toString()}`);
      }}
    >
      <SearchInput
        id="search-query"
        name="search-query"
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </form>
  );
}
