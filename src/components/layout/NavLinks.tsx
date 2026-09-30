"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "./navItems";

function isActive(pathname: string, { href, alsoActive = [] }: NavItem) {
  if (href === "/" ? pathname === "/" : pathname.startsWith(href)) return true;
  return alsoActive.some((p) => pathname.startsWith(p));
}

/** 平板／桌面：頂部橫向導航 */
export function TopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="主要導航" className="hidden gap-2 md:flex">
      {navItems.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-12 items-center gap-2 rounded-2xl px-4 font-medium transition ${
              active
                ? "bg-primary text-on-primary"
                : "text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** 手機：底部導航，拇指容易撳 */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="主要導航"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {navItems.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center text-sm ${
                  active ? "font-bold text-primary" : "text-muted"
                }`}
              >
                <span aria-hidden className="text-2xl leading-none">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
