import { PageHeader } from "@/components/ui/PageHeader";
import { VocabularyBrowser } from "@/features/vocabulary/VocabularyBrowser";

export default function VocabularyPage() {
  return (
    <>
      <PageHeader title="詞語庫">
        <p className="text-lg text-muted">撳詞語聽讀音、睇解釋同例句</p>
      </PageHeader>
      <VocabularyBrowser />
    </>
  );
}
