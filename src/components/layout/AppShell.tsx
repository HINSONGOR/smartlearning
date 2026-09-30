import Link from "next/link";
import { BottomNav, TopNav } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary"
            >
              學
            </span>
            智學堂
          </Link>
          <TopNav />
          <ThemeToggle />
        </div>
      </header>

      {/* 手機底部導航高 4rem，要預留位置 */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:pb-10">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
