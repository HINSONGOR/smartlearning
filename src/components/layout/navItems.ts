export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "學習", icon: "📚" },
  { href: "/vocabulary", label: "詞語庫", icon: "🔤" },
  { href: "/write", label: "寫作區", icon: "✏️" },
  { href: "/admin", label: "內容管理", icon: "🔒" },
];
