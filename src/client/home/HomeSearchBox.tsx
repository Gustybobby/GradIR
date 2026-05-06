"use client";

import { SearchInput } from "@/client/ui/SearchInput";
import { useRouter } from "next/navigation";
import React from "react";

export function HomeSearchBox() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
        router.push(`/search?query=${encodeURIComponent(query.toString())}`);
      }}
    >
      <SearchInput
        id="search-query"
        name="search-query"
        isLoading={isLoading}
      />
    </form>
  );
}
