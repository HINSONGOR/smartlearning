---
name: classify-essay
description: 將用戶提供嘅中文說明文範文（Word .docx 或貼上嘅文字）分類做邊種題型（方法型「方法1 方法2」、影響型「正反」、好處型「正正」…），再加入 data/essays.json 同 data/topics.json。用戶話「幫我分類」、「呢篇係咩題型」、提供新範文、或者 @ 一個範文 .docx 時使用。
---

# 範文分類及加入教材

## 1. 讀取內容

- `.docx`：用 PowerShell 解壓 `word/document.xml`，將 `</w:p>` 換成換行，再去除 XML 標籤：

  ```powershell
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::OpenRead("<檔案路徑>")
  $sr = New-Object System.IO.StreamReader($zip.GetEntry("word/document.xml").Open(), [Text.Encoding]::UTF8)
  $xml = $sr.ReadToEnd(); $sr.Close(); $zip.Dispose()
  [Net.WebUtility]::HtmlDecode((($xml -replace '</w:p>', "`n") -replace '<[^>]+>', ''))
  ```

- 空白 .docx（0 byte）或者讀唔到：直接話俾用戶知，唔好估內容。

## 2. 判斷題型

先睇題目字眼，再用段落內容確認。以 `data/questionTypes.json` 為準。

| 題型 | 口訣 | 題目字眼 | 第2段／第3段 |
|---|---|---|---|
| 方法型 `expository-method` | 方法1 方法2 | 如何、怎樣、應怎樣 | 兩個方法（首先…其次…） |
| 影響型 `expository-impact` | 正反 | 對…的影響 | 一段好處、一段壞處（首先…然而…） |
| 好處型 `expository-benefit` | 正正 | …的好處、有甚麼好處 | 兩個好處（首先…其次…） |
| 利弊型 `expository-pros-cons` | 正反 | 利與弊、利弊 | 同影響型 |
| 原因型 `expository-cause` | — | 為甚麼 | 兩個原因 |
| 建議型 `expository-suggestion` | — | 建議、改善 | 兩個建議 |

- 題目字眼同內容唔一致時，以**內容結構**為準，並向用戶說明。例如「應怎樣珍惜好生活」A 版係「壞處＋方法」。
- 段落結構同題型公式唔一致時，範文照放，用 `paragraphLabels` 逐段寫返真實標籤。
- 以上都唔啱：唔好硬塞，列出最接近嘅題型同原因，問用戶。

## 3. 整理範文

- 刪走文件入面嘅段落標題（例如「第一段：背景＋主題」、「【第二段】」、「📝」）同段首全形空格；四段之間用空行（`\n\n`）分隔。
- **唔好改用戶原文嘅字句**，錯字或者口語都只係列出嚟問用戶。
- 用 `src/lib/text.ts` 嘅 `countChars` 計字（不計標點）。要求係說明文最少 300 字（見 `data/writingTypes.json` 嘅 `requirements`）。
- 程度：用戶原稿預設係 **B**，tags 加 `["原稿"]`。如果用戶要求改寫 C／A：
  - C：簡單詞語、短句，仍然要夠 300 字
  - A：較豐富詞彙、成語、較成熟句式
  - tags 用 `["Claude 改寫", "待審閱"]`
- id 格式：`<topicId>-<level 細楷>`，例如 `protect-environment-b`。

## 4. 寫入資料

1. `data/topics.json`：題目已經存在就沿用佢嘅 id；唔存在就新增。題目要有 `outline`，即係四段大綱，由範文每段嘅重點整理出嚟。
2. `data/essays.json`：新增範文；同一題目同一程度已經有範文，要先問用戶係咪取代。
3. 範文入面有好詞或者連接詞，而 `data/vocabulary.json` 未收錄，可以建議加入（唔使粵拼），等用戶確認。
4. 執行 `npm test`，會檢查格式、關聯 id、段數同字數，必須全部通過。

## 5. 向用戶匯報

用一個表列出：題目、判斷題型（連口訣）、判斷原因（一句）、程度、字數、有冇需要用戶決定嘅地方。
