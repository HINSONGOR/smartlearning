# 智學堂｜小六中文作文學習系統（Phase 1）

幫小六學生準備呈分試說明文：認識題型、背寫作公式、睇 C／B 範文、學重點詞語、聽讀音、睇筆順、默書。

## 開 app

第一次（或者更新套件之後）先安裝：

```bash
npm install
```

開發模式：

```bash
npm run dev
```

用電腦瀏覽器開 <http://localhost:3000>。

**iPad／手機喺同一個 Wi-Fi 使用：** 開 app 時畫面會顯示 `Network: http://10.x.x.x:3000`，喺 iPad 瀏覽器打呢個網址就得。日常使用建議用正式版（快好多）：

```bash
npm run build
```

```bash
npm start
```

## 功能

| 位置 | 功能 |
|---|---|
| 學習 | 中文作文 → 說明文 → 4 個題型 → 34 條題目；每條題目 6 步：認識題目、寫作公式、構思、重點詞語、例子、範文（C／B，每段按公式上色、背誦模式） |
| 詞語庫 | 搜尋、篩選；詞語卡有 🔊 粵語／普通話讀音、✍️ 筆順（播放、暫停、逐筆、速度） |
| 默書 | 聽讀音 → 寫喺紙上或者 iPad 螢幕 → 對答案睇筆順 → 自己打 ✓／✗ → 再默錯嘅詞語 |
| 內容管理 🔒 | PIN 保護；範文、詞語、例子嘅新增、編輯、刪除、搜尋、篩選 |

說明文 4 個題型：方法／建議型（方法1 方法2）、利弊／影響型（正反）、好處型（正正）、原因型（原因1 原因2）。

## 加內容

**方法一：內容管理（最簡單）**
撳「🔒 內容管理」→ 第一次設定 PIN → 新增範文／詞語／例子。

> ⚠️ 喺內容管理改嘅內容只會儲存喺**嗰部裝置嘅瀏覽器**（localStorage）：其他裝置唔會同步，清除瀏覽器資料會令修改消失。原本教材唔會被改動。第二版加入雲端資料庫後解決。
>
> 忘記 PIN：撳「忘記 PIN？」答一條乘數題就可以重設，內容唔受影響。

**方法二：改 `data/` 入面嘅 JSON（所有裝置都會見到）**

| 檔案 | 內容 |
|---|---|
| `data/subjects.json` | 科目同首頁學習入口（加科目喺度加） |
| `data/writingTypes.json` | 作文類型、考試要求（最少字數、限時） |
| `data/questionTypes.json` | 題型、口訣、四段公式、句式模板、寫作思路、常用論點 |
| `data/topics.json` | 題目、四段大綱、提示 |
| `data/essays.json` | 範文（段落之間空一行） |
| `data/vocabulary.json` | 詞語 |
| `data/examples.json` | 例子 |
| `data/levels.json` | C／B／A 程度（A 目前設為第二版推出） |

改完一定要跑測試，會檢查格式、關聯、段數、字數（最少 300 字，不計標點）同用字（口語、簡體字）：

```bash
npm test
```

**用 Claude 加新範文：** 喺 Claude Code @ 一個 Word 檔，或者講「幫我分類呢篇範文」，會自動用 `.claude/skills/classify-essay` 判斷題型、整理段落、加入資料同跑測試。

## iPad 粵語讀音設定

讀音用裝置內建嘅語音（瀏覽器 Web Speech API），唔使上網、唔使另外付費。無粵語聲音時，app 會顯示提示：

- **iPad／iPhone：** 設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文 → **中文（香港）**
- **Windows：** 設定 → 時間與語言 → 語音 → 新增語音 → **中文（香港）**

## 架構

```
UI（src/app、src/features、src/modules）
 ↓ 只用 Service
Service（src/services）：CurriculumService、EssayService、VocabularyService、ExampleService、TTSService、StrokeOrderService、PinService
 ↓ 只依賴 interface
Repository（src/repositories）：LocalRepository = data/*.json ＋ localStorage 修改
```

- **換雲端資料庫：** 喺 `src/repositories` 加新實作，再喺 `src/services/container.ts` 換上。UI 同 Service 唔使改。
- **換 TTS：** 加一個 `TTSProvider`，例如雲端粵語 TTS。
- **換筆順資料：** 加一個 `StrokeDataSource`，例如香港標準筆順。
- **加科目：** 喺 `data/subjects.json` 加一項；新種類嘅學習模組喺 `src/modules/registry.tsx` 註冊。

筆順資料由 `scripts/copy-stroke-data.mjs` 喺 `npm run dev`／`build` 前自動複製教材用到嘅字。教材以外嘅字會上網讀取。筆順資料來自 Hanzi Writer／Make Me a Hanzi（Arphic Public License），字形同香港標準可能有少許出入。

## 第二版（未做）

- A 進階範文（資料已經準備好）
- 學生寫作區：紙筆練習、撳選四段大綱、計時、列印原稿紙
- 影相 → OCR → AI 批改；AI 題目分析、構思、詞語建議
- 雲端資料庫、多裝置同步、登入
- 其他科目（英文作文、中文、常識），整合 HINSON 中文／常識 app
