import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CommandPaletteProvider } from "@/components/command/command-palette-provider";
import { CosmicBackdrop } from "@/components/space/cosmic-backdrop";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { profile } from "@/lib/content/profile";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — Backend & Distributed Systems Engineer`,
    template: `%s — ${profile.name}`,
  },
  description:
    "Final-year CS undergraduate building reliable distributed systems. FastAPI, PostgreSQL, Redis, Kafka. Codeforces Expert with 2000+ problems solved.",
  keywords: [
    "backend engineer",
    "distributed systems",
    "system design",
    "competitive programming",
    "FastAPI",
    "Kafka",
    "PostgreSQL",
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: profile.name,
    title: `${profile.name} — Backend & Distributed Systems Engineer`,
    description: "This engineer builds reliable distributed systems.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Backend & Distributed Systems Engineer`,
    description: "This engineer builds reliable distributed systems.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05050a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const posts = getAllPosts();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=localStorage.getItem("accent");if(a&&a!=="blue")document.documentElement.dataset.accent=a}catch(e){}`,
          }}
        />
        <CosmicBackdrop />
        <CardSpotlight />
        <CommandPaletteProvider posts={posts}>{children}</CommandPaletteProvider>
      </body>
    </html>
  );
}
