import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Entry Evaluator",
  description: "手法基準に基づくエントリー判定とトレードジャーナル",
};

const nav = [
  { href: "/evaluate", label: "判定" },
  { href: "/journal", label: "ジャーナル" },
  { href: "/stats", label: "統計" },
  { href: "/strategies", label: "手法" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/journal" className="font-semibold tracking-tight">Entry Evaluator</Link>
            <nav className="flex gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-muted hover:text-foreground">{n.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
