import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "智學堂｜中文作文",
  description: "小六中文作文學習系統",
  // 家庭學習用，唔需要俾搜尋器收錄
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme 由 themeInitScript 喺 hydrate 之前設定，所以要 suppressHydrationWarning
    <html lang="zh-HK" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
