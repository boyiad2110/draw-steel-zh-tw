---
name: draw-steel-translation
description: Use for planning, drafting, reviewing, or validating zh-TW Draw Steel translation batches in the 英雄爭鋒 repository.
metadata:
  project: draw-steel-zh-tw
  version: "1.0.0"
---

# 英雄爭鋒 Translation

## Purpose

本 Skill 提供繁中翻譯 task 所需的最小 authority、責任邊界與工作流程。它不授權擴大產品範圍、改寫英文 canonical content、決定新正式譯名，或把未經人工確認的翻譯標為 `APPROVED`。

## Required context

依最小必要 Context 載入：

1. `AGENTS.md`。
2. 本次已核准的 Batch Contract。
3. `docs/translation/TRANSLATION-WORKFLOW.md`。
4. `docs/content/CONTENT-MODEL.md` 與 `docs/content/SOURCE-POLICY.md` 中和本批直接相關的段落。
5. `translation/glossary.yaml` 與 `translation/style-guide.yaml`。
6. 本批涉及的 canonical English source 與對應 `translation/zh-TW/**/*.yaml`。

若 task 是 Batch 規劃、handoff、review、correction 或 closeout，亦須先載入 `skills/project-review/SKILL.md`。

不要為單一 entity 載入整套規則書或所有 translation data。

## Authority model

不同種類的資料有不同 authority，不得混用：

```text
英文規則語意
→ docs/content/SOURCE-POLICY.md 的來源順位
→ pinned source
→ canonical English content

共用繁中正式術語
→ translation/glossary.yaml

繁中書寫與格式
→ translation/style-guide.yaml

特定 entity 的核准文字
→ translation/zh-TW/**/*.yaml
→ status: APPROVED
```

Owner 的新決定只有在固化至 Issue、Batch Contract、ADR 或 repository authority 後，才可供後續 Agent 使用。若 authority 衝突且會影響語意，停止並請 Owner 裁定。

舊版專案翻譯、舊角色紙、既有 Draw Steel 繁中資料及其他 legacy material 都只是 reference input。必須逐項對照目前 pinned English source、依 glossary/style guide 整理並經人工審核後，才能成為 repository authority；不得因文字已存在就直接視為核准。

## Responsibility boundaries

| Data | Authority / owner |
|---|---|
| English canonical name/text | canonical layer |
| English aliases/search synonyms | canonical/search metadata |
| zh-TW display translation | translation layer |
| zh-TW aliases/search synonyms | localization/search metadata |
| shared formal zh-TW terminology | `translation/glossary.yaml` |
| punctuation, number formatting, keyword/text style | `translation/style-guide.yaml` |

Glossary 中允許的術語變體不是 search alias schema。除非 Batch Contract 明確授權，不新增或推定 alias/search 欄位。

## Status workflow

```text
DRAFT
  ↓
REVIEW
  ↓ human review against authoritative English source
APPROVED
```

- Agent 可新增或修改 `DRAFT`、整理成 `REVIEW`，並執行來源與一致性檢查。
- 只有人類 reviewer 對 authoritative English source 完成審核後，才可授權 `APPROVED`。Agent 不得自行做此語意決策。
- 新正式中文遊戲術語、正式譯名或會改變語意的翻譯選擇，必須由 Owner 決定並固化；缺少決定時停止，不得自行補完。

## Source changes and `STALE`

翻譯 entry 的 `sourceVersion` / `sourceHash` 必須對應本批使用的 canonical source。偵測到版本或 hash 不符時：

1. 不得沿用既有 `APPROVED` 判定。
2. 將該翻譯視為 `STALE`，直到重新比對 authoritative English source。
3. 依正常人工審核流程回到 `APPROVED`。

現行 validator 負責偵測 mismatch，不會自動改寫檔案。除非另有核准 Batch，不修改 hash 演算法、schema 或 validator/runtime behavior。

## Task workflow

1. 固定 Batch scope、authority、base、acceptance、Git 權限與停止條件。
2. 選定最小 canonical batch，確認 pinned source、版本與 provenance。
3. 載入相關 glossary/style rules；沒有已核准術語時，不自行建立正式譯名。
4. 只在 translation layer 草擬或修訂；不得用翻譯反向改寫 canonical mechanics。
5. 保存 stable ID 與適用的 source version/hash，並設定符合實際審核階段的 status。
6. 執行 Batch Contract 指定的 YAML parse、content validation、diff 與 scope checks。
7. 回報未決術語、source mismatch、deviations 與 exact evidence，然後依 Batch Contract 停止。

## Stop conditions

遇到下列情況停止並精準回報：

- 需要新的正式中文遊戲術語或其他 Owner 語意決策。
- 英文 authority 互相衝突，且現有來源順位無法解決。
- canonical source、版本或 provenance 無法確認。
- 完成工作必須修改 Batch Contract scope 外的 canonical data、schema、source lock、validator 或 runtime behavior。
