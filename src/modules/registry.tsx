import type { LearningModule } from "@/domain/types";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { englishRoutes, routes } from "@/lib/routes";
import { WritingModuleHome } from "./writing/WritingModuleHome";

type ModuleKind = LearningModule["kind"];

/**
 * 每種學習入口嘅網址。
 * 將來加新種類（例如 quiz），喺呢度註冊一次就得，唔使寫 if (subject === ...)。
 */
const moduleRoutes: Record<ModuleKind, (module: LearningModule) => string> = {
  writing: (m) => routes.module(m.id),
  general: (m) => routes.module(m.id),
  // 英文作文有自己一套頁面（/english-writing/...）
  "english-writing": () => englishRoutes.home(),
};

export function moduleHref(module: LearningModule) {
  return moduleRoutes[module.kind](module);
}

/** 用 /learn/[moduleId] 頁面顯示嘅種類，同埋佢哋嘅首頁 */
const learnModuleHomes: Partial<
  Record<ModuleKind, (props: { module: LearningModule }) => React.ReactNode | Promise<React.ReactNode>>
> = {
  writing: WritingModuleHome,
  general: ({ module }) => <PagePlaceholder icon={module.icon} title={module.name} />,
};

export function usesLearnRoute(module: LearningModule) {
  return module.kind in learnModuleHomes;
}

export function ModuleHome({ module }: { module: LearningModule }) {
  const Home = learnModuleHomes[module.kind];
  return Home ? <Home module={module} /> : null;
}
