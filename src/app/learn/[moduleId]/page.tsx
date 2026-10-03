import { notFound } from "next/navigation";
import { ModuleHome, usesLearnRoute } from "@/modules/registry";
import { getServices } from "@/services/container";

/** 靜態網站：預先產生所有已開放嘅學習入口 */
export const dynamicParams = false;
export async function generateStaticParams() {
  const modules = await getServices().curriculum.listHomeModules();
  return modules
    .filter((m) => m.status === "active" && usesLearnRoute(m))
    .map((m) => ({ moduleId: m.id }));
}

export default async function ModulePage({ params }: PageProps<"/learn/[moduleId]">) {
  const { moduleId } = await params;
  const learningModule = await getServices().curriculum.getModule(moduleId);
  if (!learningModule || learningModule.status !== "active" || !usesLearnRoute(learningModule)) notFound();

  return <ModuleHome module={learningModule} />;
}
