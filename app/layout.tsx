import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { LbProvider } from "@/components/LbProvider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Big-mama Doc's Project",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LbProvider>
            <main className="min-h-screen flex flex-col items-center gap-4">
              <nav className="flex justify-center w-full max-w-screen-xl mt-4 rounded-xl border border-foreground/10">
                <div className="flex justify-between items-center w-full p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}>Big-mama Doc's Project</Link>
                  </div>
                  <div className="flex gap-2 items-center">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                    <ThemeSwitcher />
                  </div>
                </div>
              </nav>
              <div className="flex flex-col items-center w-full max-w-screen-xl">
                {children}
              </div>
            </main>
          </LbProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
