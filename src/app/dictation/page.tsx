import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DictationFromQuery } from "@/features/dictation/DictationFromQuery";

export default function DictationPage() {
  return (
    <>
      <PageHeader back={{ href: "/vocabulary", label: "詞語庫" }} title="✏️ 默書">
        <p className="text-lg text-muted">聽讀音、寫詞語，寫完即刻睇筆順</p>
      </PageHeader>
      <Suspense fallback={<p className="text-muted">載入中…</p>}>
        <DictationFromQuery />
      </Suspense>
    </>
  );
}
