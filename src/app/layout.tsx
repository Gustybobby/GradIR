import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GradIR",
  description:
    "Institution search by research fit for Web Information Retrieval 2026 course, THU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="text-white bg-primary-background">{children}</div>
      </body>
    </html>
  );
}
