import type { NextConfig } from "next";

/**
 * 輸出純靜態網站（out/），放上 GitHub Pages。
 * GitHub Pages 網址係 https://<帳戶>.github.io/<repo>/，所以要設定網址前綴；
 * 本機開發唔使設定（NEXT_PUBLIC_BASE_PATH 留空）。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
