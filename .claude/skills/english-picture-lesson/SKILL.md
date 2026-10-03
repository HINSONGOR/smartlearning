---
name: english-picture-lesson
description: 將用戶提供嘅英文四格圖作文（Word .docx：試卷圖片、範文、公式、Key Words）加入 data/english/lessons.json，並做 Picture–Story Consistency Check 同文法檢查。用戶 @ 英文作文 .docx、講「加英文四格圖題目」、「check 英文範文」時使用。
---

# 英文四格圖作文：加入題目同檢查範文

## 1. 讀取文件

- 文字：用 PowerShell 解壓 `word/document.xml`，同 classify-essay skill 一樣做法。
- 圖片：`word/media/` 入面通常係**一整張試卷圖**。抽出嚟之後**一定要用 Read 睇清楚**每一格畫咗乜。
  - 用 `System.Drawing` 將四格分別剪出嚟，存做 `public/english/lessons/<lesson-id>/panel-1.png` 至 `panel-4.png`。
  - 剪完要用 Read 檢查每一格；確認冇問題之後，刪走整張試卷圖，唔好放上網站。
- 試卷上嘅資料要放入 JSON：
  - 選擇題：放入 `questions`，格式係 `{ text, options, answer }`
  - Key Words：放入 `vocabulary`
  - Writing Requirements：放入 `requirements`，包括 pronoun、tense、minWords、marks

## 2. ⭐ Picture–Story Consistency Check（每篇範文都要做）

Every sample writing must be checked against all four pictures before being approved. The story must not contain any event that contradicts the pictures.

逐格對照，填一個表：

| 圖 | 圖入面畫咗乜 | 範文對應句子 | 一致？ |
|---|---|---|---|

必須全部符合：

1. **跟圖片次序發展**：Picture 1 → 2 → 3 → 4，唔可以加入同圖片矛盾嘅事件。例如圖畫係落車之後先發現銀包唔見，範文就唔可以寫成「趕唔切上車」。
2. **人稱同時態跟試卷要求**：通常係「I」同 Simple Past。
   - 交代「較早發生嘅事」可以用 past perfect，例如 I realised that I had left it on the bus。
   - 結尾唔好突然轉做現在式，例如唔好用「Now I always…」，要用「After that, I always…」或者「That day, I learned to…」。
3. **有清楚嘅 beginning、problem、solution、ending**，每格大約一段。
4. **Picture 4 係「？」**：結局要合理，而且同前三格銜接。
5. **字數**：達到 `requirements.minWords`，C、B、A 都要。
6. **程度**：
   - C：短句、基本詞彙
   - B：P6 一般程度
   - A：豐富詞彙同句式，但唔可以超出小學太多

## 3. 文法檢查（逐句）

- 時態一致；主謂一致；冠詞（a、an、the）；介詞；複數。
- 常見中式英文要改，例如：
  - take a bus to go home → take a bus home
  - From that day on, I learned… → That day, I learned…，或者 From that day on, I always…
- 試卷選項同用字要大細楷一致。
- 用戶原稿：
  - **文法錯誤**：直接改，標籤加「文法已修正」，並逐項列出改動同原因。
  - **情節同圖片矛盾**：唔好自己改。要向用戶說明，並提供改法，等用戶揀。

## 4. 寫入資料

- `data/english/lessons.json`：
  - 用戶原稿放做 B，tags 用 `["原稿"]`
  - Claude 寫嘅 C、A，tags 用 `["Claude 改寫", "待審閱"]`
- `writingFormula`：用戶提供嘅萬用公式放入 `panelGuide`，連 `template` 填充句式。
- 執行 `npm test`：會檢查圖片數量、檔案存在、兩條問題、選擇題答案、A／B／C、字數同人稱。

## 5. 向用戶匯報

- Picture–Story 對照表
- 文法改動表（原本、改為、原因）
- 字數
- 需要用戶決定嘅地方
