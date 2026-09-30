/**
 * 主題清單。加新主題只需要兩步：
 *   1. 喺呢度加一項（id、名稱、圖示）
 *   2. 喺 src/app/globals.css 加一組 :root[data-theme="<id>"] { ...顏色 }
 */
export const themes = [
  { id: "light", label: "淺色", icon: "☀️" },
  { id: "dark", label: "深色", icon: "🌙" },
] as const;

export type Theme = (typeof themes)[number]["id"];

export const THEME_STORAGE_KEY = "smartlearning-theme";

const themeIds = JSON.stringify(themes.map((t) => t.id));

/**
 * 喺 <head> 最早執行，喺畫面出現之前設定 data-theme，避免閃色。
 * 無儲存設定時跟系統；localStorage 用唔到（私隱模式等）都唔會出錯。
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(${themeIds}.indexOf(t)<0){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export function isTheme(value: unknown): value is Theme {
  return themes.some((t) => t.id === value);
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 儲存失敗只係下次唔記得，唔影響使用
  }
}
