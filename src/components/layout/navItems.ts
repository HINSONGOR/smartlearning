export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** 其他屬於呢個分頁嘅網址 */
  alsoActive?: string[];
}

export const navItems: NavItem[] = [
  { href: "/", label: "學習", icon: "📚", alsoActive: ["/learn", "/english-writing"] },
  { href: "/vocabulary", label: "詞語庫", icon: "🔤", alsoActive: ["/dictation"] },
  { href: "/admin", label: "內容管理", icon: "🔒" },
];
