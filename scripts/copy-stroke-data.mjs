/**
 * 將教材用到嘅漢字筆順資料，由 hanzi-writer-data 複製去 public/stroke-data/。
 * 咁 app 唔使連網都可以顯示筆順；教材以外嘅字會由 StrokeOrderService 改用網上資料。
 * 喺 npm run dev／build 之前自動執行。
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "node_modules", "hanzi-writer-data");
const target = path.join(root, "public", "stroke-data");

const chars = new Set();
for (const file of fs.readdirSync(path.join(root, "data"))) {
  if (!file.endsWith(".json")) continue;
  const text = fs.readFileSync(path.join(root, "data", file), "utf8");
  for (const c of text) if (/\p{Script=Han}/u.test(c)) chars.add(c);
}

fs.mkdirSync(target, { recursive: true });
const missing = [];
let copied = 0;
for (const c of chars) {
  const from = path.join(source, `${c}.json`);
  if (!fs.existsSync(from)) {
    missing.push(c);
    continue;
  }
  fs.copyFileSync(from, path.join(target, `${c}.json`));
  copied++;
}
console.log(`筆順資料：複製 ${copied} 個字；無資料 ${missing.length} 個${missing.length ? `（${missing.join("")}）` : ""}`);
