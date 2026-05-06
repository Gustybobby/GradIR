import { HomeSearchBox } from "@/client/home/HomeSearchBox";

export function Home() {
  return (
    <main className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col w-full items-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance text-center">
          Grad IR: Find Perfect Institutions
        </h1>
        <HomeSearchBox />
      </div>
    </main>
  );
}
