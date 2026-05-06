import { HomeSearchBox } from "@/client/home/HomeSearchBox";
import { Paragraph } from "@/client/ui/Typography";

export function Home() {
  return (
    <main className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col w-full items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance text-center mb-2">
          Grad IR: Find Perfect Institutions
        </h1>
        <Paragraph className="italic text-center mb-6">
          Institution search by research fit for Web Information Retrieval 2026
          course, THU
        </Paragraph>
        <HomeSearchBox />
      </div>
    </main>
  );
}
