# Translation Workflow

## 1. Scope

繁中翻譯是正式產品資料，不是 component 裡的零散 i18n string。Mechanical content 的翻譯必須可追溯來源並可判斷是否因上游改版而過期。

## 2. Locale

- Locale：`zh-TW`。
- 使用台灣常用繁體中文。
- 術語一致性優先於逐字直譯。
- 重要遊戲名詞保留英文原名 metadata，以支援搜尋與 cross-reference；是否在畫面同時顯示由 UI 決定。

## 3. Translation states

建議狀態：

- `DRAFT`：初譯，可修改，不可視為正式發布。
- `REVIEW`：等待人工校閱。
- `APPROVED`：已人工確認，可進正式 build。
- `STALE`：原文來源已改變，需重新比對。

是否增加 `BLOCKED` / `NEEDS_CONTEXT` 等狀態，等實際翻譯批次有需求再加。

## 4. Source change detection

翻譯 entry 應保存足以判斷原文是否改變的 source version / source hash。

Pipeline 行為：

`canonical source changed → hash mismatch → translation STALE → review → APPROVED`

不得因中文字串仍存在就假設翻譯仍然有效。

## 5. Glossary and style guide

正式翻譯批次開始前建立：

- `translation/glossary.yaml`：穩定術語與允許的 alias。
- `translation/style-guide.yaml`：標點、大小寫、數字、keyword、ability text 等風格規則。

Glossary / style guide 應按 task 載入，不把完整術語表塞進 `AGENTS.md`。

## 6. Batch workflow

```text
select canonical batch
→ verify source/version
→ draft translation
→ glossary/style validation
→ human review
→ APPROVED
→ content validation/build
```

AI 可以協助初譯、一致性檢查與 stale diff，但 `APPROVED` 代表人工 reviewer 已看過。

## 7. Search aliases

同一 entity 可有繁中 display name、英文 canonical name 與必要 alias。Alias 是搜尋 metadata，不應透過複製多份規則頁解決。
