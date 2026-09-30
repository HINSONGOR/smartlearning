import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { VocabularyBrowser } from "@/features/vocabulary/VocabularyBrowser";

export default function VocabularyPage() {
  return (
    <>
      <PageHeader title="詞語庫">
        <p className="text-lg text-muted">撳詞語聽讀音、睇解釋同例句</p>
        <Link
          href="/dictation"
          className="inline-flex h-14 items-center rounded-2xl bg-primary px-6 text-lg font-bold text-on-primary"
        >
          ✏️ 默書模式
        </Link>
      </PageHeader>
      <VocabularyBrowser />
    </>
  );
}
