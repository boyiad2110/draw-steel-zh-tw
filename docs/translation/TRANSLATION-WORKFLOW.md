# Translation Workflow

## 1. Scope

繁中翻譯是正式產品資料，不是 component 裡的零散 i18n string。Mechanical content 的翻譯必須可追溯來源並可判斷是否因上游改版而過期。

本文件定義 repository-level translation workflow；實際翻譯 task 另須載入 `skills/translation/SKILL.md`、已核准的 Batch Contract，以及該批最小必要來源。

## 2. Locale

- Locale：`zh-TW`。
- 使用台灣常用繁體中文。
- 術語一致性優先於逐字直譯。
- 重要遊戲名詞保留英文原名 metadata，以支援搜尋與 cross-reference；是否在畫面同時顯示由 UI 決定。

## 3. Translation authority

翻譯 authority 依資料責任分開管理：

```text
English rules authority
→ pinned canonical source
→ canonical English content

zh-TW terminology authority
→ translation/glossary.yaml

zh-TW writing/style authority
→ translation/style-guide.yaml

entity-specific approved wording
→ translation/zh-TW/**/*.yaml
→ status: APPROVED
```

英文規則語意與來源衝突依 `docs/content/SOURCE-POLICY.md`。新正式中文遊戲術語、正式譯名或會改變語意的翻譯決策屬 Owner 權限；決定必須先固化到 Issue、Batch Contract、ADR 或 repository authority，Agent 不得依賴私有聊天歷史自行補規格。

現有 Draw Steel 繁中材料、舊角色紙、舊專案翻譯與其他 legacy material 都只是 reference input。在逐項對照目前 pinned English source、依 glossary/style guide 整理並經人工核准前，不是 project authority，也不得直接標為 `APPROVED`。

## 4. Translation states

狀態：

- `DRAFT`：初譯，可修改，不可視為正式發布。
- `REVIEW`：等待人工校閱。
- `APPROVED`：已人工確認，可進正式 build。
- `STALE`：原文來源已改變，需重新比對。

是否增加 `BLOCKED` / `NEEDS_CONTEXT` 等狀態，等實際翻譯批次有需求再加。

正常審核流程：

```text
DRAFT
  ↓
REVIEW
  ↓ human review against authoritative English source
APPROVED
```

AI / Agent 可建立或修訂 `DRAFT`、準備 `REVIEW` 並執行一致性檢查，但只有人類 review 可以授權 `APPROVED`。

## 5. Source change detection

翻譯 entry 應保存足以判斷原文是否改變的 source version / source hash。

Pipeline 行為：

`canonical source changed → hash mismatch → translation STALE → review → APPROVED`

不得因中文字串仍存在就假設翻譯仍然有效。

偵測到 source version / hash mismatch 時，該翻譯必須視為 `STALE`，重新比對 authoritative English source 並經人工 review 後才能再次成為 `APPROVED`。現行 validator 只偵測 mismatch，不自動改寫 translation file；自動 mutation 不在目前流程範圍。

## 6. Glossary and style guide

Repository authority：

- `translation/glossary.yaml`：穩定術語與允許的 alias。
- `translation/style-guide.yaml`：標點、大小寫、數字、keyword、ability text 等風格規則。

Glossary / style guide 應按 task 載入，不把完整術語表塞進 `AGENTS.md`。

Glossary 只能加入已由 Owner 核准的正式術語與術語變體。尚未核准的候選譯名留在 task review material，不得先寫入 glossary 當成 authority。Style guide 同樣只記錄已核准的 repository-level 規則。

## 7. Responsibility boundaries

| Data | Authority / owner |
|---|---|
| English canonical name/text | canonical layer |
| English aliases/search synonyms | canonical/search metadata |
| zh-TW display translation | translation layer |
| zh-TW aliases/search synonyms | localization/search metadata |
| shared formal zh-TW terminology | `translation/glossary.yaml` |
| punctuation, number formatting, keyword/text style rules | `translation/style-guide.yaml` |

Glossary 的術語變體與 search aliases 責任不同。本流程只定義 ownership，不新增 alias/search schema。

## 8. Batch workflow

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

若 task 需要新的正式譯名、遇到無法依 authority 解決的語意衝突，或必須修改核准 scope 外的 canonical/schema/runtime，停止並請 Owner 決定。

## 9. Search aliases

同一 entity 可有繁中 display name、英文 canonical name 與必要 alias。Alias 是搜尋 metadata，不應透過複製多份規則頁解決。

English aliases 屬 canonical/search metadata；zh-TW aliases 屬 localization/search metadata。兩者都不應混入 display translation 或 glossary，也不得由本流程推定尚未存在的 schema。
