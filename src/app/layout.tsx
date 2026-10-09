import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Entry Evaluator",
  description: "Strategy-based entry evaluation and trade journal",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Evaluator" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
};

const nav = [
  { href: "/evaluate", label: "Evaluate" },
  { href: "/setups", label: "Setups" },
  { href: "/journal", label: "Journal" },
  { href: "/stats", label: "Stats" },
  { href: "/strategies", label: "Strategies" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2.5">
            <Link href="/journal" className="font-semibold tracking-tight">Entry Evaluator</Link>
            <nav className="-mx-1 flex gap-1 overflow-x-auto text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-md px-2 py-1 text-muted hover:bg-border/40 hover:text-foreground">{n.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</main>
      </body>
    </html>
  );
}
