import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const llpixel = localFont({
  src: "./assets/htpixel.ttf",
  variable: "--font-llpixel",
});

export const metadata: Metadata = {
  title: {
    default:
      "Hack TUES X – Единственият хакатон в България, организиран от ученици за ученици",
    template: "%s | Hack TUES X",
  },
  description: "Hack TUES",
  openGraph: {
    title: {
      default: "Hack TUES X",
      template: "%s | Hack TUES X",
    },
    description:
      "Единственият хакатон в България, организиран от ученици за ученици. ⌛",
    url: "https://hacktues.bg",
    siteName: "Hack TUES X",
    locale: "bg_BG",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body
        className={cn(
          "dark relative min-h-screen overflow-x-hidden bg-background font-sans antialiased",
          inter.variable,
          llpixel.variable,
        )}
      >
        <div className="absolute inset-0 -z-50 h-full bg-[url(./assets/bg-grid.png)] bg-[length:80px_80px] bg-repeat-round [mask-image:linear-gradient(to_bottom,transparent,10%,white,90%,transparent)]" />
        <main className="flex min-h-screen items-center justify-center overflow-x-clip p-6">
          <section className="flex w-full max-w-md flex-col gap-5">
            <Card className="w-full p-6">{children}</Card>
            <Separator />
            <p className="text-center text-xl">
              <Link
                href="https://hacktues.bg"
                className="font-llpixel text-brand"
              >
                Hack&nbsp;TUES&nbsp;<span className="text-sand">X</span>
              </Link>
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
