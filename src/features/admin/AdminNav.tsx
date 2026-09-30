"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminGate";

const tabs = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/essays", label: "範文" },
  { href: "/admin/vocabulary", label: "詞語" },
  { href: "/admin/examples", label: "例子" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { lock } = useAdmin();
  return (
    <nav aria-label="內容管理" className="mb-6 flex flex-wrap items-center gap-2">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-12 items-center rounded-2xl px-4 font-medium ${
              active ? "bg-primary text-on-primary" : "bg-surface text-muted hover:text-text"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
      <span className="flex-1" />
      <button type="button" onClick={lock} className="h-12 rounded-2xl px-4 text-muted hover:bg-surface-2">
        🔒 鎖上
      </button>
    </nav>
  );
}
