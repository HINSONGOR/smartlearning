"use client";

import { NavCard } from "@/components/ui/NavCard";
import { useServiceQuery } from "@/hooks/useServiceQuery";

export function AdminDashboard() {
  const counts = useServiceQuery(
    async (s) => ({
      essays: (await s.essays.list()).length,
      vocabulary: (await s.vocabulary.list()).length,
      examples: (await s.examples.list()).length,
    }),
    [],
  );

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">內容管理</h1>
      <ul className="grid gap-4 sm:grid-cols-3">
        <li>
          <NavCard href="/admin/essays" icon="📄" title="範文" subtitle={counts ? `${counts.essays} 篇` : "…"} />
        </li>
        <li>
          <NavCard href="/admin/vocabulary" icon="🔤" title="詞語" subtitle={counts ? `${counts.vocabulary} 個` : "…"} />
        </li>
        <li>
          <NavCard href="/admin/examples" icon="💡" title="例子" subtitle={counts ? `${counts.examples} 個` : "…"} />
        </li>
      </ul>
      <div className="rounded-2xl bg-accent-soft p-4 text-lg">
        <p className="font-bold">注意</p>
        <ul className="mt-1 list-disc space-y-1 pl-6">
          <li>你喺呢度新增、修改或刪除嘅內容，只會儲存喺呢部裝置嘅瀏覽器。</li>
          <li>其他裝置（例如另一部 iPad）唔會同步；清除瀏覽器資料亦會令修改消失。</li>
          <li>原本嘅預設教材唔會被改動。第二版加入雲端資料庫後會解決同步問題。</li>
        </ul>
      </div>
    </section>
  );
}
