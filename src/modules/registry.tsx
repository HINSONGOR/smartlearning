import type { LearningModule } from "@/domain/types";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { WritingModuleHome } from "./writing/WritingModuleHome";

/**
 * 按 module.kind 揀用邊套頁面。
 * 將來加新種類（例如 quiz），喺呢度註冊一次就得，唔使寫 if (subject === ...)。
 */
const moduleHomes: Record<
  LearningModule["kind"],
  (props: { module: LearningModule }) => React.ReactNode | Promise<React.ReactNode>
> = {
  writing: WritingModuleHome,
  general: ({ module }) => <PagePlaceholder icon={module.icon} title={module.name} />,
};

export function ModuleHome({ module }: { module: LearningModule }) {
  const Home = moduleHomes[module.kind];
  return <Home module={module} />;
}
