# Architecture

## 1. Architectural goal

把《英雄爭鋒》拆成可獨立維護的 Content、Domain 與 Presentation 三層，讓 Draw Steel 改版、翻譯更新或 UI 重做時不必重寫整個系統。

```text
Official rules / pinned upstream data
            ↓
     Content Pipeline
            ↓
 Canonical Content + zh-TW Translation
            ↓
 ┌────────────────────┬────────────────────┐
 │ Character Domain   │ Rules Reference    │
 │ calculate/validate │ index/cross-link   │
 └────────────────────┴────────────────────┘
            ↓
          Web UI
```

## 2. Target stack

Batch 001 不初始化實作，但目前目標 stack 為：

- Astro：靜態內容與 routing。
- React：Character Builder 等需要互動狀態的 islands。
- TypeScript：domain 與 tooling。
- Zod：runtime schema validation。
- YAML：human-authorable canonical / translation content。
- Pagefind：靜態 Rules Reference 搜尋，需驗證繁中 segmentation 品質。
- Vitest：schema / domain / unit tests。
- Playwright：少量重要 end-to-end flow。
- Static hosting 優先；第一版不依賴 application server。

若 Batch 002 實作發現 stack 不適合，可用 ADR 修改，不把本文件當不可變技術教條。

## 3. Repository boundaries

預期責任分區：

```text
schemas/                shared validation contracts
content/canonical/     website canonical game/rule data
translation/zh-TW/    zh-TW localized fields keyed by stable id
src/domain/character/  creation, advancement, calculation, validation
src/domain/rules/      rule lookup/link semantics where needed
src/features/          user-facing feature modules
scripts/import/        upstream import/normalization
scripts/validate/      content and translation validation
tests/fixtures/        golden source/character fixtures
```

具體目錄在 Batch 002 建立時可微調，但 layer boundary 不應反轉。

## 4. Character domain

角色資料應保存選擇與版本，而不是把所有衍生值當唯一 truth。

概念 API：

```ts
createCharacter(context)
getAvailableChoices(character, content)
applyChoice(character, choice, content)
getAdvancementChoices(character, targetLevel, content)
advanceCharacter(character, targetLevel, choices, content)
calculateCharacter(character, content)
validateCharacter(character, content)
serializeCharacter(character)
deserializeCharacter(payload)
```

Domain layer 不依賴 React、Astro、browser storage 或 routing。

## 5. Persistence

MVP 採 Local-first：

- 瀏覽器 local storage / IndexedDB 的選擇留到實作時依資料大小決定。
- JSON 是可攜 interchange format。
- Share URL 可以封裝／壓縮角色選擇，但不得把完整規則內容複製進 URL。
- Character payload 至少帶 `schemaVersion`、`rulesVersion`、`contentVersion`。

## 6. Rules Reference

規則頁採靜態內容優先。每個可分享條目應有穩定 ID 與 route，並支援中英文 alias 與 cross-reference。

Character Builder 與 Reference 可共用 entity ID，但不應共用 presentation schema。

## 7. Versioning

上游來源以 `sources.lock` 類機制 pin 住版本或 commit。升版必須是一個明確 task：

`old pinned source → new pinned source → diff → canonical update → translation stale detection → validation`

Runtime 不直接讀 GitHub `main` 或遠端 PDF 最新版。
