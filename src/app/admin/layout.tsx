import { AdminGate } from "@/features/admin/AdminGate";
import { AdminNav } from "@/features/admin/AdminNav";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminGate>
      <AdminNav />
      {children}
    </AdminGate>
  );
}
