import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { LibraryTabs } from "@/features/vocabulary/LibraryTabs";

export default function VocabularyPage() {
  return (
    <>
      <PageHeader title="詞語庫">
        <p className="text-lg text-muted">撳詞語聽讀音、睇解釋同例句；佳句可以借用喺作文入面</p>
        <Link
          href="/dictation"
          className="inline-flex h-14 items-center rounded-2xl bg-primary px-6 text-lg font-bold text-on-primary"
        >
          ✏️ 默書模式
        </Link>
      </PageHeader>
      <LibraryTabs />
    </>
  );
}
