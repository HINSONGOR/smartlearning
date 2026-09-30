// 第 1 步：暫時嘅首頁。第 2 步之後會改為讀 /data 嘅科目設定。
export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-on-primary">
        <p className="text-lg opacity-90">小六中文</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">中文作文</h1>
        <p className="mt-3 text-lg opacity-90">一步一步學識寫說明文</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["說明文", "記敘文", "議論文", "實用文"].map((name, i) => (
          <div
            key={name}
            className="flex min-h-28 flex-col justify-center rounded-3xl border border-border bg-surface p-6"
          >
            <span className="text-2xl font-bold">{name}</span>
            <span className={i === 0 ? "text-primary" : "text-muted"}>
              {i === 0 ? "準備中" : "即將推出"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
