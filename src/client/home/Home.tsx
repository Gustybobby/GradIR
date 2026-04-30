import { HomeSearchBox } from "@/client/home/HomeSearchBox";

export function Home() {
  return (
    <main className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance text-center">
          Graduate Program Search
        </h1>
        <HomeSearchBox />
      </div>
    </main>
  );
}
