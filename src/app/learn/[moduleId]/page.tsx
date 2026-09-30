import { notFound } from "next/navigation";
import { ModuleHome } from "@/modules/registry";
import { getServices } from "@/services/container";

export default async function ModulePage({ params }: PageProps<"/learn/[moduleId]">) {
  const { moduleId } = await params;
  const learningModule = await getServices().curriculum.getModule(moduleId);
  if (!learningModule || learningModule.status !== "active") notFound();

  return <ModuleHome module={learningModule} />;
}
