import Link from "next/link";

export default function NotFound() {
  return (
    <section className="rounded-3xl border border-border bg-surface p-8 text-center">
      <div aria-hidden className="mb-3 text-5xl">
        🧭
      </div>
      <h1 className="text-2xl font-bold">搵唔到呢一頁</h1>
      <p className="mt-2 text-muted">可能係內容未推出，或者網址打錯咗。</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-14 items-center rounded-2xl bg-primary px-6 text-lg font-bold text-on-primary"
      >
        返回首頁
      </Link>
    </section>
  );
}
