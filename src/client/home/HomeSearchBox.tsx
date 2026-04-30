"use client";

import { SearchInput } from "@/client/ui/SearchInput";
import { useRouter } from "next/navigation";

export function HomeSearchBox() {
  const router = useRouter();

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
        router.push(`/search?query=${encodeURIComponent(query.toString())}`);
      }}
    >
      <SearchInput id="search-query" name="search-query" />
    </form>
  );
}
