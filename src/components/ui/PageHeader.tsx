import Link from "next/link";

interface Props {
  back?: { href: string; label: string };
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}

/** 每頁頂部：返回上一步 + 標題 */
export function PageHeader({ back, eyebrow, title, children }: Props) {
  return (
    <header className="mb-6 space-y-3">
      {back && (
        <Link
          href={back.href}
          className="inline-flex h-11 items-center gap-1 rounded-2xl px-3 text-muted transition hover:bg-surface-2 hover:text-text"
        >
          <span aria-hidden>←</span> {back.label}
        </Link>
      )}
      {eyebrow && <p className="text-muted">{eyebrow}</p>}
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">{title}</h1>
      {children}
    </header>
  );
}
