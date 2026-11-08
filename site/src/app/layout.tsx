import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CHANNEL_URL } from "@/lib/catalog";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Orb Battleground",
    template: "%s · Orb Battleground",
  },
  description:
    "Fighters, the courses they race, and how layer health changes who finishes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TooltipProvider>
          <SiteHeader />
          <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-8 break-words sm:px-6 sm:py-12">
            {children}
          </main>
          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground sm:px-6">
              <p>Orb Race clears your own layers. Classic is the last living team.</p>
              <a href={CHANNEL_URL} target="_blank" rel="noreferrer">
                Watch the channel
              </a>
            </div>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
