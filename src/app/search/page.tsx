import { Search } from "@/client/search/Search";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}
