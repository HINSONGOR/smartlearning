import { NavCard } from "@/components/ui/NavCard";
import { PageHeader } from "@/components/ui/PageHeader";
import type { LearningModule } from "@/domain/types";
import { routes } from "@/lib/routes";
import { getServices } from "@/services/container";

/** 作文模組首頁：揀作文類型（說明文、記敘文…） */
export async function WritingModuleHome({ module }: { module: LearningModule }) {
  const writingTypes = await getServices().curriculum.listWritingTypes(module.id);

  return (
    <>
      <PageHeader back={{ href: routes.home(), label: "首頁" }} title={module.name}>
        <p className="text-lg text-muted">第一步：揀作文類型</p>
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2">
        {writingTypes.map((w) => (
          <li key={w.id}>
            <NavCard
              href={routes.writingType(module.id, w.id)}
              title={w.name}
              subtitle={w.status === "active" ? w.description : "即將推出"}
              disabled={w.status !== "active"}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
